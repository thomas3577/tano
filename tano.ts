import { Logger, logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import { setup } from './src/tano.config.ts';
import { TanoConfig } from './src/definitions.ts';
import { getImportUrl } from './src/tano.factory.ts';

const cli = async () => {
  const config: TanoConfig = setup();
  const log: Logger = logger();

  try {
    const importUrl: string = await getImportUrl(config.file);

    log.info(`Using tanofile ${importUrl}`);

    await import(importUrl);
    await handler.run(config.task);
  } catch (_: unknown) {
    log.error(`Aborted with errors.`);
  }
};

if (import.meta.main) {
  await cli();
}
