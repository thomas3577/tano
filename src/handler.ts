// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module provides the task handler class and an initial instance.
 *
 * @module
 */

import { bold, green } from '@std/fmt/colors';
import { format } from '@std/fmt/duration';
import { pooledMap } from '@std/async/pool';
import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import { config } from './config.ts';
import { resetRun } from './abort.ts';
import type { Task } from './task.ts';
import { Changes, ChangesMock } from './changes.ts';
import { VERSION } from './version.ts';
import type { TChanges, TTanoHandler, TTaskRunData, TTaskRunOptions } from './types.ts';

/**
 * The task handler.
 */
class Handler implements TTanoHandler {
  readonly #created: Date = new Date();
  readonly #cache: Map<string, Task> = new Map();
  readonly #eventTarget = new EventTarget();

  #starting: null | PerformanceMark = null;
  #finished: null | PerformanceMark = null;
  #measure: null | PerformanceMeasure = null;
  #changes: null | TChanges = null;
  #abort: boolean = false;
  #options: TTaskRunOptions = {};

  /**
   * Gets the timestamp when the handler was created.
   */
  get created(): Date {
    return this.#created;
  }

  /**
   * Gets the performance mark when the last run starts.
   */
  get starting(): null | PerformanceMark {
    return this.#starting;
  }

  /**
   * Gets the performance mark when the last run ends.
   */
  get finished(): null | PerformanceMark {
    return this.#finished;
  }

  /**
   * Gets the performance measure of the last run.
   */
  get measure(): null | PerformanceMeasure {
    return this.#measure;
  }

  /**
   * Gets the number of tasks that are in the cache.
   */
  get count(): number {
    return this.#cache.size;
  }

  /**
   * Gets all tasks that are in the cache.
   */
  get tasks(): Array<Task> {
    return Array.from(this.#cache.values());
  }

  /**
   * Gets the number of executed tasks.
   */
  get executed(): number {
    return Array.from(this.#cache).filter(([_, value]) => value.status !== 'ready' && value.status !== 'running' && value.status !== 'skipped').length;
  }

  /**
   * Managed the tano data.
   */
  get changes(): null | TChanges {
    if (!this.#changes) {
      if (this.#options.noCache === true) {
        this.#changes = new ChangesMock();
      } else {
        this.#changes = new Changes(config().tanoCwd);
      }
    }

    return this.#changes;
  }

  /**
   * Adds a task to the cache.
   *
   * @param {Task} task - A task to add.
   */
  add(task: Task): void {
    if (this.#cache.has(task.name)) {
      throw new Error(`Task with the name '${task.name}' already exists.`);
    }

    this.#cache.set(task.name, task);
    task.onChanged(this.#emitChanges.bind(this));

    this.#log.debug(`Added task ${task.name}`);
  }

  /**
   * Runs the Task.
   * In the process, all dependent tasks `needs` are executed beforehand.
   *
   * @remarks
   * Rejects if a task name does not exist or if a task failed. With `failFast` disabled every task is attempted first and the error lists all failed tasks.
   *
   * @param {string} taskName - [optionalParam='default'] Name of the task.
   * @param {TTaskRunOptions} options - [optionalParam={ failFast: true, force: false, noCache: false }]
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async run(taskName: string = 'default', options?: TTaskRunOptions): Promise<void> {
    const { failFast, force, noCache } = config();

    this.#options = {
      failFast: options?.failFast ?? failFast,
      force: options?.force ?? force,
      noCache: options?.noCache ?? noCache,
    };

    resetRun();

    await this.#preRun(taskName);

    const failed: Array<string> = [];
    const concurrency: number = Math.max(1, config().concurrency);

    let planned: number = 0;

    try {
      const levels: Array<Array<string>> = this.#getLevels(taskName);

      planned = levels.reduce((count, level) => count + level.length, 0);
      this.#abort = false;

      for (const level of levels) {
        if (this.#abort) {
          break;
        }

        await this.#runLevel(level, concurrency, failed);
      }

      if (failed.length > 0) {
        throw new Error(`Failed tasks: ${failed.join(', ')}`);
      }
    } finally {
      await this.changes?.save();

      this.#postRun(planned === 0 || this.#abort || failed.length > 0);
    }
  }

  /**
   * Resets all tasks so that you can run them again.
   */
  reset(): void {
    this.#cache.forEach((task: Task) => task.reset());
  }

  /**
   * Aborts the execution of the tasks.
   */
  abort(): void {
    this.#abort = true;
  }

  /**
   * Clears the cache. The handler will then have no more tasks to execute.
   */
  clear(): void {
    this.#cache.forEach((task: Task) => task.offChanged(this.#emitChanges.bind(this)));
    this.#cache.clear();
  }

  /**
   * Gets a list of all tasks to be executed in the correct order.
   *
   * @param {string} taskName - Name of the entry task.
   *
   * @returns {Array<string>} - List of the names of all executed tasks
   */
  getPlan(taskName: string): Array<string> {
    return this.#getPlan(taskName);
  }

  /**
   * Gets the tasks to be executed, grouped into levels that can run at the same time.
   *
   * @remarks
   * Two tasks of the same level cannot depend on each other, because a dependency between them would put them at different depths. Every level therefore only has to wait for the level before it.
   *
   * @param {string} taskName - Name of the entry task.
   *
   * @returns {Array<Array<string>>} - The levels, in the order in which they have to run.
   */
  getLevels(taskName: string): Array<Array<string>> {
    return this.#getLevels(taskName);
  }

  /**
   * Disposes the handler.
   */
  dispose(): void {
    this.#changes?.dispose();
    this.#changes = null;
  }

  /**
   * Adds an event listener for the `changed` event.
   * The event is triggered when a task changes its state.
   * The event detail contains the task name and the new state.
   *
   * @param {EventListenerOrEventListenerObject} fn - The event listener to add.
   */
  onChanged(fn: EventListenerOrEventListenerObject): void {
    this.#eventTarget.addEventListener('changed', fn);
  }

  /**
   * Removes an event listener for the `changed` event.
   *
   * @param {EventListenerOrEventListenerObject} fn - The event listener to remove.
   */
  offChanged(fn: EventListenerOrEventListenerObject): void {
    this.#eventTarget.removeEventListener('changed', fn);
  }

  get #log(): Logger {
    return logger();
  }

  async #preRun(taskName: string): Promise<void> {
    const data: undefined | TTaskRunData = await this.changes?.get(taskName);

    this.#log.info(`Deno        v${Deno.version.deno}`);
    this.#log.info(`TypeScript  v${Deno.version.typescript}`);
    this.#log.info(`V8          v${Deno.version.v8}`);
    this.#log.info(`Tano        v${VERSION}`);

    if (data?.lastRun) {
      this.#log.info(`Last run at ${data?.lastRun}`);
    }

    this.#log.info('');
    this.#log.info(bold(green(`Starting...`)));

    const dateNow = new Date();

    this.#finished = null;
    this.#starting = performance.mark('starting_run', {
      startTime: dateNow.getTime(),
    });
  }

  #postRun(dispose: boolean): void {
    const dateNow = new Date();

    this.#finished = performance.mark('finished_run', {
      startTime: dateNow.getTime(),
    });

    this.#measure = performance.measure('run', 'starting_run', 'finished_run');

    this.#log.info(bold(green(`Finished after {duration}`)), {
      duration: `${format(this.#measure.duration, { ignoreZero: true })}`,
    });

    if (dispose) {
      this.dispose();
    }
  }

  async #runLevel(level: Array<string>, concurrency: number, failed: Array<string>): Promise<void> {
    let firstError: unknown = undefined;

    // The mapper never throws, because a throw would make pooledMap collect the errors into an AggregateError and hide the one the task reported.
    const results: AsyncIterableIterator<void> = pooledMap(concurrency, level, async (taskName: string): Promise<void> => {
      if (this.#abort) {
        return;
      }

      await this.#cache.get(taskName)?.runThis(this.#options.force)
        .catch((err) => {
          failed.push(taskName);

          if (this.#options.failFast) {
            firstError = firstError ?? err;

            this.abort();
          }
        });
    });

    for await (const _ of results) {
      // pooledMap only advances while its results are consumed.
    }

    if (firstError !== undefined) {
      throw firstError;
    }
  }

  #getLevels(taskName: string): Array<Array<string>> {
    const plan: Array<string> = this.#getPlan(taskName);
    const depths: Map<string, number> = new Map();
    const levels: Array<Array<string>> = [];

    // The plan is in dependency order, so every `needs` of a task already has its depth.
    for (const name of plan) {
      const task: undefined | Task = this.#cache.get(name);
      const depth: number = Math.max(-1, ...(task?.needs ?? []).map((need) => depths.get(need) ?? -1)) + 1;

      depths.set(name, depth);
    }

    for (const name of plan) {
      const depth: number = depths.get(name) as number;

      levels[depth] = [...(levels[depth] ?? []), name];
    }

    return levels;
  }

  #getPlan(
    taskName: string,
    taskNames: Array<string> = [],
    planned: Set<string> = new Set(),
    visiting: Set<string> = new Set(),
  ): Array<string> {
    if (visiting.has(taskName)) {
      throw new Error(`Circular dependency detected at task '${taskName}'.`);
    }

    if (planned.has(taskName)) {
      return taskNames;
    }

    if (this.#cache.has(taskName)) {
      const task: Task = this.#cache.get(taskName) as Task;

      visiting.add(taskName);

      try {
        if (task?.needs?.length > 0) {
          task.needs.forEach((tn) => this.#getPlan(tn, taskNames, planned, visiting));
        }
      } finally {
        visiting.delete(taskName);
      }

      taskNames.push(taskName);
      planned.add(taskName);
    } else {
      throw new Error(`A task with the name '${taskName}' does not exist.`);
    }

    return taskNames;
  }

  #emitChanges(e: CustomEventInit): void {
    this.#eventTarget.dispatchEvent(
      new CustomEvent('changed', {
        detail: {
          taskName: e.detail.taskName,
          status: e.detail.status,
          error: e.detail.error,
        },
      }),
    );
  }
}

/**
 * An initial instance of the handler to run the tasks.
 *
 * @example Runs the task handler.
 * ```ts
 * import { handler } from 'jsr:@dx/tano';
 *
 * handler();
 * ```
 */
export const handler: TTanoHandler = new Handler();
