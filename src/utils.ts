import type { Code, CodeFile, Command, Executor, ExecutorOrOptions, Needs, NeedsOrExecutor } from './definitions.ts';

export const isNeeds = (param?: NeedsOrExecutor): boolean => {
  return typeof param === 'object' && !(param as CodeFile)?.file && Array.isArray((param as Needs)?.values);
};

export const isExecutor = (param?: NeedsOrExecutor | ExecutorOrOptions): boolean => {
  return isCommand(param as Executor) || isCode(param as Executor);
};

export const isCommand = (executor?: Executor): boolean => {
  return typeof executor === 'string' || (typeof executor === 'object' && Array.isArray(executor));
};

export const isCode = (executor?: Executor): boolean => {
  return !!executor && (isCodeFile(executor as CodeFile) || typeof executor === 'function');
};

export const isCodeFile = (codeFile: CodeFile): boolean => {
  return typeof codeFile === 'object' &&
    !!codeFile.file &&
    (typeof codeFile.file === 'string' && codeFile.file.match(/\.js|\.ts$/) !== null || codeFile.file instanceof URL && codeFile.file.toString().match(/\.js|\.ts$/) !== null);
};

export const toExecutor = (param?: NeedsOrExecutor | ExecutorOrOptions): Executor => {
  return (isExecutor(param) ? param : undefined as unknown) as Executor;
};

export const toCommand = (executor?: Executor): Command => {
  return (isCommand(executor) ? executor : undefined as unknown) as Command;
};

export const toCode = (executor?: Executor): Code => {
  return (isCode(executor) ? executor : undefined as unknown) as Code;
};
