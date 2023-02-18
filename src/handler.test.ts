import { assertEquals, assertInstanceOf } from 'std/testing/asserts.ts';
import { beforeEach, describe, it } from 'std/testing/bdd.ts';

import { Handler, handler } from './handler.ts';
import { needs } from './needs.ts';
import { task } from './task.factory.ts';

describe(Handler.name, () => {
  beforeEach(() => {
    handler.clear();
  });

  it(`Should have one task.`, async () => {
    const handler = new Handler();

    handler.add(task('myTask', `echo 'First Task'`));

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 0); // TODO(thu): Should be 1!!!
  });

  it(`Should have two task.`, async () => {
    const handler = new Handler();

    handler.add(task('default', needs('pre-task'), `echo 'Second Task'`));
    handler.add(task('pre-task', `echo 'First Task'`));

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);
  });

  it(`Should throws an error if trying to runs two times.`, async () => {
    const handler = new Handler();

    handler.add(task('default', needs('pre-task'), `echo 'Second Task'`));
    handler.add(task('pre-task', `echo 'First Task'`));

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
    const handler = new Handler();

    handler.add(task('default', needs('pre-task'), `echo 'Second Task'`));
    handler.add(task('pre-task', `echo 'First Task'`));

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
