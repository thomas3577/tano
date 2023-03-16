import { assertEquals, assertInstanceOf, assertNotEquals } from 'std/testing/asserts.ts';
import { afterEach, describe, it } from 'std/testing/bdd.ts';

import { handler } from './handler.ts';
import { Task } from './task.ts';

describe(Task.name, () => {
  afterEach(() => {
    handler.clear();
  });

  it(`Should create a instance of Task`, () => {
    const actual: Task = new Task('my-task');

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');
  });

  it(`Should run the command line.`, async () => {
    const actual: Task = new Task('my-task', [], `echo 'Runs my task'`);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should run the function.`, async () => {
    const actual: Task = new Task('my-task', [], () => {});

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should not run if conditions false. (1)`, async () => {
    const actual: Task = new Task('my-task', [], () => {}, {
      condition: 1 + 2 === 4,
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');

    await actual.runThis();

    assertEquals(actual.status, 'ready');
  });

  it(`Should not run if conditions false. (2)`, async () => {
    const actual: Task = new Task('my-task', [], () => {}, {
      condition: () => false,
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');

    await actual.runThis();

    assertEquals(actual.status, 'ready');
  });

  it(`Should not run if conditions false. (3)`, async () => {
    const actual: Task = new Task('my-task', [], () => {}, {
      condition: (done: any) => setTimeout(() => done(false), 100),
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');

    await actual.runThis();

    assertEquals(actual.status, 'ready');
  });

  it(`Should not run if conditions false. (4)`, async () => {
    const actual: Task = new Task('my-task', [], () => {}, {
      condition: async () => {
        return await Promise.resolve(false);
      },
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');

    await actual.runThis();

    assertEquals(actual.status, 'ready');
  });

  it(`Should not run if conditions false. (5)`, async () => {
    const actual: Task = new Task('my-task', [], () => {}, {
      condition: () => {
        return Promise.resolve(false);
      },
    });

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'my-task');

    await actual.runThis();

    assertEquals(actual.status, 'ready');
  });
});
