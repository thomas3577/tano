import { Logger, logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import { setup } from './src/tano.config.ts';
import { TanoConfig } from './src/definitions.ts';
import { getImportUrl } from './src/tano.factory.ts';
import { help } from './src/help.ts';

const config: TanoConfig = setup();
const log: Logger = logger();

const cli = async (): Promise<void> => {
  try {
    const importUrl: string = await getImportUrl(config.file);

    log.info(`Using tanofile ${importUrl}`);

    await import(importUrl);
    await handler.run(config.task);
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
      break;
    default:
      await cli();
      break;
  }
}
