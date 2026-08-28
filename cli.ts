// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This is the initial module to start the Tano CLI.
 *
 * @module
 */

import { parseTanoArgs } from './src/tano.config.ts';
import { help } from './src/help.ts';
import { VERSION } from './src/version.ts';
import { task } from './src/task.factory.ts';
import type { TTanoArgs } from './src/types.ts';
import { cli } from './src/cli.ts';

if (import.meta.main) {
  try {
    const args: TTanoArgs = await parseTanoArgs();

    switch (args.action) {
      case 'help':
        help();
        break;
      case 'version':
        console.log(`v${VERSION}`);
        break;
      case 'upgrade':
        await task('upgrade', 'deno install --allow-run -RWEN -f -g -n tano jsr:@dx/tano/cli').run();
        break;
      default:
        Deno.exitCode = await cli(args);
        break;
    }
  } catch (err: unknown) {
    // Reading the arguments happens before there is any logging configuration, so the message goes straight to stderr.
    console.error(err instanceof Error ? err.message : `${err}`);

    Deno.exitCode = 1;
  }
}
