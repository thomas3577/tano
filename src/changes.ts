import { walk, WalkEntry } from 'std/fs/mod.ts';
import { join } from 'std/path/mod.ts';

export const checkChanges = async (path: string, lastRun: string): Promise<boolean> => {
  let hasChanges: boolean = false;

  const lastRunDate: Date = new Date(lastRun);
  const iterator: AsyncIterableIterator<WalkEntry> = walk(path, {
    includeDirs: false,
  });

  for await (const entry of iterator) {
    const fileInfo: Deno.FileInfo = await Deno.stat(entry.path);

    if (
      fileInfo.isFile &&
      fileInfo.mtime &&
      !entry.path.endsWith(join('.tano', 'cache.json')) &&
      fileInfo.mtime >= lastRunDate
    ) {
      hasChanges = true;
    }
  }

  return hasChanges;
};
