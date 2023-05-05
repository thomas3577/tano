import type { Code, CodeFile, Command, Executor, ExecutorOrOptions, Needs, NeedsOrExecutor } from './types.ts';

/**
 * Checks if a parameter is of type `Needs`.
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
  return typeof param === 'object' &&
    !!param.file &&
    (typeof param.file === 'string' && param.file.match(/\.js|\.ts$/) !== null || param.file instanceof URL && param.file.toString().match(/\.js|\.ts$/) !== null);
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
 * Strictly sequential processing of Promises.
 *
 * @param {Array<Promise<T>>} promises - A list of promises.
 *
 * @returns {Iterable<Promise<T>>} - A iterable list of promises.
 */
export const sequential = <T>(promises: Promise<T>[]): Iterable<Promise<T>> => {
  let counter = 0;

  return (function* (): Iterable<Promise<T>> {
    while (++counter < promises.length) {
      yield promises[counter];
    }
  })();
};
