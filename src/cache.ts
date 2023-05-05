import { format, join } from 'std/path/mod.ts';

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

export class TanoCache {
  readonly #dir: string;
  readonly #path: string;

  constructor(cwd: string) {
    this.#dir = join(cwd, '.tano');
    this.#path = format({
      root: '/',
      dir: this.#dir,
      name: 'cache',
      ext: '.db',
    });
  }

  public get path(): string {
    return this.#path;
  }

  /**
   * Reads the tano run data from Kv.
   *
   * @returns {Promise<TanoRunData>} The tano run data.
   */
  public async read(): Promise<TanoRunData> {
    const data: TanoRunData = {
      tasks: {},
    };

    try {
      const db: Deno.Kv = await Deno.openKv(this.#path);
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
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        await createDir(this.#dir);
        await this.write();

        return data;
      }

      throw err;
    }
  }

  /**
   * Writes tano run data to Kv.
   *
   * @param {TanoRunData} data - The tano run data.
   *
   * @returns {Promise<void>}
   */
  public async write(data?: TanoRunData): Promise<void> {
    const db: Deno.Kv = await Deno.openKv(this.#path);

    for (const promise of sequential(Object.entries(data || {}).map(([key, value]) => db.set(['task', key], value)))) {
      await promise;
    }
  }
}
