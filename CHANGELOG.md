# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-08-28

A reliability release. tano could not be used in CI, because a failing run still exited with `0`. Fixing that surfaced a chain of related defects in command parsing, configuration and the cache.

### Breaking

- **A failing run exits with `1`.** Previously every run exited with `0`, so a failing task passed unnoticed in CI. A pipeline that relied on tano never failing will now fail.
- **An unknown task name is an error.** A missing task, including a missing `needs` entry, was only logged as a warning and dependent tasks ran anyway. `handler.run()` and `handler.getPlan()` now reject for unknown names.
- **`failFast: false` rejects when tasks failed.** It used to swallow the failures and resolve successfully. The error lists every failed task.
- **Quotes in a string command are consumed by tano, not by the child process.** A string command is now split by a quote-aware tokenizer instead of on spaces. A command that relied on the child re-parsing the quotes has to quote the inner command:

  ```ts
  task('t', `pwsh -c echo 'Task 06'`); // before
  task('t', `pwsh -c "echo 'Task 06'"`); // now
  ```

  Unquoted shell operators (`&`, `|`, `;`, `<`, `>`, `` ` ``, `$(`) now throw instead of being passed on as literal arguments. Use `needs` to chain tasks, a code task instead of a pipe, quotes to pass an operator as a literal argument, or the array form.
- **Errors are written to stderr.** All log levels went to stdout, so `tano build > build.log` swallowed the errors into the log file.
- **`--quiet` silences less.** Still silent: tano's own diagnostics and the output of a command task. No longer silent: `console.log` inside a code task, and `--help` and `--version`, which used to print nothing at all under `-q`.
- **An explicit CLI flag wins over `setup()` in the tanofile.** It used to be the other way round, which made `tano -l DEBUG` silently useless on any tanofile calling `setup({ logLevel })`. The order is now built-in defaults, then `setup()`, then explicitly passed CLI flags.
- **`source: true` covers subdirectories.** `globstar` defaulted to `false`, so `**` behaved like `*` and every subdirectory was invisible. Tasks that were wrongly skipped will now run.
- **The cache is not migrated.** `.tano/cache.db` becomes `.tano/cache.json`. The first run after the update rebuilds the cache and leaves the old file behind.
- **`handler.updateLogger()` is removed.** It only existed to work around the logger being cached too early.
- **`TTanoArgs` carries a `config` object** instead of the separate `failFast`, `force` and `noCache` properties.

### Added

- `--concurrency <N>` and `setup({ concurrency })` run independent tasks at the same time. Tasks are grouped into levels, where a level only has to wait for the level before it, and each level runs with the given concurrency. The default is `1`, so nothing changes unless it is asked for — anything above that requires every ordering a tanofile relies on to be declared with `needs`. While tasks run at the same time their output is prefixed with the task name:

  ```text
  docs | rendering page 1
  build | compiling module 1
  build | compiling module 2
  docs | rendering page 2
  ```

- `--watch` runs the task again whenever a file below the tanofile changes, or only on changes matching `--watch=<glob>`. Which tasks actually run again is left to the source cache, which already skips what has not changed.
- `timeout` in the task options stops a task after the given number of milliseconds. A command task and code in its own process are really stopped; a code function runs inside the tano process, where JavaScript cannot stop a running function, so there the timeout only fails the task.
- Ctrl+C stops the tasks that are running instead of leaving the spawned processes behind, and exits with `130`. A second Ctrl+C gives up waiting and ends tano right away.
- `handler.getLevels()` returns the tasks to be executed, grouped into levels that can run at the same time.
- `--list` prints all tasks of a tanofile, sorted by name, with the new optional `description` from the task options.
- `--dry-run` prints the tasks that would run, in order, without running them. No user code is executed.
- `--no-fail-fast` now actually negates the flag. It used to be parsed as a separate, unread argument.
- `config()` is exported and returns the effective configuration with all defaults applied.
- `handler.tasks` returns all registered tasks.
- CI runs on pull requests, type checks with `deno check`, and tests on both Ubuntu and Windows.

### Fixed

- The `signal` from the task options was never passed on to the spawned process. `TTaskOptions` extends `Deno.CommandOptions` and therefore always offered it, but aborting it did nothing.
- A long line of task output reached the logger and the `output` callback in pieces, because the output was split per chunk instead of per line. A multi-byte character split across two chunks could be mangled for the same reason.
- An invalid argument — a `--file` path that is not a file, a `--concurrency` value that is not a positive integer — printed an unhandled rejection with a stack trace instead of the message.
- An absolute path passed to `--file` failed on Windows. A drive letter was parsed as a URL scheme, so `new URL('C:/tanofile.ts')` succeeded with the protocol `c:` and the path was never resolved as a file.
- `setup({ failFast })`, `setup({ force })` and `setup({ noCache })` did nothing. The reads moved from the environment to the run options in early 2024 while the writes stayed behind.
- `setup({ logLevel })` was ignored unless it ran before the tasks were declared, and never applied to the handler's own output.
- The configuration no longer leaks into the environment of spawned tasks. All nine values, under generic names like `QUIET`, `FORCE` and `NO_CACHE`, were written into the process environment and inherited by every child. Three of them were never read back.
- `root` was ignored when matching source globs. Patterns were resolved against the current working directory while only the directory walk honoured `root`, so a relative include with a `root` matched nothing.
- The source hash is built from file contents instead of `dev`, `ino`, `size` and `mtime`. A fresh clone gives new inodes and modification times and Windows reports `dev` and `ino` as `null`, so the cache could never hit in CI. Two same-sized writes within the modification-time resolution could even produce a false hit and skip a task that should have run.
- A source glob that matches nothing counts as changed instead of aborting the run.
- `lastStatus: 'failed'` is recorded. The update sat in the task's post-run step, which a failing task never reaches.
- Log records reaching a file or the log stream no longer carry ANSI escape codes, and their `{name}` and `{duration}` placeholders are filled in. The file handler used the default formatter, which never interpolates.
- The cache is written once per run instead of once per finished task, and is no longer closed and reopened between tasks.
- Repeated spaces in a string command no longer produce empty arguments.
- The post-run step runs even when a task fails, so the cache is always released.

### Removed

- **`--unstable-kv` is no longer needed.** It was required only to store a handful of hashes in `Deno.Kv`:

  ```bash
  deno install --allow-run -RWE -g -n tano jsr:@dx/tano/cli
  ```

  An install command that still passes the flag keeps working, the flag is simply unnecessary.

[0.6.0]: https://github.com/thomas3577/tano/compare/0.5.29...0.6.0
