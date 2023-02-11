import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { ITask } from './definitions.ts';
import { Task, task } from './task.ts';

describe(task.name, () => {
  it(`Task Var 00`, () => {
    const myTask: ITask = task('my-task', []);

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 01`, () => {
    const myTask: ITask = task(new Task('my-task'));

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 02`, () => {
    const myTask: ITask = task('my-task', () => {});

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 03`, () => {
    const myTask: ITask = task('my-task', ['my-pretask-one', 'my-pretask-two']);

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 04`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one']);
    const myPreTaskTwo: ITask = task('my-pretask-two', ['my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, myPreTaskTwo]);

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 05`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one', 'my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, 'my-pretask-two']);

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 06`, () => {
    const myTask: ITask = task('my-task', ['my-pretask-one', 'my-pretask-two'], () => {});

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 07`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one']);
    const myPreTaskTwo: ITask = task('my-pretask-two', ['my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, myPreTaskTwo], () => {});

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 08`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one', 'my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, 'my-pretask-two'], () => {});

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 09`, () => {
    const myTask: ITask = task('my-task', 'My Command');

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 10`, () => {
    const myTask: ITask = task('my-task', 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 11`, () => {
    const myTask: ITask = task('my-task', () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 12`, () => {
    const myTask: ITask = task('my-task', ['my-pretask-one', 'my-pretask-two'], 'My Command');

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 13`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one']);
    const myPreTaskTwo: ITask = task('my-pretask-two', ['my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, myPreTaskTwo], 'My Command');

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 14`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one', 'my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, 'my-pretask-two'], 'My Command');

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 15`, () => {
    const myTask: ITask = task('my-task', ['my-pretask-one', 'my-pretask-two'], () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 16`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one']);
    const myPreTaskTwo: ITask = task('my-pretask-two', ['my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, myPreTaskTwo], () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 17`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one', 'my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, 'my-pretask-two'], () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 18`, () => {
    const myTask: ITask = task('my-task', ['my-pretask-one', 'my-pretask-two'], 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 19`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one']);
    const myPreTaskTwo: ITask = task('my-pretask-two', ['my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, myPreTaskTwo], 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 20`, () => {
    const myPreTaskOne: ITask = task('my-pretask-one', ['my-pre-pretask-one', 'my-pre-pretask-two']);
    const myTask: ITask = task('my-task', [myPreTaskOne, 'my-pretask-two'], 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task');
    assertEquals(myTask.required, ['my-pretask-one', 'my-pretask-two']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });
});
