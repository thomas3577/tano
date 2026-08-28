# tano

[![JSR Version](https://jsr.io/badges/@dx/tano)](https://jsr.io/@dx/tano)
[![JSR Score](https://jsr.io/badges/@dx/tano/score)](https://jsr.io/@dx/tano/score)
[![ci](https://github.com/thomas3577/tano/actions/workflows/deno.yml/badge.svg)](https://github.com/thomas3577/tano/actions/workflows/deno.yml)
[![Built with the Deno Standard Library](https://raw.githubusercontent.com/denoland/deno_std/main/badge.svg)](https://deno.land/std)

Yet another task runner.

There is a very good article on the Deno blog with the title [You Don't Need a Build Step](https://deno.com/blog/you-dont-need-a-build-step).
Yes, you don't need this task runner either, but it works (maybe) and it was fun to implement it.

## Install

```bash
deno install --allow-run -RWE -g -n tano jsr:@dx/tano/cli
```

**Note:**

Your tasks may need additional permissions.

## Upgrade

Upgrades the dx cli.

```bash
tano --upgrade
```

Every release is documented in the [changelog](CHANGELOG.md), including what breaks.

## Upgrading from 0.5

`0.6.0` fixed a number of defects, and four of those change what an unchanged tanofile does. The [changelog](CHANGELOG.md#breaking) lists all eleven breaking changes; these are the ones that need no action from you to bite:

**Quotes in a string command are now consumed by tano, not by the child process.** A command that relied on the child re-parsing them has to quote the inner command:

```ts
task('t', `pwsh -c echo 'Task 06'`); // 0.5
task('t', `pwsh -c "echo 'Task 06'"`); // 0.6
```

Unquoted shell operators (`&`, `|`, `;`, `<`, `>`, `` ` ``, `$(`) now throw instead of being passed on as literal arguments. Use `needs` to chain tasks, a code task instead of a pipe, quotes to pass an operator as a literal argument, or the array form.

**A flag on the command line now wins over `setup()` in the tanofile.** It used to be the other way round. If your tanofile sets `logLevel`, `quiet` or `logOutput` and you also pass the flag, the flag now decides.

**`source: true` covers subdirectories.** `globstar` defaulted to `false`, so `**` behaved like `*` and every subdirectory was invisible to the hash. Tasks that were wrongly skipped now run, which makes a run take longer than before — that is the fix working, not a regression.

**A failing run exits with `1`.** Every run used to exit with `0`. A pipeline that was green because tano never failed will now go red.

The cache is not migrated. The first run after the update rebuilds it and leaves the old `.tano/cache.db` behind, which you can delete.

## Preparation

Create a TypeScript file with the name `tanofile.ts` and import the 'task' function and create your tasks.

```ts
import { needs, task } from 'jsr:@dx/tano';

task('pre-task', `echo 'These were ...'`);
task('default', needs('pre-task'), `echo '...two tasks.'`);
```

Tasks can carry a description, which `tano --list` shows:

```ts
task('build', `deno check`, { description: 'Type checks everything' });
```

## Using

**Execute default task:**

```bash
tano
```

**Execute my-task:**

```bash
tano --task my-task
```

**...or shorthand:**

```bash
tano my-task
```

**List all tasks of the tanofile:**

```bash
tano --list
```

**Show what a task would run, without running it:**

```bash
tano --dry-run my-task
```

A run that fails exits with `1`, so tano can be used in a pipeline.

**Run independent tasks at the same time:**

```bash
tano --concurrency 4
```

Tasks that do not depend on each other run together, up to the given number. The default is `1`. Anything above that requires every ordering your tanofile relies on to be declared with `needs` — while tasks run at the same time, their output is prefixed with the task name so it stays readable:

```text
docs | rendering page 1
build | compiling module 1
build | compiling module 2
docs | rendering page 2
```

**Run a task again whenever something changes:**

```bash
tano --watch my-task
tano --watch='src/**' my-task
```

Without a glob everything below the tanofile is watched. Which tasks actually run again is decided by `source`, so declaring it keeps a watch run cheap.

Ctrl+C stops the running tasks instead of leaving the spawned processes behind. A task can also carry its own limit:

```ts
task('flaky', `deno run ./fetch.ts`, { timeout: 30_000 });
```

## Commands

tano runs commands without a shell. A string command is split into arguments, where single and double quotes group their content and a backslash is an ordinary character, so Windows paths can be written as they are:

```ts
task('t', `deno run "C:\\Program Files\\build.ts"`);
```

Shell operators are not available, because there is no shell. Use `needs` to chain tasks, a code task instead of a pipe, or pass the command as an array of arguments:

```ts
task('t', ['sh', '-c', 'ls -la | wc -l']);
```

## Configuration

`setup` sets the configuration from within the tanofile:

```ts
import { setup } from 'jsr:@dx/tano';

setup({
  logLevel: 'DEBUG',
});
```

A flag passed on the command line wins over `setup`, which in turn wins over the built-in defaults.

## Help

```bash
tano --help
```
