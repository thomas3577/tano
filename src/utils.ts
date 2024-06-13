/**
 * This module contains functions for type checks, type conversions and other helpers.
 * @module
 */

import { dirname, fromFileUrl, isAbsolute, join, toFileUrl } from '@std/path';

import type { Code, CodeFile, Command, Executor, ExecutorOrOptions, Needs, NeedsOrExecutor } from './types.ts';

/**
 * Checks if a parameter is of type `Needs`.
 *
 * @example Returns `true` if the parameter is of type `Needs` with a list of Task-Names.
 * ```ts
 * const value: Needs = {
 *   values: ['myTask01', 'myTask02']
 * };
 *
 * const result = isNeeds(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is of type `Needs` with a list of Tasks.
 * ```ts
 * const task: TaskParams = {
 *   name: 'myTask01',
 *   needs: ['myTask03']
 * };
 *
 * const value: Needs = {
 *   values: [TaskParams]
 * };
 *
 * const result = isNeeds(value); // true
 * ```
 *
 * @param {Object} param - A object to check.
 *
 * @returns {Boolean} if `true` the object is of type `Needs`.
 */
export const isNeeds = (param?: NeedsOrExecutor): boolean => {
  return typeof param === 'object' && !(param as CodeFile)?.file && Array.isArray((param as Needs)?.values);
};

/**
 * Checks if a parameter is of type `Executor`.
 *
 * @example Returns `true` if the parameter is command executer (using a string array).
 * ```ts
 * const value: Command = ['bash', '-c', 'ls -la'];
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is command executer (using a string).
 * ```ts
 * const value: Command = 'bash -c ls -la';
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is code executer (using a JavaScript).
 * ```ts
 * const value: Code = () => console.log('Hello World!');
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is code executer (using a JavaScript).
 * ```ts
 * const value: Code = done => {
 *   setTimeout(() => {
 *     console.log('Hello World!');
 *     done();
 *   }, 1000);
 * };
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is code executer (using a JavaScript File).
 * ```ts
 * const value: Code = './myTask.js';
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @param {Object} param - A object to check.
 *
 * @returns {Boolean} if `true` the object is of type `Executor`.
 */
export const isExecutor = (param?: NeedsOrExecutor | ExecutorOrOptions): boolean => {
  return isCommand(param as Executor) || isCode(param as Executor);
};

/**
 * Checks if a parameter is of type `Command`.
 *
 * @param {Object} param - A object to check.
 *
 * @returns {Boolean} if `true` the object is of type `Command`.
 */
export const isCommand = (param?: Executor): boolean => {
  return typeof param === 'string' || (typeof param === 'object' && Array.isArray(param));
};

/**
 * Checks if a parameter is of type `Code`.
 *
 * @param {Object} param - A object to check.
 *
 * @returns {Boolean} if `true` the object is of type `Code`.
 */
export const isCode = (param?: Executor): boolean => {
  return !!param && (isCodeFile(param as CodeFile) || typeof param === 'function');
};

/**
 * Checks if a parameter is of type `CodeFile`.
 *
 * @param {Object} param - A object to check.
 *
 * @returns {Boolean} if `true` the object is of type `CodeFile`.
 */
export const isCodeFile = (param: CodeFile): boolean => {
  const regex = new RegExp(/\.(js|ts)$/);

  return typeof param === 'object' &&
    !!param.file &&
    (typeof param.file === 'string' && regex.exec(param.file) !== null || param.file instanceof URL && regex.exec(param.file.toString()) !== null);
};

/**
 * Just a converter that converts Objects of type NeedsOrExecutor or ExecutorOrOptions to Executor.
 *
 * @param {Object} param - A object to convert.
 *
 * @returns {Object} An object of type Executor.
 */
export const toExecutor = (param?: NeedsOrExecutor | ExecutorOrOptions): Executor => {
  return (isExecutor(param) ? param : undefined as unknown) as Executor;
};

/**
 * Just a converter that converts Objects of type Executor to Command.
 *
 * @param {Object} param - A object to convert.
 *
 * @returns {Object} An object of type Command.
 */
export const toCommand = (param?: Executor): Command => {
  return (isCommand(param) ? param : undefined as unknown) as Command;
};

/**
 * Just a converter that converts Objects of type Executor to Code.
 *
 * @param {Object} param - A object to convert.
 *
 * @returns {Object} An object of type Code.
 */
export const toCode = (param?: Executor): Code => {
  return (isCode(param) ? param : undefined as unknown) as Code;
};

/**
 * Gets a valid import url.
 * @param {String} fileOrUrl - A path or URL to a tanofile.
 *
 * @returns A valid import url.
 */
export const getImportUrl = async (fileOrUrl: string): Promise<string> => {
  let importUrl: null | URL = null;

  try {
    importUrl = new URL(fileOrUrl);
  } catch (_: unknown) {
    const importFile: string = fileOrUrl;
    const importPath: string = isAbsolute(importFile) ? importFile : join(Deno.cwd(), importFile);

    try {
      const stat: null | Deno.FileInfo = await Deno.stat(importPath).catch(() => (null));
      if (!stat?.isFile) {
        throw new Error(`The path '${importPath}' is not a file.`);
      }
    } catch (err: unknown) {
      throw err;
    }

    importUrl = toFileUrl(importPath);
  }

  return importUrl.toString();
};

/**
 * Gets the current working directory depens on the import url.
 *
 * @param {String} importUrl - A valid import url.
 *
 * @returns {String} The CWD.
 */
export const getCwd = (importUrl?: string): string => {
  if (!importUrl?.startsWith('file:')) {
    return Deno.cwd();
  }

  const importPath: string = fromFileUrl(importUrl);
  const importDirectory: string = dirname(importPath);

  return importDirectory;
};
