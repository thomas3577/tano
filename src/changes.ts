import { readFromCache, writeToCache } from './cache.ts';
import { computeHash } from './glob.ts';
import { GlobHashSource, TanoRunData, TaskRunData } from './types.ts';

/**
 * To determine if there are file changes in the glob area.
 */
export class Changes {
  #cwd: string = '.';
  #data: undefined | TanoRunData;

  constructor(cwd: string) {
    this.#cwd = cwd;
  }

  async hasChanged(taskName: string, source?: GlobHashSource): Promise<boolean> {
    if (!source) {
      return true;
    }

    const oldHash = await this.#getHash(taskName);
    const newHash = await computeHash(source);

    return newHash !== oldHash;
  }

  async update(taskName: string, timestamp: Date, source?: GlobHashSource): Promise<void> {
    if (!this.#data) {
      return;
    }

    const lastRun: string = timestamp.toISOString();
    const hash: undefined | string = await computeHash(source);

    this.#data.tasks[taskName] = {
      lastRun,
      hash,
    };

    await writeToCache(this.#cwd, this.#data);
  }

  async get(taskName: string): Promise<undefined | TaskRunData> {
    const data = await this.#getAll();

    return data?.tasks[taskName];
  }

  async #getHash(taskName: string): Promise<undefined | string> {
    return (await this.get(taskName))?.hash;
  }

  async #getAll(): Promise<undefined | TanoRunData> {
    if (!this.#data) {
      this.#data = await readFromCache<TanoRunData>(this.#cwd);
    }

    if (!this.#data.tasks) {
      this.#data.tasks = {};
    }

    return this.#data;
  }
}
