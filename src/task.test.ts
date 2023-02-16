import { assertEquals, assertInstanceOf, assertNotEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { Task } from './task.ts';

import type { ITask } from './definitions.ts';

describe(Task.name, () => {
  it(`Should create a instance of Task`, () => {
    const actual: ITask = new Task('my-task-instance');

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task-instance');
  });
});
