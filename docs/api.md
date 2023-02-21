# Task API

There are some overloads. The return value is in any case `ITask`.

## Overload 1

```TypeScript
task(task: ITask) => ITask;
```

**Parameters:**

- `task` (ITask): An instance of an exist Task.

**Example:**

```TypeScript
import { ITask, Task, task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

const myTask: ITask = new Task('My Task');

task(myTask);
```

## Overload 2

```TypeScript
task(taskParams: ITaskParams) => ITask;
```

**Parameters:**

- `taskParams` (ITaskParams): Is an object that can contain all necessary parameters for a task. The following properties are included:

**Example:**

```TypeScript
import { ITaskParams, task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

const taskParams: ITaskParams = {
  name: 'My Task',
};

task(taskParams);
```

## Overload 3

```TypeScript
task(taskName: string, needs: INeeds) => ITask;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `needs` (INeeds): Names of tasks to be executed before this task. The following properties are included:
- `values` ((string | ITaskParams)[]): List of task names or task params. You can mix them.

**Example:**

```TypeScript
import { INeeds, task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

const needs: INeeds = {
  values: ['My Pre Task'],
};

task('My Task', needs);
```

You can also use the function `needs(...args)`.

**Example with use of `needs()`:**

```TypeScript
import { needs, task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

task('My Task', needs('My Pre Task'));
```

## Overload 4

```TypeScript
task(taskName: string, command?: Command, options?: ICommandOptions) => ITask;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `command` (string | string[]): A Command to run in the shell.
- _(optional)_ `options` (ICommandOptions): The following properties are included:

**Example:**

```TypeScript
import { task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

// Var 1
task('My Task 1', 'ls -la', { cwd: 'C:\\temp' });

// Var 2
task('My Task 2', ['ls', '-la'], { cwd: 'C:\\temp' });

// Var 3
task('My Task 3', ['bash', '-c', 'ls -la'], { cwd: 'C:\\temp' });
```

## Overload 5

```TypeScript
task(taskName: string, needs?: INeeds, command?: Command, options?: ICommandOptions) => ITask;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `needs` (INeeds): Names of tasks to be executed before this task. The following properties are included:
- `command` (string | string[]): A Command to run in the shell.
- _(optional)_ `options` (ICommandOptions): The following properties are included:

**Example:**

```TypeScript
import { INeeds, task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

const needs: INeeds = {
  values: ['My Task 2', 'My Task 3'],
};

task('My Task 2', ['ls', '-la'], { cwd: 'C:\\temp' });
task('My Task 3', ['bash', '-c', 'ls -la'], { cwd: 'C:\\temp' });
task('default', needs 'ls -la', { cwd: 'C:\\temp' });
```

## Overload 6

```TypeScript
task(taskName: string, code?: Code, options?: ICommandOptions) => ITask;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `code` (Code]): A JavaScript/TypeScript Function or File.
- _(optional)_ `options` (ICodeOptions): The following properties are included:

**Example:**

```TypeScript
import { task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

// Var 1
task('default', () => {
  // Do something.
});

// Var 2
task('My Task 2', (done) => {
  setTimeout(() => {
    // Do something.
    done();
  }, 10000);
});

// Var 3
task('My Task 3', (): Promise<void> => {
  // Do something.

  Promise.resolve();
});

// Var 4
task('My Task 4', async (): Promise<void> => {
  // Do something.

  await Promise.resolve();
});
```

**Note!**

Functions like in the examples above are executed in the main process. If you want to run JavaScript/TypeScript in a separate process you can either do this with the `eval` option or outsource the code to a separate file.

**Example:**

```TypeScript
import { task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

// Var 5
task('My Task 5', () => {
  // Do something.
}, { eval: true });

// Var 6
task('My Task 6', 'my-task-6.ts');
```
