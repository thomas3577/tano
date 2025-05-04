// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * This module contains a function to compute a hash by glob.
 *
 * @module
 */

import { normalize, resolve } from '@std/path';
import type { GlobOptions } from '@std/path';
import { globToRegExp, normalizeGlob } from '@std/path';
import { walk } from '@std/fs/walk';
import type { WalkEntry, WalkOptions } from '@std/fs/walk';
import type { TGlobHashOptionsStrict, TGlobHashSource } from './types.ts';

/**
 * Gets a list files infos.
 *
 * @param {Array<string>} paths - An array of paths.
 *
 * @returns {Promise<Array<Deno.FileInfo>>} filtered list of file infos.
 */
const getFileInfos = async (paths: string[]): Promise<Deno.FileInfo[]> => {
  const promises: Promise<Deno.FileInfo>[] = paths.map((path: string) => Deno.stat(path));
  const fileInfos: Deno.FileInfo[] = [];

  for (const promise of promises) {
    await promise.then((fileInfo) => fileInfos.push(fileInfo));
  }

  return fileInfos;
};

/**
 * Resolves an array of globs to a sorted array of file paths.
 *
 * @param {Array<string>} globs - An array of globs.
 * @param {string} root - The root path.
 * @param {GlobOptions} globToRegExpOptions - Options for the GlobToRegExp
 *
 * @returns {Promise<Array<string>>} A promise to resolve the globs.
 */
const resolveGlobs = async (globs: string[], root: string, globToRegExpOptions?: GlobOptions): Promise<string[]> => {
  globToRegExpOptions = globToRegExpOptions || {
    globstar: false,
    caseInsensitive: false,
  };

  const files: string[] = [];
  const match: RegExp[] = globs.map((g) => globToRegExp(resolve(normalizeGlob(g)), globToRegExpOptions));

  const options: WalkOptions = { match };
  const iterator: AsyncIterableIterator<WalkEntry> = walk(root, options);

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
 * @param {Array<Deno.FileInfo>} fileInfos - An array of file infos.
 *
 * @returns {Promise<string>} A promise to hash the input.
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
 * @param {TGlobHashSource} source - A boolean, string, array of string or the GlobHashSource.
 * @param {Array<string>} additionalExcludes - Additional excludes only for internals.
 *
 * @returns {TGlobHashOptionsStrict} An object of type GlobHashOptionsStrict.
 */
const parseOptions = (source?: TGlobHashSource, additionalExcludes?: string[]): undefined | TGlobHashOptionsStrict => {
  if (!source) {
    return undefined;
  }

  if (typeof source === 'boolean' && source === true) {
    source = ['**'];
  }

  if (typeof source === 'string') {
    source = [source];
  }

  if (Array.isArray(source)) {
    source = {
      include: source,
    };
  }

  const options: TGlobHashOptionsStrict = source as TGlobHashOptionsStrict;

  options.root = resolve(normalize(source?.root || '.'));
  options.exclude = [...(options.exclude || []), ...(additionalExcludes || [])];

  return options;
};

/**
 * Creates a hash by glob options.
 *
 * @param {TGlobHashSource} source - A string, Array of string or the GlobHashOptions.
 * @param {Array<string>} additionalExcludes - Additional excludes only for internals.
 *
 * @returns {string} A computed hash
 */
export const computeHash = async (source?: TGlobHashSource, additionalExcludes?: string[]): Promise<undefined | string> => {
  const options: undefined | TGlobHashOptionsStrict = parseOptions(source, additionalExcludes);
  if (!options) {
    return undefined;
  }

  const includes: string[] = await resolveGlobs(options.include, options.root, options.globToRegExpOptions);
  const excludes: string[] = await resolveGlobs(options.exclude || [], options.root, options.globToRegExpOptions);

  const files: string[] = includes
    .filter((item: string) => excludes.indexOf(item) === -1)
    .reduce((memo: string[], next: string) => {
      if (memo.indexOf(next) < 0) {
        memo.push(next);
      }

      return memo;
    }, []);

  if (files.length === 0) {
    throw new Error('No files were matched using the provided globs.');
  }

  files.sort();

  const fileInfos = await getFileInfos(files);

  return await hashFiles(fileInfos);
};
