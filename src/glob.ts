import { normalize, resolve } from 'std/path/mod.ts';
import { globToRegExp } from 'std/path/glob.ts';
import { walk, WalkEntry } from 'std/fs/walk.ts';

import { GlobHashOptions, GlobHashOptionsStrict } from './types.ts';

/**
 * Strictly sequential processing of Promises.
 *
 * @param {Array<Promise<T>>} promises A list of promises.
 *
 * @returns {Iterable<Promise<T>>} A iterable list of promises.
 */
const sequential = <T>(promises: Promise<T>[]): Iterable<Promise<T>> => {
  let counter = 0;

  return (function* (): Iterable<Promise<T>> {
    while (++counter < promises.length) {
      yield promises[counter];
    }
  })();
};

/**
 * Gets a list files infos.
 *
 * @param {Array<String>} paths An array of paths.
 *
 * @returns {Promise<Array<Deno.FileInfo>>} filtered list of file infos.
 */
const getFileInfos = async (paths: string[]): Promise<Deno.FileInfo[]> => {
  const promises: Promise<Deno.FileInfo>[] = paths.map((path: string) => Deno.stat(path));
  const fileInfos: Deno.FileInfo[] = [];

  for (const promise of sequential<Deno.FileInfo>(promises)) {
    await promise.then((fileInfo) => fileInfos.push(fileInfo));
  }

  return fileInfos;
};

/**
 * A utility to deny access to files outside
 * a given base path. Works by checking if all
 * the filenames start with the base path.
 *
 * @param {Array} files A list of absolute paths.
 * @param {String} jailPath The jail path.
 *
 * @return {String} An error message, undefined otherwise.
 */
const jail = (files: string[], jailPath: string): Error | undefined => {
  if (!jailPath) {
    return;
  }

  if (typeof jailPath !== 'string') {
    return new Error('Invalid jail path.');
  }

  for (let i = 0; i < files.length; i++) {
    if (files[i].substring(0, jailPath.length) !== jailPath) {
      return new Error('Attemp to read outside the permitted path.');
    }
  }
};

/**
 * Resolves an array of globs to a sorted array of file paths.
 *
 * @param {Array<String>} globs An array of globs.
 * @param {String} jailPath The jail path.
 *
 * @returns {Promise<Array<string>>} A promise to resolve the globs.
 */
const resolveGlobs = async (globs: string[], jailPath: string): Promise<string[]> => {
  const files: string[] = [];
  const match: RegExp[] = globs.map((g) => globToRegExp(g));
  const iterator: AsyncIterableIterator<WalkEntry> = walk(jailPath, { match });

  for await (const entry of iterator) {
    if (entry.isFile) {
      files.push(resolve(normalize(entry.path)));
    }
  }

  return files;
};

/**
 * Hashes the contents of an array of file infos.
 *
 * @param {Array<Deno.FileInfo>} fileInfos An array of file infos.
 *
 * @returns {Promise<String>} A promise to hash the input.
 */
const hashFiles = async (fileInfos: Deno.FileInfo[]): Promise<string> => {
  const algorithm: AlgorithmIdentifier = 'SHA-256';
  const keys: string[] = fileInfos.map((fileInfo) => [fileInfo.dev, fileInfo.ino, fileInfo.size, fileInfo.mtime].join('-'));
  const encoded: Uint8Array = new TextEncoder().encode(keys.join('\n'));
  const arrayBuffer: ArrayBuffer = await crypto.subtle.digest(algorithm, encoded);
  const hash: string = Array.from(new Uint8Array(arrayBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

  return hash;
};

/**
 * Parsed `source` and converts a strict glob-hash options object.
 *
 * @param source A string, Array of string or the GlobHashOptions.
 *
 * @returns An object of type GlobHashOptionsStrict.
 */
const parseOptions = (source?: string | string[] | GlobHashOptions): undefined | GlobHashOptionsStrict => {
  if (!source) {
    return undefined;
  }

  if (typeof source === 'string') {
    source = [source];
  }

  if (Array.isArray(source)) {
    source = {
      include: source,
    };
  }

  const options: GlobHashOptionsStrict = {
    ...source,
    jail: resolve(normalize(source.jail || '.')),
  };

  return options;
};

/**
 * Creates a hash by glob options.
 *
 * @param source A string, Array of string or the GlobHashOptions.
 *
 * @returns {String} A computed hash
 */
export const computeHash = async (source?: string | string[] | GlobHashOptions): Promise<undefined | string> => {
  const options: undefined | GlobHashOptionsStrict = parseOptions(source);
  if (!options) {
    return undefined;
  }

  const includes: string[] = await resolveGlobs(options.include, options.jail);
  const excludes: string[] = await resolveGlobs(options.exclude || [], options.jail);

  const files: string[] = includes
    .filter((item: string) => excludes.indexOf(item) === -1)
    .reduce((memo: string[], next: string) => {
      if (memo.indexOf(next) < 0) {
        memo.push(next);
      }

      return memo;
    }, []);

  const jailError: Error | undefined = jail(files, options.jail);
  if (jailError) {
    throw jailError;
  }

  if (files.length === 0) {
    throw new Error('No files were matched using the provided globs.');
  }

  files.sort();

  const fileInfos = await getFileInfos(files);

  return await hashFiles(fileInfos);
};
