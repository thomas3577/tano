import { isAbsolute, join } from 'std/path/mod.ts';
import { format } from 'std/datetime/format.ts';
import { parse } from 'std/flags/mod.ts';
import { error } from 'std/log/mod.ts';

import { handler } from './handler.ts';

const cli = async () => {
  try {
    const flags = parse(Deno.args, {
      string: ['file', 'task'],
      default: {
        file: 'tanofile.ts',
      },
    });

    const importFile: string = flags.file;
    const importPath: string = isAbsolute(importFile) ? join('file:', importFile) : join('file:', Deno.cwd(), importFile);
    const taskName: string = flags.task || flags._[0] as string;

    await import(importPath);
    await handler.run(taskName);
  } catch (err: unknown) {
    error(`[${format(new Date(), 'HH:mm:ss')}] ${err}`);
  }
};

if (import.meta.main) {
  await cli();
}
