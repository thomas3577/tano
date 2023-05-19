import * as std from 'std/version.ts';

import * as tano from './version.ts';

export const help = () => {
  console.log(`
    tano                  v${tano.VERSION}
    Yet another task runner cli with no dependencies and inspired by Gulp.

    deno                  v${Deno.version.deno}
    typescript            v${Deno.version.typescript}
    Deno standard library v${std.VERSION}

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
              See https://deno.land/std@${std.VERSION}/log/levels.ts

      -V, --version
              Print version information

          --fail-fast
              Aborts all tasks at the first error. Default is 'true'

          --force
              Also executes the tasks that have not been changed since the last run.
  `);
};
