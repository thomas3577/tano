// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { bold } from '@std/fmt/colors';
import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import { handler } from './handler.ts';
import { listPlan, listTasks } from './list.ts';
import { setup } from './config.ts';
import type { TTanoArgs } from './types.ts';

/**
 * Loads the tanofile and runs the requested task.
 *
 * @param {TTanoArgs} args - The tano args.
 *
 * @returns {Promise<number>} The exit code. `0` if the run succeeded, `1` if it was aborted with errors.
 */
export const cli = async (args: TTanoArgs): Promise<number> => {
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

    setup(args.config);

    if (args.list) {
      listTasks(handler.tasks, args.file as string);

      return 0;
    }

    if (args.dryRun) {
      const taskName: string = args.task || 'default';

      listPlan(taskName, handler.getPlan(taskName));

      return 0;
    }

    await handler.run(args.task);

    return 0;
  } catch (err: unknown) {
    log.error(bold('Aborted with errors.'));
    log.error(err);

    return 1;
  }
};
