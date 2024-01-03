import { TaskStatus } from '../mod.ts';
import { TanoCache } from './cache.ts';
import { computeHash } from './glob.ts';

import type { GlobHashSource, TanoRunData, TaskRunData } from './types.ts';

/**
 * To determine if there are file changes in the glob area.
 */
export class Changes {
  readonly #cache: TanoCache;
  #data: undefined | TanoRunData;

  constructor(cwd?: string) {
    this.#cache = new TanoCache(cwd || Deno.cwd());
  }

  async hasChanged(taskName: string, source?: GlobHashSource): Promise<boolean> {
    if (!source) {
      return true;
    }

    const hash = await computeHash(source, [this.#cache.path]);
    const lastHash = await this.#getHash(taskName);

    return lastHash === undefined || lastHash !== hash;
  }

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

  async get(taskName: string): Promise<undefined | TaskRunData> {
    const data = await this.#getAll();

    return data?.tasks[taskName];
  }

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
