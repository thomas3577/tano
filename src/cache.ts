import { format, join } from 'std/path/mod.ts';

const toPath = (cwd: string): string =>
  format({
    root: '/',
    dir: join(cwd, '.tano'),
    name: 'cache',
    ext: '.json',
  });

const createDir = async (cwd: string): Promise<void> =>
  await Deno.mkdir(join(cwd, '.tano'), {
    recursive: true,
  });

export const writeToCache = async <T>(cwd: string, obj: T | Record<string | number | symbol, never> = {}): Promise<void> => {
  const path: string = toPath(cwd);

  await Deno.writeTextFile(path, JSON.stringify(obj, null, 2), {
    create: true,
  });
};

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
