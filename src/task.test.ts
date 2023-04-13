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

  it(`If work with source.`, async () => {
    // BEGIN First: No changes.
    const actual1: Task = new Task('task-test-09', [], () => {}, {
      source: './examples/**',
    });

    assertNotEquals(actual1, null);
    assertInstanceOf(actual1, Task);
    assertEquals(actual1.name, 'task-test-09');

    await actual1.runThis();

    assertEquals(actual1.status, 'skipped');

    handler.clear();
    // END First: No changes.

    // BEGIN Second: Has changes.
    await Deno.writeTextFile(
      './examples/test.json',
      JSON.stringify({
        changed: 'A',
      }),
    );

    const actual2: Task = new Task('task-test-09', [], () => {}, {
      source: './examples/**',
    });

    assertNotEquals(actual2, null);
    assertInstanceOf(actual2, Task);
    assertEquals(actual2.name, 'task-test-09');

    await actual2.runThis();

    assertEquals(actual2.status, 'success');

    handler.clear();
    // END Second: Has changes.

    // BEGIN Third: Has changes but forced.
    await Deno.writeTextFile(
      './examples/test.json',
      JSON.stringify({
        changed: 'B',
      }),
    );

    const actual3: Task = new Task('task-test-09', [], () => {}, {
      source: './examples/**',
    });

    assertNotEquals(actual3, null);
    assertInstanceOf(actual3, Task);
    assertEquals(actual3.name, 'task-test-09');

    await actual3.runThis(true);

    assertEquals(actual3.status, 'success');

    handler.clear();
    // END Third: Has changes but forced.
  });
});
