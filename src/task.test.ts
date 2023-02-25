import { assertEquals, assertInstanceOf, assertNotEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { Task } from './task.ts';

describe(Task.name, () => {
  it(`Should create a instance of Task`, () => {
    const actual: Task = new Task('my-task-instance');

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task-instance');
  });

  it(`Should run the command line.`, async () => {
    const actual: Task = new Task('my-task-01', [], `echo 'Runs my task'`);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task-01');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should run the function.`, async () => {
    const actual: Task = new Task('my-task-02', [], () => {});

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task-02');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should run the function with conditions (1).`, async () => {
    const actual: Task = new Task('my-task-03', [], () => {}, {
      condition: 1 + 2 === 4,
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task-03');

    await actual.runThis();

    assertEquals(actual.status, 'ready');
  });
});
