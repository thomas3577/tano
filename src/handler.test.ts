import { assertEquals, assertInstanceOf } from 'std/testing/asserts.ts';
import { afterEach, describe, it } from 'std/testing/bdd.ts';

import { Handler, handler } from './handler.ts';
import { needs } from './needs.ts';
import { task } from './task.factory.ts';

describe(Handler.name, () => {
  afterEach(() => {
    handler.clear();
  });

  it(`Should have one task.`, () => {
    task('myTask', `echo 'First Task'`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);
  });

  it(`Should have two task.`, () => {
    task('default', needs('pre-task'), `echo 'Second Task'`);
    task('pre-task', `echo 'First Task'`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);
  });

  it(`Should run no task (because no default-task and no task set.).`, async () => {
    task('myTask', `echo 'First Task'`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 0);
  });

  it(`Should run one task.`, async () => {
    task('myTask', `echo 'First Task'`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);

    await handler.run('myTask');

    assertEquals(handler.executed, 1);
  });

  it(`Should throws an error if trying to runs two times.`, async () => {
    task('default', needs('pre-task'), `echo 'Second Task'`);
    task('pre-task', `echo 'First Task'`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);

    await handler.run()
      .catch((error) => {
        assertInstanceOf(error, Error);
      });

    assertEquals(handler.executed, 2);
  });

  it(`Should runs two times.`, async () => {
    task('default', needs('pre-task'), `echo 'Second Task'`);
    task('pre-task', `echo 'First Task'`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);

    handler.reset();

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);
  });
});
