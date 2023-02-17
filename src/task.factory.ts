import { Task } from './task.ts';

import type { Code, Command, CommandOrCodeOrOptions, ICodeFile, INeeds, ITask, ITaskParams, NeedsOrCommandOrCode, Options, TaskDefinition } from './definitions.ts';

export const task: TaskDefinition = (nameOrTask: string | ITask | ITaskParams, param1?: NeedsOrCommandOrCode, param2?: CommandOrCodeOrOptions, param3?: Options): ITask => {
  if (nameOrTask instanceof Task) {
    return nameOrTask;
  }

  if (typeof nameOrTask === 'object') {
    return new Task(nameOrTask.name, nameOrTask.needs, nameOrTask.command, nameOrTask.code, nameOrTask.options);
  }

  let needs: Array<string> = [];
  if (typeof param1 === 'object' && !(param1 as ICodeFile)?.file && Array.isArray((param1 as INeeds)?.values)) {
    needs = (param1 as INeeds).values.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  let command: Command = undefined as unknown as Command;
  if (typeof param2 === 'string') {
    command = param2;
  } else if (typeof param1 === 'string') {
    command = param1;
  }

  let code: Code = undefined as unknown as Code;
  if (typeof param1 === 'function' || (param1 as unknown as ICodeFile)?.file) {
    code = param1 as Code;
  } else if (typeof param2 === 'function' || (param2 as unknown as ICodeFile)?.file) {
    code = param2 as Code;
  }

  let options: Options = undefined as unknown as Options;
  if (typeof param2 === 'object') {
    options = param2 as Options;
  } else if (typeof param3 === 'object') {
    options = param3;
  }

  const instance: ITask = new Task(nameOrTask, needs, command, code, options);

  return instance;
};
