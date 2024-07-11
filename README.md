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
deno install --unstable-kv --allow-read --allow-run --allow-env --allow-write -g -n tano jsr:@dx/tano/tano
```

**Note:**

Your tasks may need additional permissions.

## Preparation

Create a TypeScript file with the name `tanofile.ts` and import the 'task' function and create your tasks.

```ts
import { needs, task } from 'jsr:@dx/tano';

task('pre-task', `echo 'These were ...'`);
task('default', needs('pre-task'), `echo '...two tasks.'`);
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

## Help

```bash
tano --help
```
