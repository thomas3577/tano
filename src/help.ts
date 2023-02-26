export const help = () => {
  console.log(`
    tano 0.0.1
    Yet another task runner cli with no dependencies and inspired by Gulp.

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
              See https://deno.land/std@0.159.0/log/levels.ts?s=LogLevels

      -V, --version
              Print version information

          --abort-on-error
              Aborts all tasks at the first error. Default is 'true'

          --force
              Ignors 'no changes'
  `);
};
