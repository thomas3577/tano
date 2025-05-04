// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * Experimental cache to keep the hash of all affected files of a task.
 * This allows a decision to be made at the next run as to whether a task needs to be executed again or not.
 *
 * @module
 */

import { format, join } from '@std/path';
import { exists } from '@std/fs';
import type { TTanoRunData, TTaskRunData } from './types.ts';

/**
 * Creates the directory to the tano cache.
 *
 * @param {string} dir - The directory in which the database is located.
 *
 * @returns {Promise<void>}
 */
const createDir = async (dir: string): Promise<void> => await Deno.mkdir(dir, { recursive: true });

/**
 * Converts a KvKey in a Taskname.
 *
 * @param {Deno.KvKey} key - The key from which the task name is to be taken.
 *
 * @returns {string} - The Taskname
 */
const toTaskName = (key: Deno.KvKey): undefined | string => key.at(1) as string;

/**
 * The tano cache.
 */
export class TanoCache {
  readonly #dir: string;
  readonly #path: string;
  #db: Deno.Kv | null = null;

  /**
   * Constructor of tano cache.
   *
   * @param {string} cwd - Current working directory
   */
  constructor(cwd: string) {
    this.#dir = join(cwd, '.tano');
    this.#path = format({
      root: '/',
      dir: this.#dir,
      name: 'cache',
      ext: '.db',
    });
  }

  /**
   * The path where the database is stored.
   *
   * @returns {string} The database path.
   */
  get path(): string {
    return this.#path;
  }

  /**
   * Reads the tano run data from Kv.
   *
   * @returns {Promise<TTanoRunData>} The tano run data.
   */
  async read(): Promise<TTanoRunData> {
    const data: TTanoRunData = {
      tasks: {},
    };

    const db: Deno.Kv = await this.#openKy();
    const tasks: Record<string, TTaskRunData> = {};
    const entries: Deno.KvListIterator<TTaskRunData> = db.list<TTaskRunData>({ prefix: ['users'] });

    for await (const entry of entries) {
      const taskName: undefined | string = toTaskName(entry.key);
      if (taskName) {
        tasks[taskName] = entry.value as TTaskRunData;
      }
    }

    data.tasks = tasks;

    return data;
  }

  /**
   * Writes tano run data to Kv.
   *
   * @param {TTanoRunData} data - The tano run data.
   *
   * @returns {Promise<void>}
   */
  async write(data?: TTanoRunData): Promise<void> {
    const db: Deno.Kv = await this.#openKy();

    for (const promise of Object.entries(data?.tasks || {}).map(([key, value]) => db.set(['task', key], value))) {
      await promise;
    }
  }

  /**
   * Disposes of resources held by the object.
   */
  dispose(): void {
    this.#db?.close();
    this.#db = null;
  }

  async #openKy(): Promise<Deno.Kv> {
    if (!await exists(this.#dir)) {
      await createDir(this.#dir);
    }

    if (!this.#db) {
      this.#db = await Deno.openKv(this.#path);
    }

    return this.#db;
  }
}
