# tano

Just another task runner.

## Usage

Create a TypeScript file with the name `tanofile.ts`, import the 'task' function and create your tasks.

```TypeScript
import { task } from './src/task.ts';

task('myTask', 'ls', { cwd: 'C:\\' });
```

Execute it.

```bash
deno run --allow-read --allow-run ./src/tano.ts
```
