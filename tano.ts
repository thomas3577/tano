/**
 * This is the initial module to start the Tano CLI.
 * @module
 */

import { bold } from '@std/fmt/colors';

import { Logger, logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import { setup } from './src/tano.config.ts';
import { help } from './src/help.ts';
import { VERSION } from './src/version.ts';
import { task } from './src/task.factory.ts';

import type { TanoConfig } from './src/types.ts';

const config: TanoConfig = await setup();
const log: Logger = logger();

log.debug(`MO_CACHE:  ${Deno.env.get('NO_CACHE')}`);
log.debug(`FAIL_FAST: ${Deno.env.get('FAIL_FAST')}`);
log.debug(`LOG_LEVEL: ${Deno.env.get('LOG_LEVEL')}`);
log.debug(`QUIET:     ${Deno.env.get('QUIET')}`);
log.debug(`FORCE:     ${Deno.env.get('FORCE')}`);
log.debug(`TANO_CWD:  ${Deno.env.get('TANO_CWD')}`);
log.debug('');

const cli = async (): Promise<void> => {
  try {
    log.info(`Using       ${config.file}`);
    log.info(`Tano        v${VERSION}`);

    if (config.file) {
      await import(config.file);
    }

    await handler.run(config.task, {
      failFast: config.failFast,
      force: config.force,
      noCache: config.noCache,
    });
  } catch (err: unknown) {
    log.error(bold('Aborted with errors.'));
    log.error(err);
  }
};

if (import.meta.main) {
  switch (config.action) {
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
