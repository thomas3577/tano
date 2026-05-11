// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertRejects } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { join } from '@std/path';
import { computeHash } from './glob.ts';

const dirs: string[] = [];

const createTempDir = async (): Promise<string> => {
  const dir = await Deno.makeTempDir({ prefix: 'tano-glob-test-' });
  dirs.push(dir);

  return dir;
};

afterEach(async () => {
  while (dirs.length > 0) {
    const dir = dirs.pop() as string;
    await Deno.remove(dir, { recursive: true });
  }
});

describe('computeHash', () => {
  it('should return undefined when source is not provided', async () => {
    const actual = await computeHash();

    assertEquals(actual, undefined);
  });

  it('should throw when no files are matched', async () => {
    const dir = await createTempDir();

    await assertRejects(
      async () => await computeHash({ include: [join(dir, 'missing.txt')], root: dir }),
      Error,
      'No files were matched using the provided globs.',
    );
  });

  it('should change hash when an included file changes', async () => {
    const dir = await createTempDir();
    const file = join(dir, 'a.txt');

    await Deno.writeTextFile(file, 'hello');

    const hash1 = await computeHash({ include: [file], root: dir });

    await Deno.writeTextFile(file, 'hello world');

    const hash2 = await computeHash({ include: [file], root: dir });

    assertEquals(hash1 === hash2, false);
  });

  it('should ignore excluded files', async () => {
    const dir = await createTempDir();
    const included = join(dir, 'included.txt');
    const excluded = join(dir, 'excluded.txt');

    await Deno.writeTextFile(included, 'same');
    await Deno.writeTextFile(excluded, 'before');

    const hash1 = await computeHash({
      include: [included, excluded],
      exclude: [excluded],
      root: dir,
    });

    await Deno.writeTextFile(excluded, 'after and changed');

    const hash2 = await computeHash({
      include: [included, excluded],
      exclude: [excluded],
      root: dir,
    });

    assertEquals(hash1, hash2);
  });
});
