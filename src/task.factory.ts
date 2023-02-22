import { Task } from './task.ts';

import type { Code, Command, CommandOrCodeOrOptions, Executor, ICodeFile, INeeds, ITask, ITaskParams, NeedsOrCommandOrCode, Options, TaskDefinition } from './definitions.ts';

/**
 * Creates a new task.
 *
 * @param param1 {string | ITask | ITaskParams}
 * @param param2 {Command | Code | INeeds}
 * @param param3 {Command | Code | Options}
 * @param param4 {Options}
 *
 * @returns {ITask} The reference to the created task.
 */
export const task: TaskDefinition = (param1: string | ITask | ITaskParams, param2?: NeedsOrCommandOrCode, param3?: CommandOrCodeOrOptions, param4?: Options): ITask => {
  if (param1 instanceof Task) {
    return param1;
  }

  if (typeof param1 === 'object') {
    const executor: Executor = (!param1.command ? param1.code : param1.command) as Executor;

    return new Task(param1.name, param1.needs, executor, param1.options);
  }

  let needs: Array<string> = [];
  if (typeof param2 === 'object' && !(param2 as ICodeFile)?.file && Array.isArray((param2 as INeeds)?.values)) {
    needs = (param2 as INeeds).values.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  let command: Command = undefined as unknown as Command;
  if (typeof param3 === 'string') {
    command = param3;
  } else if (typeof param2 === 'string') {
    command = param2;
  }

  let code: Code = undefined as unknown as Code;
  if (typeof param2 === 'function' || (param2 as unknown as ICodeFile)?.file) {
    code = param2 as Code;
  } else if (typeof param3 === 'function' || (param3 as unknown as ICodeFile)?.file) {
    code = param3 as Code;
  }

  let options: Options = undefined as unknown as Options;
  if (typeof param3 === 'object') {
    options = param3 as Options;
  } else if (typeof param4 === 'object') {
    options = param4;
  }

  const executor: Executor = !command ? code : command;
  const instance: ITask = new Task(param1, needs, executor, options);

  return instance;
};
