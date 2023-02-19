# Task API

There are some overloads.

## Overload 1

```TypeScript
task(task: ITask) => ITask;
```

**Parameters:**

- `task` (ITask): An instance of an exist Task.

**Return Value:**

- (ITask): An instance of an Task.

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

  - `name` (string): The name of the Task. The name of a task must always be unique.
  - _(optional)_ `needs`: (string[]): Names of tasks to be executed before this task.
  - _(optional)_ `options` (ITaskOptions): Options for this task.

**Return Value:**

- (ITask): An instance of an Task.

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

**Return Value:**

- (ITask): An instance of an Task.

**Example:**

```TypeScript
import { INeeds, task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

const needs: INeeds = {
  values: 'My Pre Task',
};

task('My Task', needs);
```

You can also use the function `needs(...args)`.

**Example with use of `needs()`:**

```TypeScript
import { needs, task } from 'https://deno.land/x/install@v0.0.1/mod.ts';

task('My Task', needs('My Pre Task'));
```
