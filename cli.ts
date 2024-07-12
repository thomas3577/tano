// Copyright 2018-2024 the tano authors. All rights reserved. MIT license.

import { bold } from '@std/fmt/colors';
import type { Logger } from '@std/log';
import { logger } from './src/logger.ts';
import { handler } from './src/handler.ts';
import type { TanoArgs } from './src/types.ts';

export const cli = async (args: TanoArgs): Promise<void> => {
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
