# Examples

Each example can be executed with the following command:

```bash
tano
```

## 01 Run command line

**tanofile.ts:**

```ts
import { task } from 'jsr:@dx/tano';

task('default', `ls`);
```

## 02 Run command line from different working directory

**tanofile.ts:**

```ts
import { task } from 'jsr:@dx/tano';

task('default', `ls`, { cwd: '/usr/bin' });
```

## 03 Run a function

**tanofile.ts:**

```ts
import { task } from 'jsr:@dx/tano';

const myTask = task('default', () => {
  console.log('Hello world');
});

// Output:
// Hello world
```

## 04 Run a function with promise

**tanofile.ts:**

```ts
import { task } from 'jsr:@dx/tano';

task('default', (): Promise<void> => {
  console.log('Hello world');
  Promise.resolve();
});

// Output:
// Hello world
```

## 05 Run a function async

**tanofile.ts:**

```ts
import { task } from 'jsr:@dx/tano';

task('default', async (): Promise<void> => {
  console.log('Hello world');
  await Promise.resolve();
});

// Output:
// Hello world
```

## 06 Run a function with callback function

**tanofile.ts:**

```ts
import { task } from 'jsr:@dx/tano';

task('default', (done): void => {
  setTimeout(() => {
    console.log('Hello world');
    done();
  }, 250);
});

// Output:
// Hello world
```

## 07 Run a pre-task

**tanofile.ts:**

```ts
import { needs, task } from 'jsr:@dx/tano';

task('my-pre-task', () => console.log('Will be executed first'));
task('default', needs('my-pre-task'), () => console.log('Runs as second task'));

// Output:
// Will be executed first
// Runs as second task
```

## 08 Run many tasks

**tanofile.ts:**

```ts
import { needs, task } from 'jsr:@dx/tano';

task('task01', `echo '1'`);
task('task02', `echo '2'`);
task('task03', `echo '3'`);
task('default', needs('task01', 'task02', 'task03'));

// Output:
// 1
// 2
// 3
```

## 09 Run many tasks with final task

**tanofile.ts:**

```ts
import { needs, task } from 'jsr:@dx/tano';

task('task01', `echo '1'`);
task('task02', `echo '2'`);
task('task03', `echo '3'`);
task('default', needs('task01', 'task02', 'task03'), `echo '4'`);

// Output:
// 1
// 2
// 3
// 4
```

## 10 Or in another way

**tanofile.ts:**

```ts
import { needs, task } from 'jsr:@dx/tano';

task(
  'default',
  needs(
    task('task01', `echo '1'`),
    task('task02', `echo '2'`),
    task('task03', `echo '3'`),
  ),
  `echo '4'`,
);

// Output:
// 1
// 2
// 3
// 4
```

## 11 Run a function with deno repl (--eval)

**tanofile.ts:**

```ts
import { needs, task } from 'jsr:@dx/tano';

task('default', () => console.log('Hello world'), { eval: true });

// Output:
// Hello world
```

## 12 Run from a TypeScript file

**func.ts:**

```ts
console.log('Hello world');
```

**tanofile.ts:**

```ts
import { needs, task } from 'jsr:@dx/tano';

task('default', { file: 'func.ts' });

// Output:
// Hello world
```

## 13 Run from a TypeScript file from another working directory

**func.ts:**

```ts
console.log('Hello world');
```

**tanofile.ts:**

```ts
import { needs, task } from 'jsr:@dx/tano';

task('default', { file: 'func.ts' }, { cwd: '/usr/bin' });

// Output:
// Hello world
```
