import { normalize, resolve } from 'std/path/mod.ts';
import * as glob from 'std/path/glob.ts';
import { walk, WalkEntry } from 'std/fs/walk.ts';

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
 * Resolves an array of globs to a sorted array of file paths.
 *
 * @param {Array<String>} globs An array of globs.
 * @param {String} jailPath The jail path.
 *
 * @returns {Promise<Array<string>>} A promise to resolve the globs.
 */
export const resolveGlobs = async (globs: string[], jailPath: string): Promise<string[]> => {
  const files: string[] = [];
  const match: RegExp[] = globs.map((g) => glob.globToRegExp(g));
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
export const hashFiles = async (fileInfos: Deno.FileInfo[]): Promise<string> => {
  const algorithm: AlgorithmIdentifier = 'SHA-256';
  const keys: string[] = fileInfos.map((fileInfo) => [fileInfo.dev, fileInfo.ino, fileInfo.size, fileInfo.mtime].join('-'));
  const encoded: Uint8Array = new TextEncoder().encode(keys.join('\n'));
  const arrayBuffer: ArrayBuffer = await crypto.subtle.digest(algorithm, encoded);
  const hash: string = Array.from(new Uint8Array(arrayBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

  return hash;
};
