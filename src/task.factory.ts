import { Task } from './task.ts';
import { isExecutor, isNeeds } from './helper.ts';

import type { Executor, ExecutorOrOptions, Needs, NeedsOrExecutor, Options, TaskDefinition, TaskParams } from './definitions.ts';

const toExecutor = (param?: NeedsOrExecutor | ExecutorOrOptions): Executor => {
  return (isExecutor(param) ? param : undefined as unknown) as Executor;
};

/**
 * Creates a new task.
 *
 * @param param1 {string | Task | TaskParams}
 * @param param2 {Needs | Command | Code}
 * @param param3 {Command | Code | Options}
 * @param param4 {Options}
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

  const instance: Task = new Task(param1, needs, executor, options);

  return instance as Task;
};
