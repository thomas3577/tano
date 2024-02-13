# tano

[![ci](https://github.com/thomas3577/tano/actions/workflows/deno.yml/badge.svg)](https://github.com/thomas3577/tano/actions/workflows/deno.yml)

Yet another task runner cli.

> [!IMPORTANT]
> tano is still under development and probably very buggy.

## Install

```bash
deno install --unstable-kv --allow-read --allow-run --allow-env --allow-write -f -n tano jsr:@toea/tano/tano
```

**Note:**

Your tasks may need additional permissions.

## Preparation

Create a TypeScript file with the name `tanofile.ts` and import the 'task' function and create your tasks.

```TypeScript
import { task, needs } from 'jsr:@toea/tano';

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
