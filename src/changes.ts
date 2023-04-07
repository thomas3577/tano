import { readFromCache, writeToCache } from './cache.ts';
import { computeHash } from './glob.ts';
import { GlobHashOptionsStrict, TanoRunData, TaskRunData } from './types.ts';

export class Changes {
  #cwd: string = '.';
  #data: undefined | TanoRunData;

  constructor(cwd: string) {
    this.#cwd = cwd;
  }

  async update(taskName: string, timestamp: Date, source?: string | string[] | GlobHashOptionsStrict): Promise<void> {
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
