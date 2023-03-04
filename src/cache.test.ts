import { assertEquals } from 'std/testing/asserts.ts';
import { beforeAll, describe, it } from 'std/testing/bdd.ts';
import { assertSpyCalls, spy } from 'std/testing/mock.ts';

import { writeToCache } from './cache.ts';

describe(writeToCache.name, () => {
  let writeTextFileSpy: any = null;

  beforeAll(() => {
    writeTextFileSpy = spy(Deno.writeTextFile);
  });

  it('', async () => {
    const actual = await writeToCache('', {})
      .then(() => true);

    assertEquals(actual, true);
    assertSpyCalls(writeTextFileSpy, 1);
  });
});
