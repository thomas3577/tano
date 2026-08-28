// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { bold, green } from '@std/fmt/colors';
import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import { handler } from './handler.ts';
import { listPlan, listTasks } from './list.ts';
import { config, setup } from './config.ts';
import { abortRun } from './abort.ts';
import { watch } from './watch.ts';
import type { TTanoArgs } from './types.ts';

/**
 * The exit code a shell expects after a run was interrupted, `128` plus the number of `SIGINT`.
 */
const INTERRUPTED = 130;

/**
 * Loads the tanofile and runs the requested task.
 *
 * @remarks
 * Listens for `SIGINT` while a task runs, so that Ctrl+C stops the spawned processes instead of leaving them behind. A second `SIGINT` gives up waiting and ends tano right away.
 *
 * @param {TTanoArgs} args - The tano args.
 *
 * @returns {Promise<number>} The exit code. `0` if the run succeeded, `1` if it was aborted with errors, `130` if it was interrupted.
 */
export const cli = async (args: TTanoArgs): Promise<number> => {
  const log: Logger = logger();

  const watching: AbortController = new AbortController();

  let interrupted: boolean = false;

  const onInterrupt = (): void => {
    if (interrupted) {
      Deno.exit(INTERRUPTED);
    }

    interrupted = true;

    log.warn(bold('Interrupted, stopping tasks...'));

    abortRun();
    handler.abort();
    watching.abort();
  };

  Deno.addSignalListener('SIGINT', onInterrupt);

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

    if (args.watch) {
      const root: string = config().tanoCwd || Deno.cwd();

      log.info(bold(green(`Watching ${args.watchGlob ?? root}`)));

      await watch(root, args.watchGlob, watching.signal, async () => {
        handler.reset();

        await handler.run(args.task).catch((err: unknown) => {
          if (interrupted) {
            return;
          }

          log.error(bold('Aborted with errors.'));
          log.error(err);
        });
      });

      return interrupted ? INTERRUPTED : 0;
    }

    await handler.run(args.task);

    return 0;
  } catch (err: unknown) {
    if (interrupted) {
      return INTERRUPTED;
    }

    log.error(bold('Aborted with errors.'));
    log.error(err);

    return 1;
  } finally {
    Deno.removeSignalListener('SIGINT', onInterrupt);
  }
};
