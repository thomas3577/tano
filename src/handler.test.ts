import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { Handler } from './handler.ts';
import { task } from './task.ts';

describe(Handler.name, () => {
  it(``, () => {
    const handler = new Handler();

    handler.add(task('myTask', 'ls', { cwd: 'C:\\' }));

    assertEquals(handler.count, 1);
  });
});
