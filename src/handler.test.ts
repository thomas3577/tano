import { assertEquals, assertInstanceOf } from '@std/assert';
import { afterEach, beforeAll, describe, it } from '@std/testing/bdd';
import { spy } from '@std/testing/mock';

import { Handler, handler } from './handler.ts';
import { needs } from './needs.ts';
import { task } from './task.factory.ts';

describe(Handler.name, () => {
  beforeAll(() => {
    spy(Deno.writeTextFile);
  });

  afterEach(() => {
    handler.clear();
  });

  it(`Should have one task.`, () => {
    task('myTask', `pwsh -c echo 'First Task'`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);
  });

  it(`Should have two task.`, () => {
    task('default', needs('pre-task'), `pwsh -c echo 'Second Task'`);
    task('pre-task', `pwsh -c echo 'First Task'`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);
  });

  it(`Should run no task (because no default-task and no task set.).`, async () => {
    task('myTask', `pwsh -c echo 'First Task'`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 0);
  });

  it(`Should run one task.`, async () => {
    task('myTask', `pwsh -c echo 'First Task'`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);

    await handler.run('myTask');

    assertEquals(handler.executed, 1);
  });

  it(`Should throws an error if trying to runs two times.`, async () => {
    task('default', needs('pre-task'), `pwsh -c echo 'Second Task'`);
    task('pre-task', `pwsh -c echo 'First Task'`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);

    await handler.run()
      .catch((err) => {
        assertInstanceOf(err, Error);
      });

    assertEquals(handler.executed, 2);
  });

  it(`Should runs two times.`, async () => {
    task('default', needs('pre-task'), `pwsh -c echo 'Second Task'`);
    task('pre-task', `pwsh -c echo 'First Task'`);

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

  it(`Should abort at first error`, async () => {
    try {
      task('pre-task-one', () => {
        throw new Error('ERROR! ERROR! ERROR!');
      });
      task('pre-task-two', `pwsh -c echo 'if you see the second pre-task, something went wrong'`);
      task('default', needs('pre-task-one', 'pre-task-two'), `pwsh -c echo 'if you see me, something went wrong'`);

      await handler.run();
    } catch (err: unknown) {
      assertInstanceOf(err, Error);
    }
  });

  it(`Should NOT abort at first error`, async () => {
    task('pre-task-one', () => {
      throw new Error('ERROR! ERROR! ERROR!');
    });
    task('pre-task-two', `pwsh -c echo 'if you see the second pre-task, something went wrong'`);
    task('default', needs('pre-task-one', 'pre-task-two'), `pwsh -c echo 'if you see me, something went wrong'`);

    await handler.run('default', false);

    assertEquals(handler.executed, 3);
  });
});
