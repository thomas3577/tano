import { log } from './logger.ts';

import type { IHandler, ITask } from './definitions.ts';

export class Handler implements IHandler {
  private readonly _created: Date = new Date();
  private readonly _cache: Map<string, ITask> = new Map();
  private _starting: null | PerformanceMark = null;
  private _finished: null | PerformanceMark = null;
  private _measure: null | PerformanceMeasure = null;

  /**
   * Timestamp when the handler was created.
   */
  public get created(): Date {
    return this._created;
  }

  /**
   * Performance mark when the last run starts.
   */
  public get starting(): null | PerformanceMark {
    return this._starting;
  }

  /**
   * Performance mark when the last run ends.
   */
  public get finished(): null | PerformanceMark {
    return this._finished;
  }

  /**
   * Performance measure of the last run.
   */
  public get measure(): null | PerformanceMeasure {
    return this._measure;
  }

  /**
   * Gets the number of tasks that are in the cache.
   */
  public get count(): number {
    return this._cache.size;
  }

  /**
   * Adds a task to the cache.
   *
   * @param task - A task to add.
   */
  public add(task: ITask): void {
    if (this._cache.has(task.name)) {
      throw new Error(`Task with the name '${task.name}' already exists.`);
    }

    this._cache.set(task.name, task);

    log.debug(`Added task ${task.name}`);
  }

  /**
   * Runs the Task.
   *
   * @param taskName - Name of the task.
   */
  public async run(taskName: string = 'default'): Promise<void> {
    log.info(`Starting...`);

    this._finished = null;
    this._starting = performance.mark('starting_run', {
      startTime: Date.now(),
    });

    const taskNames: string[] = this._createPlan(taskName);

    for (const tn of taskNames) {
      await this._cache.get(tn)?.run();
    }

    this._finished = performance.mark('finished_run', {
      startTime: Date.now(),
    });

    this._measure = performance.measure('run', 'starting_run', 'finished_run');

    log.info(`Finished after ${this._measure.duration} ms`);
  }

  /**
   * Resets all tasks.
   */
  public reset(): void {
    this._cache.forEach((task: ITask) => task.reset());
  }

  /**
   * Clears the cache.
   */
  public clear(): void {
    this._cache.clear();
  }

  private _createPlan(taskName: string, taskNames: string[] = []): string[] {
    if (this._cache.has(taskName)) {
      const task: ITask = this._cache.get(taskName) as ITask;

      if (task && task.needs && task.needs?.length > 0) {
        task.needs.forEach((tn) => this._createPlan(tn, taskNames));
      }

      taskNames.push(taskName);
    }

    return taskNames;
  }
}

export const handler: IHandler = new Handler();
