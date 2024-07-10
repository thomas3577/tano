// Copyright 2018-2024 the tano authors. All rights reserved. MIT license.

/**
 * This is the initial module to start the Tano CLI.
 *
 * @module
 */

import { bold } from '@std/fmt/colors';
import type { Logger } from '@std/log';
import { logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import { parseTanoArgs } from './src/tano.config.ts';
import { help } from './src/help.ts';
import { VERSION } from './src/version.ts';
import { task } from './src/task.factory.ts';
import type { TanoArgs } from './src/types.ts';

const args: TanoArgs = await parseTanoArgs();

const cli = async (): Promise<void> => {
  const log: Logger = logger();

  try {
    log.info(`Using       ${args.file}`);

    if (args.file) {
      await import(args.file);
    }

    await handler.run(args.task, {
      failFast: args.failFast,
      force: args.force,
      noCache: args.noCache,
    });
  } catch (err: unknown) {
    log.error(bold('Aborted with errors.'));
    log.error(err);
  }
};

if (import.meta.main) {
  switch (args.action) {
    case 'help':
      help();
      break;
    case 'version':
      console.log(`v${VERSION}`);
      break;
    case 'update':
      await task('update', 'deno install --unstable-kv --allow-read --allow-run --allow-env --allow-write -g -f -n tano jsr:@dx/tano/tano').run();
      break;
    default:
      await cli();
      break;
  }
}
