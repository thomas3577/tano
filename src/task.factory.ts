// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * This module contains the task function to create new tasks.
 *
 * ```ts
 * import { needs, task } from 'jsr:@dx/tano';
 *
 * task('pre-task', `echo 'These were ...'`);
 * task('default', needs('pre-task'), `echo '...two tasks.'`).run();
 * ```
 *
 * @module
 */

import { Task } from './task.ts';
import { isExecutor, isNeeds, toExecutor } from './utils.ts';
import { logger } from './logger.ts';
import type { TExecutor, TExecutorOrOptions, TNeeds, TNeedsOrExecutor, TOptions, TTaskDefinition, TTaskParams } from './types.ts';

/**
 * Creates a new task.
 *
 * @example Creates a default task which requires another task:
 * ```ts
 * import { needs, task } from 'jsr:@dx/tano';
 *
 * task('pre-task', `echo 'These were ...'`);
 * task('default', needs('pre-task'), `echo '...two tasks.'`).run();
 * ```
 *
 * @param {string | Task | TTaskParams} param1
 * @param {TNeeds | Command | Code} param2
 * @param {Command | Code | TOptions} param3
 * @param {TOptions} param4
 *
 * @returns {Task} - The reference to the created task.
 */
export const task: TTaskDefinition = (param1: string | Task | TTaskParams, param2?: TNeedsOrExecutor, param3?: TExecutorOrOptions, param4?: TOptions): Task => {
  if (param1 instanceof Task) {
    return param1;
  }

  if (typeof param1 === 'object') {
    return new Task(param1.name, param1.needs, param1.executor, param1.options);
  }

  let needs: Array<string> = [];
  if (isNeeds(param2)) {
    needs = (param2 as TNeeds).values.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  let executor: TExecutor = undefined as unknown as TExecutor;
  if (isExecutor(param3)) {
    executor = toExecutor(param3);
  } else if (isExecutor(param2)) {
    executor = toExecutor(param2);
  }

  let options: TOptions = undefined as unknown as TOptions;
  if (typeof param3 === 'object') {
    options = param3 as TOptions;
  } else if (typeof param4 === 'object') {
    options = param4;
  }

  return new Task(param1, needs, executor, options);
};

/**
 * Creates a dummy task.
 *
 * @example The task `task01` is skipped:
 * ```ts
 * import { needs, task, xtask } from 'jsr:@dx/tano';
 *
 * xtask('task01', `echo 'I will be skipped'`);
 * task('default', needs('task01'), `echo 'Just one tasks.'`).run();
 * ```
 *
 * @param {string | Task | TTaskParams} param1
 * @param {TNeeds | Command | Code} _2
 * @param {Command | Code | TOptions} _3
 * @param {TOptions} _4
 *
 * @returns {Task} - The reference to the created task.
 */
export const xtask: TTaskDefinition = (param1: string | Task | TTaskParams, _2?: TNeedsOrExecutor, _3?: TExecutorOrOptions, _4?: TOptions): Task => {
  const log = logger();
  if (typeof param1 === 'object') {
    return new Task(param1.name, null, () => log.warn(`The task '{name}' is not executed because it is an 'xtask'.`, { name: param1.name }));
  }

  return new Task(param1, null, () => log.warn(`The task '{name}' is not executed because it is an 'xtask'.`, { name: param1 }));
};
