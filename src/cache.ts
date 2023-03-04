import { format, join } from 'std/path/mod.ts';

export interface TaskRunData {
  lastRun?: number;
}

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

export const writeToCache = async (cwd: string, data: TaskRunData): Promise<void> => {
  const path: string = toPath(cwd);

  await Deno.writeTextFile(path, JSON.stringify(data, null, 2), {
    create: true,
  });
};

export const readFromCache = async (cwd: string): Promise<TaskRunData> => {
  const path: string = toPath(cwd);

  try {
    const text: string = await Deno.readTextFile(path);
    const data: TaskRunData = JSON.parse(text);

    return data;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      await createDir(cwd);

      return await writeToCache(cwd, {}).then(() => ({}));
    }

    throw err;
  }
};
