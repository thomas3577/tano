// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

import { bold } from '@std/fmt/colors';
import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import { handler } from './handler.ts';
import type { TTanoArgs } from './types.ts';

export const cli = async (args: TTanoArgs): Promise<void> => {
  const log: Logger = logger();

  try {
    log.info(`Using       ${args.file}`);

    if (args.file) {
      try {
        await import(args.file);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `${err}`;
        throw new Error(`Failed to load tanofile '${args.file}': ${msg}`);
      }
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
