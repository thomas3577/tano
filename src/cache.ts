// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * Cache to keep the hash of all affected files of a task.
 * This allows a decision to be made at the next run as to whether a task needs to be executed again or not.
 *
 * @module
 */

import { join } from '@std/path';
import type { TTanoRunData } from './types.ts';

const empty = (): TTanoRunData => ({ tasks: {} });

/**
 * The tano cache.
 */
export class TanoCache {
  readonly #dir: string;
  readonly #path: string;

  /**
   * Constructor of tano cache.
   *
   * @param {string} cwd - Current working directory
   */
  constructor(cwd: string) {
    this.#dir = join(cwd, '.tano');
    this.#path = join(this.#dir, 'cache.json');
  }

  /**
   * The path where the cache is stored.
   *
   * @returns {string} The cache path.
   */
  get path(): string {
    return this.#path;
  }

  /**
   * Reads the tano run data.
   *
   * @remarks
   * A missing or unreadable cache is not an error. It only means that every task counts as changed.
   *
   * @returns {Promise<TTanoRunData>} The tano run data.
   */
  async read(): Promise<TTanoRunData> {
    try {
      const data: TTanoRunData = JSON.parse(await Deno.readTextFile(this.#path));

      return data.tasks ? data : empty();
    } catch {
      return empty();
    }
  }

  /**
   * Writes the tano run data.
   *
   * @remarks
   * Written to a temporary file and renamed, so that an interrupted run cannot leave a half written cache behind.
   *
   * @param {TTanoRunData} data - The tano run data.
   *
   * @returns {Promise<void>}
   */
  async write(data?: TTanoRunData): Promise<void> {
    const temp: string = `${this.#path}.${crypto.randomUUID()}.tmp`;

    try {
      await Deno.mkdir(this.#dir, { recursive: true });
      await Deno.writeTextFile(temp, `${JSON.stringify(data ?? empty(), null, 2)}\n`);
      await Deno.rename(temp, this.#path);
    } catch (err: unknown) {
      await Deno.remove(temp).catch(() => undefined);

      const msg = err instanceof Error ? err.message : `${err}`;

      throw new Error(`Failed to persist the cache '${this.#path}': ${msg}`);
    }
  }

  /**
   * Disposes of resources held by the object.
   *
   * @remarks
   * Nothing is held open, the method only keeps the contract of the changes type.
   */
  dispose(): void {
    return;
  }
}
