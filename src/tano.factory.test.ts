import { assertEquals, assertInstanceOf } from '$std/assert/mod.ts';
import { describe, it } from '$std/testing/bdd.ts';
import { toFileUrl } from '$std/path/mod.ts';

import { getCwd, getImportUrl } from './tano.factory.ts';

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
      actual = await getImportUrl(fileOrUrl);
    } catch (err: unknown) {
      assertInstanceOf(err, Error);
    }

    assertEquals(actual, 'init');
  });

  it(`if param is not a file`, async () => {
    const fileOrUrl = './examples';
    let actual = 'init';

    try {
      actual = await getImportUrl(fileOrUrl);
    } catch (err: unknown) {
      assertInstanceOf(err, Error);
    }

    assertEquals(actual, 'init');
  });

  it(`if param is a valid url`, async () => {
    const fileOrUrl = 'https://some.thing/tanofile.ts';
    const actual = await getImportUrl(fileOrUrl);

    assertEquals(actual, 'https://some.thing/tanofile.ts');
  });

  it(`if param is a valid relative path`, async () => {
    const fileOrUrl = './examples/tanofile.ts';
    const actual = await getImportUrl(fileOrUrl);

    assertEquals(actual.endsWith('tanofile.ts'), true);
  });

  it(`if param is a valid absolute path`, async () => {
    const fileOrUrl = await Deno.realPath('./examples/tanofile.ts');
    const actual = await getImportUrl(fileOrUrl);

    assertEquals(actual.endsWith('tanofile.ts'), true);
  });
});

describe(getCwd.name, () => {
  it(`if param is undefined`, () => {
    const importUrl = undefined;
    const actual = getCwd(importUrl as unknown as string);

    assertEquals(actual, Deno.cwd());
  });

  it(`if param is null`, () => {
    const importUrl = null;
    const actual = getCwd(importUrl as unknown as string);

    assertEquals(actual, Deno.cwd());
  });

  it(`if param is a valid url`, () => {
    const importUrl = 'https://some.thing/tanofile.ts';
    const actual = getCwd(importUrl);

    assertEquals(actual, Deno.cwd());
  });

  it(`if param is a valid absolute path`, () => {
    const importUrl = toFileUrl(Deno.realPathSync('./examples/tanofile.ts')).toString();
    const actual = getCwd(importUrl);

    assertEquals(actual.endsWith('examples'), true);
  });
});
