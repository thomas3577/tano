# tano

Just another task runner.

## Preparation

Create a TypeScript file with the name `tanofile.ts`, import the 'task' function and create your tasks.

```TypeScript
import { task } from './src/task.ts';

task('my-task', 'ls', { cwd: 'C:\\' });
task('default', 'ls', { cwd: 'C:\\' });
```

## Using with deno run

**Execute default task:**

```bash
deno run --allow-read --allow-run ./src/tano.ts
```

**Execute my-task:**

```bash
deno run --allow-read --allow-run ./src/tano.ts --task my-task
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
