import { parse } from 'std/flags/mod.ts';

import { log } from './logger.ts';
import { handler } from './handler.ts';
import { getImportUrl } from './tano.factory.ts';

const cli = async () => {
  try {
    const flags = parse(Deno.args, {
      string: ['file', 'task'],
      default: {
        file: 'tanofile.ts',
      },
    });

    const importUrl: null | string = getImportUrl(flags.file);

    log.info(`Using tanofile ${importUrl}`);

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
