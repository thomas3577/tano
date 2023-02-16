# tano

Just another task runner.

## Install

```bash
deno install --allow-read --allow-run https://deno.land/x/install@v0.0.1/tano.ts
```

## Preparation

Create a TypeScript file with the name `tanofile.ts`, import the 'task' function and create your tasks.

```TypeScript
import { task } from 'https://deno.land/x/install@v0.0.1/tano.ts';

task('my-task', 'ls', { cwd: 'C:\\' });
task('default', 'ls', { cwd: 'C:\\' });
```

## Using with tano cli

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
