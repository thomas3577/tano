import { describe, it } from 'std/testing/bdd.ts';
import { assertEquals, assertInstanceOf } from 'std/testing/asserts.ts';
import { normalize } from 'std/path/mod.ts';

import { toPath } from './cache.ts';

describe(toPath.name, () => {
  it(`if cwd is undefined`, () => {
    const cwd = undefined;
    let actual = null;

    try {
      toPath(cwd as unknown as string);
    } catch (error) {
      actual = error;
    }

    assertInstanceOf(actual, TypeError);
  });

  it(`if cwd is null`, () => {
    const cwd = null;
    let actual = null;

    try {
      toPath(cwd as unknown as string);
    } catch (error) {
      actual = error;
    }

    assertInstanceOf(actual, TypeError);
  });

  it(`if cwd is ''`, () => {
    const cwd = '';
    const actual = toPath(cwd as unknown as string);

    assertEquals(actual, normalize('.tano/cache.json'));
  });

  it(`if cwd is '.'`, () => {
    const cwd = '.';
    const actual = toPath(cwd as unknown as string);

    assertEquals(actual, normalize('.tano/cache.json'));
  });

  it(`if cwd is './src'`, () => {
    const cwd = './src';
    const actual = toPath(cwd as unknown as string);

    assertEquals(actual, normalize('./src/.tano/cache.json'));
  });

  it(`if cwd is '../'`, () => {
    const cwd = '../';
    const actual = toPath(cwd as unknown as string);

    assertEquals(actual, normalize('../.tano/cache.json'));
  });
});
