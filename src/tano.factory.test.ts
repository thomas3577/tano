import { assertEquals, assertInstanceOf } from '$std/assert/mod.ts';
import { describe, it } from '$std/testing/bdd.ts';

import { getImportUrl } from './tano.factory.ts';

describe(getImportUrl.name, () => {
  it(`if param is undefined`, async () => {
    const fileOrUrl = undefined;
    let actual = 'init';

    try {
      actual = await getImportUrl(fileOrUrl as unknown as string);
    } catch (err: unknown) {
      assertInstanceOf(err, TypeError);
    }

    assertEquals(actual, 'init');
  });

  it(`if param is null`, async () => {
    const fileOrUrl = null;
    let actual = 'init';

    try {
      actual = await getImportUrl(fileOrUrl as unknown as string);
    } catch (err: unknown) {
      assertInstanceOf(err, TypeError);
    }

    assertEquals(actual, 'init');
  });

  it(`if param is a invalid path`, async () => {
    const fileOrUrl = 'something';
    let actual = 'init';

    try {
      actual = await getImportUrl(fileOrUrl as unknown as string);
    } catch (err: unknown) {
      assertInstanceOf(err, Error);
    }

    assertEquals(actual, 'init');
  });

  it(`if param is a valid url`, async () => {
    const fileOrUrl = 'https://some.thing/tanofile.ts';
    const actual = await getImportUrl(fileOrUrl as unknown as string);

    assertEquals(actual, 'https://some.thing/tanofile.ts');
  });

  it(`if param is a valid url`, async () => {
    const fileOrUrl = './examples/tanofile.ts';
    const actual = await getImportUrl(fileOrUrl as unknown as string);

    assertEquals(actual.endsWith('tanofile.ts'), true);
  });
});
