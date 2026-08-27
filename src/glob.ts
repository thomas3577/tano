// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module contains a function to compute a hash by glob.
 *
 * @module
 */

import { isAbsolute, normalize, relative, resolve } from '@std/path';
import type { GlobOptions } from '@std/path';
import { globToRegExp, joinGlobs, normalizeGlob } from '@std/path';
import { walk } from '@std/fs/walk';
import type { WalkEntry, WalkOptions } from '@std/fs/walk';
import type { TGlobHashOptionsStrict, TGlobHashSource } from './types.ts';

/**
 * Directories that are never walked.
 *
 * @remarks
 * A recursive glob would otherwise reach the git index, installed packages and tano's own cache. All three change without the sources of a task changing, which would make the hash useless.
 */
const skip: RegExp[] = [/[\\/]\.git([\\/]|$)/, /[\\/]node_modules([\\/]|$)/, /[\\/]\.tano([\\/]|$)/];

/**
 * Hashes bytes with SHA-256.
 *
 * @param {Uint8Array} data - The bytes to hash.
 *
 * @returns {Promise<string>} The hash as a hex string.
 */
const digest = async (data: Uint8Array<ArrayBufferLike>): Promise<string> => {
  const arrayBuffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', data as Uint8Array<ArrayBuffer>);

  return Array.from(new Uint8Array(arrayBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
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
    globstar: true,
    caseInsensitive: false,
  };

  const files: string[] = [];
  const match: RegExp[] = globs.map((glob) => globToRegExp(isAbsolute(glob) ? normalizeGlob(glob) : joinGlobs([root, glob], globToRegExpOptions), globToRegExpOptions));

  const options: WalkOptions = { match, skip };
  const iterator: AsyncIterableIterator<WalkEntry> = walk(root, options);

  for await (const entry of iterator) {
    if (entry.isFile) {
      files.push(resolve(normalize(entry.path)));
    }
  }

  return files;
};

/**
 * Hashes the contents of the given files, each together with its path relative to the root.
 *
 * @remarks
 * The content is hashed instead of the file metadata, because inode and modification time are new after a fresh clone and `dev` and `ino` are unavailable on Windows, which made the cache unable to ever hit in CI. The path is taken relative to the root so that the same sources hash equally no matter where they are checked out.
 *
 * @param {string} root - The directory the paths are relative to.
 * @param {Array<string>} paths - The files to hash, in a stable order.
 *
 * @returns {Promise<string>} A promise to hash the input.
 */
const hashFiles = async (root: string, paths: string[]): Promise<string> => {
  const lines: string[] = [];

  for (const path of paths) {
    const content: Uint8Array = await Deno.readFile(path);

    lines.push(`${relative(root, path).replaceAll('\\', '/')} ${await digest(content)}`);
  }

  return await digest(new TextEncoder().encode(lines.join('\n')));
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

  const files: string[] = [...new Set(includes.filter((item: string) => !excludes.includes(item)))];

  if (files.length === 0) {
    return undefined;
  }

  files.sort((a, b) => a.localeCompare(b));

  return await hashFiles(options.root, files);
};
