import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { checkChanges } from './changes.ts';

describe(checkChanges.name, () => {
  it(``, async () => {
    const actual = await checkChanges('./', '2023-03-07T20:42:44.716Z');

    assertEquals(actual, true);
  });
});
