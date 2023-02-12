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

    handler.add(task('myTask', 'echo "First Task"', { cwd: 'C:\\' }));

    assertEquals(handler.count, 1);

    await handler.run(); // TODO(thu): Evaluation after the run.
  });

  it(`Should have two task.`, async () => {
    const handler = new Handler();

    handler.add(task('default', ['pre-task'], 'echo "Second Task"', { cwd: 'C:\\' }));
    handler.add(task('pre-task', 'echo "First Task"', { cwd: 'C:\\' }));

    assertEquals(handler.count, 2);

    await handler.run(); // TODO(thu): Evaluation after the run.
  });
});
