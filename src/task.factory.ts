import { Task } from './task.ts';

import type { Command, CommandOrExecutorOrOptions, Executor, ITask, ITaskParams, NeedsOrCommandOrExecutor, Options, TaskDefinition } from './definitions.ts';

export const task: TaskDefinition = (nameOrTask: string | ITask | ITaskParams, param1?: NeedsOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): ITask => {
  if (nameOrTask instanceof Task) {
    return nameOrTask;
  }

  if (typeof nameOrTask === 'object') {
    return new Task(nameOrTask.name, nameOrTask.needs, nameOrTask.command, nameOrTask.executor, nameOrTask.options);
  }

  let needs: Array<string> = [];
  if (typeof param1 === 'object' && Array.isArray(param1?.values)) {
    needs = param1.values.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  let command: Command = undefined as unknown as Command;
  if (typeof param2 === 'string') {
    command = param2;
  } else if (typeof param1 === 'string') {
    command = param1;
  }

  let executor: Executor = undefined as unknown as Executor;
  if (typeof param1 === 'function') {
    executor = param1;
  } else if (typeof param2 === 'function') {
    executor = param2;
  }

  let options: Options = undefined as unknown as Options;
  if (typeof param2 === 'object') {
    options = param2 as Options;
  } else if (typeof param3 === 'object') {
    options = param3;
  }

  const instance: ITask = new Task(nameOrTask, needs, command, executor, options);

  return instance;
};
