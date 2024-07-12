// Copyright 2018-2024 the tano authors. All rights reserved. MIT license.

/**
 * This is the initial module to start the Tano CLI.
 *
 * @module
 */

import { parseTanoArgs } from './src/tano.config.ts';
import { help } from './src/help.ts';
import { VERSION } from './src/version.ts';
import { task } from './src/task.factory.ts';
import type { TanoArgs } from './src/types.ts';
import { cli } from './cli.ts';

if (import.meta.main) {
  const args: TanoArgs = await parseTanoArgs();

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
      await cli(args);
      break;
  }
}
