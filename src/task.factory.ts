/**
 * @module
 *
 * This module contains the task function to create new tasks.
 *
 * ```ts
 * import { needs, task } from 'jsr:@dx/tano';
 *
 * task('pre-task', `echo 'These were ...'`);
 * task('default', needs('pre-task'), `echo '...two tasks.'`).run();
 * ```
 */

import { Task } from './task.ts';
import { isExecutor, isNeeds, toExecutor } from './utils.ts';
import type { Executor, ExecutorOrOptions, Needs, NeedsOrExecutor, Options, TaskDefinition, TaskParams } from './types.ts';
import { logger } from './logger.ts';

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
    return param1;
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

/**
 * Creates a dummy task.
 *
 * @param {String | Task | TaskParams} param1
 * @param {Needs | Command | Code} _2
 * @param {Command | Code | Options} _3
 * @param {Options} _4
 *
 * @returns {Task} The reference to the created task.
 */
export const xtask: TaskDefinition = (param1: string | Task | TaskParams, _2?: NeedsOrExecutor, _3?: ExecutorOrOptions, _4?: Options): Task => {
  const log = logger();
  if (typeof param1 === 'object') {
    return new Task(param1.name, null, () => log.warn(`The task '{name}' is not executed because it is an 'xtask'.`, { name: param1.name }));
  }

  return new Task(param1, null, () => log.warn(`The task '{name}' is not executed because it is an 'xtask'.`, { name: param1 }));
};
