import { CodeFile, Executor, ExecutorOrOptions, Needs, NeedsOrExecutor } from './definitions.ts';

export const isNeeds = (param?: NeedsOrExecutor): boolean => {
  return typeof param === 'object' && !(param as CodeFile)?.file && Array.isArray((param as Needs)?.values);
};

export const isExecutor = (param?: NeedsOrExecutor | ExecutorOrOptions): boolean => {
  return isCommand(param as Executor) || isCode(param as Executor);
};

export const isCommand = (commandOrCode?: Executor): boolean => {
  return typeof commandOrCode === 'string' || (typeof commandOrCode === 'object' && Array.isArray(commandOrCode));
};

export const isCode = (commandOrCode?: Executor) => {
  return (typeof commandOrCode === 'object' && (commandOrCode as CodeFile).file !== undefined) || typeof commandOrCode === 'function';
};
