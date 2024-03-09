# tano

[![JSR Version](https://jsr.io/badges/@toea/tano)](https://jsr.io/@toea/tano)
[![JSR Score](https://jsr.io/badges/@toea/tano/score)](https://jsr.io/@toea/tano/score)
[![ci](https://github.com/thomas3577/tano/actions/workflows/deno.yml/badge.svg)](https://github.com/thomas3577/tano/actions/workflows/deno.yml)

Yet another task runner.

## Install

```bash
deno install --unstable-kv --allow-read --allow-run --allow-env --allow-write -n tano jsr:@toea/tano
```

**Note:**

Your tasks may need additional permissions.

## Preparation

Create a TypeScript file with the name `tanofile.ts` and import the 'task' function and create your tasks.

```ts
import { needs, task } from 'jsr:@toea/tano';

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

## Documentation

- [api](./docs/api.md)
- [examples](./docs/examples.md)
