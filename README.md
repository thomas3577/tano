# tano

[![ci](https://github.com/thomas3577/tano/actions/workflows/deno.yml/badge.svg)](https://github.com/thomas3577/tano/actions/workflows/deno.yml)
[![Built with the Deno Standard Library](https://raw.githubusercontent.com/denoland/deno_std/main/badge.svg)](https://deno.land/std)

Yet another task runner cli with no dependencies, inspired by Gulp.

## Install

```bash
deno install --unstable-kv --allow-read --allow-run --allow-env --allow-write -f -n tano --config ./deno.json https://cdn.jsdelivr.net/gh/thomas3577/tano/tano.ts
```

**Note:**

Your tasks may need additional permissions.

## Preparation

Create a TypeScript file with the name `tanofile.ts` and import the 'task' function and create your tasks.

```TypeScript
import { task, needs } from 'https://cdn.jsdelivr.net/gh/thomas3577/tano/mod.ts';

task('pre-task', `echo 'These were ...'`);
task('default' needs('pre-task'), `echo '...two tasks.'`);
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

## Documentation

- [api](./docs/api.md)
- [examples](./docs/examples.md)
