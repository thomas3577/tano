# tano

Just another task runner.

## Install

```bash
deno install --allow-read --allow-run --allow-net https://deno.land/x/install@v0.0.1/mod.ts
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

- Documentation & Examples
- Conditions
- Modify Log output.
- More tests
