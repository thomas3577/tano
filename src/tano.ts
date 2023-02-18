import { isAbsolute, join } from 'std/path/mod.ts';
import { parse } from 'std/flags/mod.ts';

import { log } from './logger.ts';
import { handler } from './handler.ts';

const cli = async () => {
  try {
    const flags = parse(Deno.args, {
      string: ['file', 'task'],
      default: {
        file: 'tanofile.ts',
      },
    });

    let importUrl: null | string = null;

    try {
      importUrl = new URL(flags.file).toString();

      log.info(`Using tanofile ${importUrl}`);
    } catch (_: unknown) {
      const importFile: string = flags.file;
      const importPath: string = isAbsolute(importFile) ? importFile : join(Deno.cwd(), importFile);

      importUrl = join('file:', importPath);

      log.info(`Using tanofile ${importPath}`);
    }

    const taskName: string = flags.task || flags._[0] as string;

    await import(importUrl);
    await handler.run(taskName);
  } catch (err: unknown) {
    log.error(`${err}`);
  }
};

if (import.meta.main) {
  await cli();
}
