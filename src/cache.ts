import { format, join } from 'std/path/mod.ts';

/**
 * Creates a file path for the tano cache file.
 *
 * @param {String} cwd - Current working directory.
 *
 * @returns {String} The created path.
 */
const toPath = (cwd: string): string =>
  format({
    root: '/',
    dir: join(cwd, '.tano'),
    name: 'cache',
    ext: '.json',
  });

/**
 * Creates the directory to the tano cache.
 *
 * @param {String} cwd - Current working directory.
 *
 * @returns {Promise<void>}
 */
const createDir = async (cwd: string): Promise<void> =>
  await Deno.mkdir(join(cwd, '.tano'), {
    recursive: true,
  });

/**
 * Writes an object as a JSON file to the Tano cache directory.
 *
 * @param {String} cwd - Current working directory.
 * @param {Object} obj - The object to store.
 *
 * @returns {Promise<void>}
 */
export const writeToCache = async <T>(cwd: string, obj: T | Record<string | number | symbol, never> = {}): Promise<void> =>
  await Deno.writeTextFile(toPath(cwd), JSON.stringify(obj, null, 2), {
    create: true,
  });

/**
 * Reads a object from a JSON file.
 *
 * @param {String} cwd - Current working directory.
 *
 * @returns {Promise<T>} The specific object.
 */
export const readFromCache = async <T>(cwd: string): Promise<T> => {
  try {
    const path: string = toPath(cwd);
    const text: string = await Deno.readTextFile(path);
    const obj: T = JSON.parse(text);

    return obj;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      await createDir(cwd);

      return await writeToCache(cwd).then(() => ({} as T));
    }

    throw err;
  }
};
