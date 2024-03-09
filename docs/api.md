# Task API

There are some overloads. The return value is in any case `Task`.

## Overload 1

```ts
task(task: Task) => Task;
```

**Parameters:**

- `task` (Task): An instance of an exist Task.

**Example:**

```ts
import { Task, task } from 'jsr:@toea/tano';

const myTask: Task = new Task('My Task');

task(myTask);
```

## Overload 2

```ts
task(taskParams: TaskParams) => Task;
```

**Parameters:**

- `taskParams` (TaskParams): Is an object that can contain all necessary parameters for a task.

**Example:**

```ts
import { task, TaskParams } from 'jsr:@toea/tano';

const taskParams: TaskParams = {
  name: 'My Task',
};

task(taskParams);
```

## Overload 3

```ts
task(taskName: string, needs: Needs) => Task;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `needs` (Needs): Names of tasks to be executed before this task.
- `values` ((string | TaskParams)[]): List of task names or task params. You can mix them.

**Example:**

```ts
import { Needs, task } from 'jsr:@toea/tano';

const needs: Needs = {
  values: ['My Pre Task'],
};

task('My Pre Task');
task('My Task', needs);
```

You can also use the function `needs(...args)`.

**Example with use of `needs()`:**

```ts
import { needs, task } from 'jsr:@toea/tano';

task('My Task', needs('My Pre Task'));
```

**Example with embedded, needed tasks (Var 1):**

```ts
import { task } from 'jsr:@toea/tano';

task('My Task', {
  values: [
    task('My Pre Task'),
  ],
});
```

**Example with embedded, needed tasks (Var 2):**

```ts
import { , task } from 'jsr:@toea/tano';

task('My Task', needs(task('My Pre Task')));
```

## Overload 4

```ts
task(taskName: string, command?: Command, options?: CommandOptions) => Task;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `command` (string | string[]): A Command to run in the shell.
- _(optional)_ `options` (CommandOptions): Options for command executor.

**Example:**

```ts
import { task } from 'jsr:@toea/tano';

// Var 1
task('My Task 1', 'ls -la', { cwd: 'C:\\temp' });

// Var 2
task('My Task 2', ['ls', '-la'], { cwd: 'C:\\temp' });

// Var 3
task('My Task 3', ['bash', '-c', 'ls -la'], { cwd: 'C:\\temp' });
```

## Overload 5

```ts
task(taskName: string, needs?: Needs, command?: Command, options?: CommandOptions) => Task;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `needs` (Needs): Names of tasks to be executed before this task.
- `command` (string | string[]): A Command to run in the shell.
- _(optional)_ `options` (CommandOptions): Options for command executor.

**Example:**

```ts
import { Needs, task } from 'jsr:@toea/tano';

const needs: Needs = {
  values: ['My Task 2', 'My Task 3'],
};

task('My Task 2', ['ls', '-la'], { cwd: 'C:\\temp' });
task('My Task 3', ['bash', '-c', 'ls -la'], { cwd: 'C:\\temp' });
task('default', needs 'ls -la', { cwd: 'C:\\temp' });
```

## Overload 6

```ts
task(taskName: string, code?: Code, options?: CommandOptions) => Task;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `code` (Code]): A JavaScript/TypeScript Function or File.
- _(optional)_ `options` (CodeOptions): Options for code executor.

**Example:**

```ts
import { task } from 'jsr:@toea/tano';

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

Functions like in the examples above are executed in the main process. If you want to run JavaScript/TypeScript in a separate process you can either do this with the `repl` option or outsource the code to a separate file.

**Example:**

```ts
import { task } from 'jsr:@toea/tano';

// Var 5
task('My Task 5', () => {
  // Do something.
}, { repl: true });

// Var 6
task('My Task 6', 'my-task-6.ts');
```

## Overload 7

```ts
task(taskName: string, needs?: Needs, code?: Code, options?: CommandOptions) => Task;
```

**Parameters:**

- `taskName` (string): Sets the name of the task.
- `needs` (Needs): Names of tasks to be executed before this task.
- `code` (Code]): A JavaScript/TypeScript Function or File.
- _(optional)_ `options` (CodeOptions): Options for code executor.

**Example:**

```ts
import { task } from 'jsr:@toea/tano';

task('My Task 2', ['ls', '-la'], { cwd: 'C:\\temp' });
task('default', needs(), ('My Task 2') => {
  // Do something.
});
```
