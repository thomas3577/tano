# tano

Yet another task runner cli with no dependencies, inspired by Gulp.

## Install

```bash
deno install --allow-read --allow-run --allow-env -f -n tano --config ./deno.json https://deno.land/x/install@v0.0.1/tano.ts
```

**Note:**

Your tasks may need additional permissions.

## Preparation

Create a TypeScript file with the name `tanofile.ts` and import the 'task' function and create your tasks.

```TypeScript
import { task, needs } from 'https://deno.land/x/install@v0.0.1/mod.ts';

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

## Documentation

- [api](./docs/api.md)
- [cli](./docs/cli.md)
- [examples](./docs/examples.md)
