import { Task } from './task.ts';
import { isExecutor, isNeeds, toExecutor } from './utils.ts';

import type { Executor, ExecutorOrOptions, Needs, NeedsOrExecutor, Options, TaskDefinition, TaskParams } from './types.ts';

/**
 * Creates a new task.
 *
 * @param {String | Task | TaskParams} param1
 * @param {Needs | Command | Code} param2
 * @param {Command | Code | Options} param3
 * @param {Options} param4
 *
 * @returns {Task} The reference to the created task.
 */
export const task: TaskDefinition = (param1: string | Task | TaskParams, param2?: NeedsOrExecutor, param3?: ExecutorOrOptions, param4?: Options): Task => {
  if (param1 instanceof Task) {
    return param1 as Task;
  }

  if (typeof param1 === 'object') {
    return new Task(param1.name, param1.needs, param1.executor, param1.options);
  }

  let needs: Array<string> = [];
  if (isNeeds(param2)) {
    needs = (param2 as Needs).values.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  let executor: Executor = undefined as unknown as Executor;
  if (isExecutor(param3)) {
    executor = toExecutor(param3);
  } else if (isExecutor(param2)) {
    executor = toExecutor(param2);
  }

  let options: Options = undefined as unknown as Options;
  if (typeof param3 === 'object') {
    options = param3 as Options;
  } else if (typeof param4 === 'object') {
    options = param4;
  }

  return new Task(param1, needs, executor, options);
};
