/**
 * This module provides a class to determine if there are file changes in the glob area.
 *
 * @module
 */

import { TanoCache } from './cache.ts';
import { computeHash } from './glob.ts';
import type { GlobHashSource, IChanges, TanoRunData, TaskRunData, TaskStatus } from './types.ts';

/**
 * Dummy implementation of the changes interface.
 * Used instead of Changes if no-cache is true.
 */
export class ChangesMock implements IChanges {
  /**
   * Only a mock implementation.
   */
  async hasChanged(_: string): Promise<boolean> {
    return await Promise.resolve(true);
  }

  /**
   * Only a mock implementation.
   */
  async update(_1: string, _2: Date, _3: TaskStatus): Promise<void> {
    return await Promise.resolve();
  }

  /**
   * Only a mock implementation.
   */
  async get(_: string): Promise<TaskRunData | undefined> {
    return await Promise.resolve(undefined);
  }

  /**
   * Only a mock implementation.
   */
  dispose(): void {
    return;
  }
}

/**
 * To determine if there are file changes in the glob area.
 */
export class Changes implements IChanges {
  readonly #cache: TanoCache;
  #data: undefined | TanoRunData;

  /**
   * Constructor of changes.
   *
   * @param {string} cwd - Current working directory.
   */
  constructor(cwd?: string) {
    this.#cache = new TanoCache(cwd || Deno.cwd());
  }

  /**
   * Indicates whether something has changed at the source or not.
   *
   * @param {string} taskName - Name of the desired task.
   * @param {GlobHashSource} source - Global hash source of the files to be checked for changes.
   */
  async hasChanged(taskName: string, source?: GlobHashSource): Promise<boolean> {
    if (!source) {
      return true;
    }

    const hash = await computeHash(source, [this.#cache.path]);
    const lastHash = await this.#getHash(taskName);

    return lastHash === undefined || lastHash !== hash;
  }

  /**
   * Writes the information of the executed task to the database.
   *
   * @param {string} taskName - Name of the desired task.
   * @param {Date} timestamp - execution date.
   * @param {TaskStatus} status - Execution status of the task.
   * @param {GlobHashSource} source - Global hash source of the files.
   */
  async update(taskName: string, timestamp: Date, status: TaskStatus, source?: GlobHashSource): Promise<void> {
    if (!this.#data) {
      return;
    }

    const lastRun: string = timestamp.toISOString();
    const hash: undefined | string = await computeHash(source, [this.#cache.path]);

    this.#data.tasks[taskName] = {
      lastRun,
      lastStatus: status,
      hash,
    };

    await this.#cache.write(this.#data);
  }

  /**
   * Gets information about the last run.
   *
   * @param {string} taskName - Name of the desired task.
   */
  async get(taskName: string): Promise<undefined | TaskRunData> {
    const data = await this.#getAll();

    return data?.tasks[taskName];
  }

  /**
   * Disposes of resources held by the object.
   */
  dispose(): void {
    this.#cache.dispose();
  }

  async #getHash(taskName: string): Promise<undefined | string> {
    return (await this.get(taskName))?.hash;
  }

  async #getAll(): Promise<undefined | TanoRunData> {
    if (!this.#data) {
      this.#data = await this.#cache.read();
    }

    if (!this.#data.tasks) {
      this.#data.tasks = {};
    }

    return this.#data;
  }
}
