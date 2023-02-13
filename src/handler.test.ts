import { assertEquals } from 'std/testing/asserts.ts';
import { beforeEach, describe, it } from 'std/testing/bdd.ts';

import { Handler, handler } from './handler.ts';
import { task } from './task.ts';

describe(Handler.name, () => {
  beforeEach(() => {
    handler.clear();
  });

  it(`Should have one task.`, async () => {
    const handler = new Handler();

    handler.add(task('myTask', 'echo "First Task"'));

    assertEquals(handler.count, 1);

    await handler.run();
  });

  it(`Should have two task.`, async () => {
    const handler = new Handler();

    handler.add(task('default', ['pre-task'], 'echo "Second Task"'));
    handler.add(task('pre-task', 'echo "First Task"'));

    assertEquals(handler.count, 2);

    await handler.run();
  });
});
