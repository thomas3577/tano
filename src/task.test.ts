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

  it(`Should run the task.`, async () => {
    const actual: Task = new Task('my-task-01', [], `echo 'Runs my task'`);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task-01');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });
});
