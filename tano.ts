import { Logger, logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import { setup } from './src/tano.config.ts';
import { ITanoConfig } from './src/definitions.ts';
import { getImportUrl } from './src/tano.factory.ts';

const cli = async () => {
  const config: ITanoConfig = setup();
  const log: Logger = logger();

  try {
    const importUrl: string = await getImportUrl(config.file);

    log.info(`Using tanofile ${importUrl}`);

    await import(importUrl);
    await handler.run(config.task);
  } catch (err: unknown) {
    log.error(`${err}`);
  }
};

if (import.meta.main) {
  await cli();
}
