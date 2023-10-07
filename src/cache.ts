import { format, join } from 'std/path/mod.ts';
import { exists } from 'std/fs/exists.ts';

import { sequential } from './utils.ts';
import { TanoRunData, TaskRunData } from './types.ts';

/**
 * Creates the directory to the tano cache.
 *
 * @param {String} dir - The directory in which the database is located.
 *
 * @returns {Promise<void>}
 */
const createDir = async (dir: string): Promise<void> => await Deno.mkdir(dir, { recursive: true });

/**
 * Converts a KvKey in a Taskname.
 *
 * @param key {Deno.KvKey} - The key from which the task name is to be taken.
 *
 * @returns  {String} - The Taskname
 */
const toTaskName = (key: Deno.KvKey): undefined | string => key.at(1) as string;

/**
 * The tano cache.
 */
export class TanoCache {
  readonly #dir: string;
  readonly #path: string;
  #db: Deno.Kv | null = null;

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
   * @returns {String} The database path.
   */
  get path(): string {
    return this.#path;
  }

  /**
   * Reads the tano run data from Kv.
   *
   * @returns {Promise<TanoRunData>} The tano run data.
   */
  async read(): Promise<TanoRunData> {
    const data: TanoRunData = {
      tasks: {},
    };

    const db: Deno.Kv = await this.#openKy();
    const tasks: Record<string, TaskRunData> = {};
    const entries: Deno.KvListIterator<TaskRunData> = db.list<TaskRunData>({ prefix: ['users'] });

    for await (const entry of entries) {
      const taskName: undefined | string = toTaskName(entry.key);
      if (taskName) {
        tasks[taskName] = entry.value as TaskRunData;
      }
    }

    data.tasks = tasks;

    return data;
  }

  /**
   * Writes tano run data to Kv.
   *
   * @param {TanoRunData} data - The tano run data.
   *
   * @returns {Promise<void>}
   */
  async write(data?: TanoRunData): Promise<void> {
    const db: Deno.Kv = await this.#openKy();

    for (const promise of sequential(Object.entries(data?.tasks || {}).map(([key, value]) => db.set(['task', key], value)))) {
      await promise;
    }

    db.close();
    this.#db = null;
  }

  async dispose(): Promise<void> {
    const db: Deno.Kv = await this.#openKy();

    db.close();
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
