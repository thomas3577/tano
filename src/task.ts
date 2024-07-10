// Copyright 2018-2024 the tano authors. All rights reserved. MIT license.

/**
 * This module contains the Task class.
 *
 * ```ts
 * import { Task } from '../src/task.ts';
 *
 * const task = new Task('my-task', null, () => console.log('Hello World!'));
 *
 * await task.runThis();
 * ```
 *
 * @module
 */

import { bold, gray, green, red } from '@std/fmt/colors';
import { format } from '@std/fmt/duration';
import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import { handler } from './handler.ts';
import { isCode, isCommand, toCode, toCommand } from './utils.ts';
import { executeCondition, runCode, runCommand } from './runners.ts';
import type { Command, Executor, ICommandOptions, Options, TanoHandler, TaskParams, TaskRunOptions, TaskStatus, TaskType } from './types.ts';

/**
 * A class to create a Task.
 */
export class Task implements TaskParams {
  readonly #log: Logger = logger();
  readonly #created: Date = new Date();
  readonly #handler: TanoHandler = handler;
  readonly #name: string;
  readonly #needs: Array<string>;
  readonly #executor: Executor;
  readonly #options: Options;
  readonly #type: TaskType = undefined;
  readonly #eventTarget = new EventTarget();

  #status: TaskStatus = 'ready';
  #starting: null | PerformanceMark = null;
  #finished: null | PerformanceMark = null;
  #measure: null | PerformanceMeasure = null;

  /**
   * Creates a new instance of a Task.
   *
   * @param {string | TaskParams} nameOrTask - The name or an object which provides all task parameters.
   * @param {Array<string>} needs - Defines the dependencies which should be executed before this task.
   * @param {Command | Code} executor - A command, function or JS/TS-file to execute.
   * @param {Options} options - Options, depending on whether the executor is of type Command or Code.
   */
  constructor(nameOrTask: string | TaskParams, needs?: Array<string> | null, executor?: Executor, options?: Options) {
    needs = needs == null ? [] : needs;

    const task: TaskParams = typeof nameOrTask === 'object' ? nameOrTask as unknown as TaskParams : {
      name: nameOrTask,
      needs,
      executor,
      options,
    };

    this.#name = task.name;
    this.#needs = task.needs ?? [];
    this.#executor = task.executor as Command;
    this.#options = task.options as Options;
    this.#handler.add(this);

    if (isCommand(executor)) {
      this.#type = 'command';
    } else if (isCode(executor)) {
      this.#type = 'code';
    }
  }

  /**
   * Unique name of the task.
   */
  get name(): string {
    return this.#name;
  }

  /**
   * Status of the task.
   */
  get status(): TaskStatus {
    return this.#status;
  }

  /**
   * Timestamp when the handler was created.
   */
  get created(): Date {
    return this.#created;
  }

  /**
   * Performance mark when the last run starts.
   */
  get starting(): null | PerformanceMark {
    return this.#starting;
  }

  /**
   * Performance mark when the last run ends.
   */
  get finished(): null | PerformanceMark {
    return this.#finished;
  }

  /**
   * Performance measure of the last run.
   */
  get measure(): null | PerformanceMeasure {
    return this.#measure;
  }

  /**
   * Task that must be executed before this task is executed.
   */
  get needs(): Array<string> {
    return this.#needs;
  }

  /**
   * The command or code that will be executed by this task if it is set.
   */
  get executor(): Executor {
    return this.#executor;
  }

  /**
   * Options, depending on whether the executor is of type Command or Code.
   */
  get options(): Options {
    return this.#options;
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
   * Executes all dependent tasks and its own.
   *
   * @param {TaskRunOptions} options - [optionalParam={ failFast: true, force: false, noCache: false }]
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async run(options?: TaskRunOptions): Promise<void> {
    await this.#handler.run(this.#name, options);
  }

  /**
   * Executes only this task (without the dependencies).
   *
   * @param {Boolean} force - [optionalParam=false] If `true`, the task will be executed even if the task is to be skipped by `source`.
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async runThis(force: boolean = false): Promise<void> {
    // If no type is defined, nothing will be executed. It is possible and valid not to have a type.
    if (this.#type === undefined) {
      return;
    }

    // If the status is not "ready", the task has already been executed or not reset.
    if (this.#status !== 'ready') {
      throw new Error(`The task '${this.#name}' has already been run.`);
    }

    const skippedBySource: boolean = force !== true && (await this.#handler.changes?.hasChanged(this.#name, this.#options?.source)) !== true;
    if (skippedBySource) {
      this.#updateStatus('skipped');
      this.#log.warn('');
      this.#log.warn(`Task '${gray('{name}')}' skipped by 'source'. No files have been changed since the last run.`, {
        name: this.#name,
      });

      return;
    }

    const skippedByCondition: boolean = !(await executeCondition(this.#options?.condition ?? ((): boolean => true)));
    if (skippedByCondition) {
      this.#updateStatus('skipped');
      this.#log.warn('');
      this.#log.warn(`Task '${gray('{name}')}' skipped by condition. The conditions of this task were not matched.`, {
        name: this.#name,
      });

      return;
    }

    this.#preRun();

    await this.#run(this.#type, this.#executor, this.#options)
      .catch((err) => {
        this.#updateStatus('failed', err);

        this.#log.error(`${bold(red('Error'))} '${gray('{name}')}': ${err}`, {
          name: this.#name,
        });

        throw err;
      });

    await this.#postRun(this.#options);
  }

  /**
   * Resets the task so that it can be executed again.
   */
  reset(): void {
    this.#starting = null;
    this.#finished = null;
    this.#updateStatus('ready');
  }

  #preRun(): void {
    this.#log.info(`Starting '${gray('{name}')}'...`, {
      name: this.#name,
    });

    this.#finished = null;
    this.#starting = performance.mark(`starting_${this.#name}`, {
      startTime: Date.now(),
    });

    this.#updateStatus('running');
  }

  async #postRun(options: Options): Promise<void> {
    this.#updateStatus('success');

    this.#finished = performance.mark(`finished_${this.#name}`, {
      startTime: Date.now(),
    });

    this.#measure = performance.measure(this.#name, `starting_${this.#name}`, `finished_${this.#name}`);

    this.#log.info(`Finished '${gray('{name}')}' after ${bold(green('{duration}'))} `, {
      name: this.#name,
      duration: format(this.#measure.duration, { ignoreZero: true }),
    });

    await this.#handler.changes?.update(this.#name, new Date(), this.#status, options?.source);

    this.#handler.changes?.dispose();
  }

  async #run(type: TaskType, executor: Executor, options: Options): Promise<void> {
    switch (type) {
      case 'command':
        await runCommand(toCommand(executor), options as ICommandOptions);
        break;
      case 'code':
        await runCode(toCode(executor), options);
        break;
    }
  }

  #updateStatus(status: TaskStatus, error?: Error): void {
    this.#status = status;
    this.#emitChanges(status, error);
  }

  #emitChanges(status: TaskStatus, error?: Error): void {
    this.#eventTarget.dispatchEvent(
      new CustomEvent('changed', {
        detail: {
          taskName: this.#name,
          status,
          error,
        },
      }),
    );
  }
}
