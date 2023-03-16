import { bold, green } from 'std/fmt/colors.ts';
import { format } from 'std/fmt/duration.ts';

import { readFromCache, writeToCache } from './cache.ts';
import { Logger, logger } from './logger.ts';
import { Task } from './task.ts';
import type { TaskRunData } from './types.ts';

export class Handler {
  readonly #log: Logger = logger();
  readonly #created: Date = new Date();
  readonly #cache: Map<string, Task> = new Map();
  #starting: null | PerformanceMark = null;
  #finished: null | PerformanceMark = null;
  #measure: null | PerformanceMeasure = null;
  #data: null | TaskRunData = null;

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
    return Array.from(this.#cache).filter(([_, value]) => value.status !== 'ready' && value.status !== 'running').length;
  }

  /**
   * Adds a task to the cache.
   *
   * @param task - A task to add.
   */
  add(task: Task): void {
    if (this.#cache.has(task.name)) {
      throw new Error(`Task with the name '${task.name}' already exists.`);
    }

    this.#cache.set(task.name, task);

    this.#log.debug(`Added task ${task.name}`);
  }

  /**
   * Runs the Task.
   * In the process, all dependent tasks `needs` are executed beforehand.
   *
   * @param taskName {string} [optionalParam='default'] Name of the task.
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async run(taskName: string = 'default', failFast: boolean = true): Promise<void> {
    const cwd: string = Deno.env.get('TANO_CWD') || Deno.cwd();

    await this.#preRun(cwd);

    const taskNames: Array<string> = this.#createPlan(taskName);

    let abort = false;
    for (const tn of taskNames) {
      if (abort) {
        break;
      }

      await this.#cache.get(tn)?.runThis()
        .catch((err: unknown) => {
          if (failFast) {
            abort = true;
            throw err;
          }
        });
    }

    await this.#postRun(cwd);
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
    this.#cache.clear();
  }

  async #preRun(cwd: string): Promise<void> {
    this.#data = await readFromCache(cwd);

    this.#log.info(`Deno        v${Deno.version.deno}`);
    this.#log.info(`TypeScript  v${Deno.version.typescript}`);
    this.#log.info(`V8          v${Deno.version.v8}`);
    this.#log.info(`std         v${(await import('std/version.ts')).VERSION}`);

    if (this.#data?.lastRun) {
      this.#log.info(`Last run at ${this.#data.lastRun}`);
    }

    this.#log.info('');
    this.#log.info(bold(green(`Starting...`)));

    const dateNow = new Date();

    this.#finished = null;
    this.#starting = performance.mark('starting_run', {
      startTime: dateNow.getTime(),
    });
  }

  async #postRun(cwd: string): Promise<void> {
    const dateNow = new Date();

    this.#finished = performance.mark('finished_run', {
      startTime: dateNow.getTime(),
    });

    this.#measure = performance.measure('run', 'starting_run', 'finished_run');

    this.#log.info(bold(green(`Finished after {duration}`)), {
      duration: `${format(this.#measure.duration, { ignoreZero: true })}`,
    });

    if (this.#data) {
      this.#data.lastRun = dateNow.toISOString();

      await writeToCache(cwd, this.#data);
    }
  }

  #createPlan(taskName: string, taskNames: Array<string> = []): Array<string> {
    if (this.#cache.has(taskName)) {
      const task: Task = this.#cache.get(taskName) as Task;

      if (task && task.needs && task.needs?.length > 0) {
        task.needs.forEach((tn) => this.#createPlan(tn, taskNames));
      }

      taskNames.push(taskName);
    } else {
      this.#log.warning('A task with the name {name} does not exist.', {
        name: `'${taskName}'`,
      });
    }

    return taskNames;
  }
}

export const handler = new Handler();
