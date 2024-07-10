/**
 * This module provides the task handler class and an initial instance.
 *
 * @module
 */

import { bold, green } from '@std/fmt/colors';
import { format } from '@std/fmt/duration';
import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import type { Task } from './task.ts';
import { Changes, ChangesMock } from './changes.ts';
import { VERSION } from './version.ts';
import type { IChanges, TanoHandler, TaskRunData, TaskRunOptions } from './types.ts';

/**
 * The task handler.
 */
class Handler implements TanoHandler {
  readonly #created: Date = new Date();
  readonly #cache: Map<string, Task> = new Map();
  readonly #eventTarget = new EventTarget();

  #log: Logger = logger();
  #starting: null | PerformanceMark = null;
  #finished: null | PerformanceMark = null;
  #measure: null | PerformanceMeasure = null;
  #changes: null | IChanges = null;
  #options: TaskRunOptions = {
    failFast: true,
    force: false,
    noCache: false,
  };

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
   * Gets the number of executed tasks.
   */
  get executed(): number {
    return Array.from(this.#cache).filter(([_, value]) => value.status !== 'ready' && value.status !== 'running' && value.status !== 'skipped').length;
  }

  /**
   * Managed the tano data.
   */
  get changes(): null | IChanges {
    if (!this.#changes) {
      if (this.#options.noCache === true) {
        this.#changes = new ChangesMock();
      } else {
        this.#changes = new Changes(Deno.env.get('TANO_CWD'));
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
   * @param {String} taskName - [optionalParam='default'] Name of the task.
   * @param {TaskRunOptions} options - [optionalParam={ failFast: true, force: false, noCache: false }]
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async run(taskName: string = 'default', options?: TaskRunOptions): Promise<void> {
    this.#options = {
      failFast: options?.failFast !== undefined ? options?.failFast : this.#options.failFast,
      force: options?.force !== undefined ? options?.force : this.#options.force,
      noCache: options?.noCache !== undefined ? options?.noCache : this.#options.noCache,
    };

    await this.#preRun(taskName);

    const taskNames: Array<string> = this.#getPlan(taskName);

    let abort = false;

    for (const tn of taskNames) {
      if (abort) {
        break;
      }

      await this.#cache.get(tn)?.runThis(this.#options.force)
        .catch((err) => {
          if (this.#options.failFast) {
            abort = true;
            throw err;
          }
        });
    }

    this.#postRun(!taskNames || taskNames.length === 0 || abort);
  }

  /**
   * Resets all tasks so that you can run them again.
   */
  reset(): void {
    this.#cache.forEach((task: Task) => task.reset());
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
   * @param taskNames
   * @returns {Array<string>} - List of the names of all executed tasks
   */
  getPlan(taskName: string): Array<string> {
    return this.#getPlan(taskName);
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
   * @param fn - The event listener to add.
   */
  onChanged(fn: EventListenerOrEventListenerObject): void {
    this.#eventTarget.addEventListener('changed', fn);
  }

  /**
   * Removes an event listener for the `changed` event.
   *
   * @param fn - The event listener to remove.
   */
  offChanged(fn: EventListenerOrEventListenerObject): void {
    this.#eventTarget.removeEventListener('changed', fn);
  }

  /**
   * Hack: Updates the logger of this handler.
   */
  updateLogger(): void {
    this.#log = logger();
  }

  async #preRun(taskName: string): Promise<void> {
    const data: undefined | TaskRunData = await this.changes?.get(taskName);

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

  #getPlan(taskName: string, taskNames: Array<string> = []): Array<string> {
    if (this.#cache.has(taskName)) {
      const task: Task = this.#cache.get(taskName) as Task;

      if (task?.needs?.length > 0) {
        task.needs.forEach((tn) => this.#getPlan(tn, taskNames));
      }

      taskNames.push(taskName);
    } else {
      this.#log.warn('A task with the name {name} does not exist.', {
        name: `'${taskName}'`,
      });
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
 * Instance of Handler.
 */
export const handler: TanoHandler = new Handler();
