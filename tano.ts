import { Logger, logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import { setup } from './src/tano.config.ts';
import { help } from './src/help.ts';

import type { TanoConfig } from './src/definitions.ts';

const config: TanoConfig = await setup();
const log: Logger = logger();

log.debug(`FAIL-FAST: ${Deno.env.get('FAIL-FAST')}`);
log.debug(`LOG_LEVEL: ${Deno.env.get('LOG_LEVEL')}`);
log.debug(`QUIET:     ${Deno.env.get('QUIET')}`);
log.debug(`FORCE:     ${Deno.env.get('FORCE')}`);
log.debug(`TANO_CWD:  ${Deno.env.get('TANO_CWD')}`);
log.debug('');

const cli = async (): Promise<void> => {
  try {
    log.info(`Using tanofile ${config.file}`);

    await import(config.file);
    await handler.run(config.task, config.failFast);
  } catch (err: unknown) {
    log.error(`Aborted with errors. ${err}`);
  }
};

if (import.meta.main) {
  switch (config.action) {
    case 'help':
      help();
      break;
    case 'version':
      console.log(`v${(await import('./src/version.ts')).VERSION}`);
      break;
    default:
      await cli();
      break;
  }
}
