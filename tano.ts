/**
 * This is the initial module to start the Tano CLI.
 * @module
 */

import { bold } from '@std/fmt/colors';

import { Logger, logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import { parseTanoArgs } from './src/tano.config.ts';
import { help } from './src/help.ts';
import { VERSION } from './src/version.ts';
import { task } from './src/task.factory.ts';

import type { TanoArgs } from './src/types.ts';

const args: TanoArgs = await parseTanoArgs();
const log: Logger = logger();

log.debug(`MO_CACHE:   ${Deno.env.get('NO_CACHE')}`);
log.debug(`FAIL_FAST:  ${Deno.env.get('FAIL_FAST')}`);
log.debug(`LOG_LEVEL:  ${Deno.env.get('LOG_LEVEL')}`);
log.debug(`LOG_OUTPUT: ${Deno.env.get('LOG_OUTPUT')}`);
log.debug(`LOG_FILE:   ${Deno.env.get('LOG_FILE')}`);
log.debug(`QUIET:      ${Deno.env.get('QUIET')}`);
log.debug(`FORCE:      ${Deno.env.get('FORCE')}`);
log.debug(`TANO_CWD:   ${Deno.env.get('TANO_CWD')}`);
log.debug('');

const cli = async (): Promise<void> => {
  try {
    log.info(`Using       ${args.file}`);
    log.info(`Tano        v${VERSION}`);

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
