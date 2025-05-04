// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * This module provides the help message for the CLI.
 *
 * @module
 */

import * as tano from './version.ts';

/**
 * Generates the help output for the CLI
 */
export const help = (): void => {
  console.log(`
    tano                  v${tano.VERSION}
    Yet another task runner.

    deno                  v${Deno.version.deno}
    typescript            v${Deno.version.typescript}

    To run the default task:

      tano

    To run a task by name:

      tano my-task

    USAGE:
      tano [OPTIONS] <TASK_NAME>

    ARGS:
      <TASK_NAME>
              The name of the task to be executed

    OPTIONS:
      -h, --help
              Print help information

      -q, --quiet
              Suppress output

      -f, --file <FILE>
              Path to the task definition. Default is <CWD>/tanofile.ts

      -t, --task <TASK_NAME>
              As an alternative to set the task name.

      -l, --log-level <LOG_LEVEL>
              To change the log level. Default is 'INFO'.
              See https://deno.land/std@log/levels.ts

          --log-file <LOG_FILE>
              Path to the log file. Default is <CWD>/tano.log

          --log-output <LOG_OUTPUT>
              Where to output the logs. Default is 'console'.
              Possible values are 'console', 'stream', 'file'.

      -V, --version
              Print version information

          --fail-fast
              Aborts all tasks at the first error. Default is 'true'

          --force
              Also executes the tasks that have not been changed since the last run.

          --no-cache
              Disables the cache mechanism.

      -U, --upgrade
              Upgrades @dx/tano

  `);
};
