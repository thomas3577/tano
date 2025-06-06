// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * This module contains functions for type checks, type conversions and other helpers.
 *
 * @module
 */

import { dirname, fromFileUrl, isAbsolute, join, toFileUrl } from '@std/path';
import type { TCode, TCodeFile, TCommand, TExecutor, TExecutorOrOptions, TNeeds, TNeedsOrExecutor } from './types.ts';

/**
 * Checks if a parameter is of type `Needs`.
 *
 * @example Returns `true` if the parameter is of type `Needs` with a list of Task-Names.
 * ```ts
 * const value = {
 *   values: ['myTask01', 'myTask02']
 * };
 *
 * const result = isNeeds(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is of type `Needs` with a list of Tasks.
 * ```ts
 * const task = {
 *   name: 'myTask01',
 *   needs: ['myTask03']
 * };
 *
 * const value = {
 *   values: [task]
 * };
 *
 * const result = isNeeds(value); // true
 * ```
 *
 * @param {object} param - A object to check.
 *
 * @returns {boolean} if `true` the object is of type `Needs`.
 */
export const isNeeds = (param?: TNeedsOrExecutor): boolean => {
  return typeof param === 'object' && !(param as TCodeFile)?.file && Array.isArray((param as TNeeds)?.values);
};

/**
 * Checks if a parameter is of type `Executor`.
 *
 * @example Returns `true` if the parameter is a command executer (using a string array).
 * ```ts
 * const value = ['bash', '-c', 'ls -la'];
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a command executer (using a string).
 * ```ts
 * const value = 'bash -c ls -la';
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a JavaScript).
 * ```ts
 * const value = () => console.log('Hello World!');
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a JavaScript).
 * ```ts
 * const value = done => {
 *   setTimeout(() => {
 *     console.log('Hello World!');
 *     done();
 *   }, 1000);
 * };
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a JavaScript File).
 * ```ts
 * const value = './myTask.js';
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a TypeScript File).
 * ```ts
 * const value = './myTask.ts';
 *
 * const result = isExecutor(value); // true
 * ```
 *
 * @param {object} param - A object to check.
 *
 * @returns {boolean} if `true` the object is of type `Executor`.
 */
export const isExecutor = (param?: TNeedsOrExecutor | TExecutorOrOptions): boolean => {
  return isCommand(param as TExecutor) || isCode(param as TExecutor);
};

/**
 * Checks if a parameter is of type `Command`.
 *
 * @example Returns `true` if the parameter is a command.
 * ```ts
 * const value = 'bash -c ls -la';
 *
 * const result = isCommand(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a command.
 * ```ts
 * const value = ['bash', '-c', 'ls -la'];;
 *
 * const result = isCommand(value); // true
 * ```
 *
 * @param {object} param - A object to check.
 *
 * @returns {boolean} if `true` the object is of type `Command`.
 */
export const isCommand = (param?: TExecutor): boolean => {
  return typeof param === 'string' || (typeof param === 'object' && Array.isArray(param));
};

/**
 * Checks if a parameter is of type `Code`.
 *
 * @example Returns `true` if the parameter is a code executer (using a JavaScript).
 * ```ts
 * const value = () => console.log('Hello World!');
 *
 * const result = isCode(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a JavaScript).
 * ```ts
 * const value = done => {
 *   setTimeout(() => {
 *     console.log('Hello World!');
 *     done();
 *   }, 1000);
 * };
 *
 * const result = isCode(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a JavaScript File).
 * ```ts
 * const value = './myTask.js';
 *
 * const result = isCode(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a TypeScript File).
 * ```ts
 * const value = './myTask.ts';
 *
 * const result = isCode(value); // true
 * ```
 *
 * @param {object} param - A object to check.
 *
 * @returns {boolean} if `true` the object is of type `Code`.
 */
export const isCode = (param?: TExecutor): boolean => {
  return !!param && (isCodeFile(param as TCodeFile) || typeof param === 'function');
};

/**
 * Checks if a parameter is of type `CodeFile`.
 *
 * @example Returns `true` if the parameter is a JavaScript File.
 * ```ts
 * const value = './myTask.js';
 *
 * const result = isCodeFile(value); // true
 * ```
 *
 * @example Returns `true` if the parameter is a code executer (using a TypeScript File).
 * ```ts
 * const value = './myTask.ts';
 *
 * const result = isCodeFile(value); // true
 * ```
 *
 * @param {object} param - A object to check.
 *
 * @returns {boolean} if `true` the object is of type `CodeFile`.
 */
export const isCodeFile = (param: TCodeFile): boolean => {
  const regex = new RegExp(/\.(js|ts)$/);

  return typeof param === 'object' &&
    !!param.file &&
    (typeof param.file === 'string' && regex.exec(param.file) !== null || param.file instanceof URL && regex.exec(param.file.toString()) !== null);
};

/**
 * Just a converter that converts Objects of type NeedsOrExecutor or ExecutorOrOptions to Executor.
 *
 * @param {object} param - A object to convert.
 *
 * @returns {object} An object of type Executor.
 */
export const toExecutor = (param?: TNeedsOrExecutor | TExecutorOrOptions): TExecutor => {
  return (isExecutor(param) ? param : undefined as unknown) as TExecutor;
};

/**
 * Just a converter that converts Objects of type Executor to Command.
 *
 * @param {object} param - A object to convert.
 *
 * @returns {object} An object of type Command.
 */
export const toCommand = (param?: TExecutor): TCommand => {
  return (isCommand(param) ? param : undefined as unknown) as TCommand;
};

/**
 * Just a converter that converts Objects of type Executor to Code.
 *
 * @param {object} param - A object to convert.
 *
 * @returns {object} An object of type Code.
 */
export const toCode = (param?: TExecutor): TCode => {
  return (isCode(param) ? param : undefined as unknown) as TCode;
};

/**
 * Gets a valid import url.
 * @param {string} fileOrUrl - A path or URL to a tanofile.
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
 * @param {string} importUrl - A valid import url.
 *
 * @returns {string} The CWD.
 */
export const getCwd = (importUrl?: string): string => {
  if (!importUrl?.startsWith('file:')) {
    return Deno.cwd();
  }

  const importPath: string = fromFileUrl(importUrl);
  const importDirectory: string = dirname(importPath);

  return importDirectory;
};

/**
 * Converts a string to snake case.
 *
 * @param {string} value - The string to convert.
 *
 * @returns {string | undefined} The converted string.
 */
export const toSnakeCase = (value: string): string | undefined => {
  const words = value.match(/[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)/g);

  return words?.join('_');
};
