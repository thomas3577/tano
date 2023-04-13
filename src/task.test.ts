import { assertEquals, assertInstanceOf, assertNotEquals } from 'std/testing/asserts.ts';
import { afterEach, describe, it } from 'std/testing/bdd.ts';

import { handler } from './handler.ts';
import { Task } from './task.ts';

describe(Task.name, () => {
  afterEach(() => {
    handler.clear();
  });

  it(`Should create a instance of Task`, () => {
    const actual: Task = new Task('task-test-01');

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-01');
  });

  it(`Should run the command line.`, async () => {
    const actual: Task = new Task('task-test-02', [], `echo 'Runs my task'`);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-02');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should run the function.`, async () => {
    const actual: Task = new Task('task-test-03', [], () => {});

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-03');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should not run if conditions false. (1)`, async () => {
    const actual: Task = new Task('task-test-04', [], () => {}, {
      condition: 1 + 2 === 4,
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-04');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (2)`, async () => {
    const actual: Task = new Task('task-test-05', [], () => {}, {
      condition: () => false,
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-05');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (3)`, async () => {
    const actual: Task = new Task('task-test-06', [], () => {}, {
      condition: (done: any) => setTimeout(() => done(false), 100),
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-06');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (4)`, async () => {
    const actual: Task = new Task('task-test-07', [], () => {}, {
      condition: async () => {
        return await Promise.resolve(false);
      },
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-07');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (5)`, async () => {
    const actual: Task = new Task('task-test-08', [], () => {}, {
      condition: () => {
        return Promise.resolve(false);
      },
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-08');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });
});
