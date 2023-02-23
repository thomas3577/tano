# tano

Just another task runner cli with no dependencies and inspired by Gulp.

## Install

```bash
deno install -A -f -n  tano --config ./deno.json  https://deno.land/x/install@v0.0.1/tano.ts
```

## Preparation

Create a TypeScript file with the name `tanofile.ts`, import the 'task' function and create your tasks.

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

## Todo

- Documentation & Examples.
- More tests.
- Option to skip task, if no changes (Defines in the options). Non-volatile cache to remember last run.
- cli: --force > To ignore "no changes"
- cli: --abort-on-error
- cli: --help
- Output-Callback-Functions "starts", "output", "error" (Defines in the options).
- shorthand args?
- Use of [private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

## Documentation

- [api](./docs/api.md)
- [cli](./docs/cli.md)
- [examples](./docs/examples.md)
