// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals } from '@std/assert';
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

  it('should return undefined when no files are matched', async () => {
    const dir = await createTempDir();

    const actual = await computeHash({ include: [join(dir, 'missing.txt')], root: dir });

    assertEquals(actual, undefined);
  });

  it('should resolve a relative include against the root', async () => {
    const dir = await createTempDir();

    await Deno.mkdir(join(dir, 'src'));
    await Deno.writeTextFile(join(dir, 'src', 'a.ts'), 'a');

    const actual = await computeHash({ include: ['src/*.ts'], root: dir });

    assertEquals(typeof actual, 'string');
  });

  it('should cover nested directories', async () => {
    const dir = await createTempDir();
    const nested = join(dir, 'sub', 'deep');

    await Deno.mkdir(nested, { recursive: true });
    await Deno.writeTextFile(join(nested, 'a.ts'), 'before');

    const hash1 = await computeHash({ include: ['**'], root: dir });

    await Deno.writeTextFile(join(nested, 'a.ts'), 'after, and quite a bit longer');

    const hash2 = await computeHash({ include: ['**'], root: dir });

    assertEquals(typeof hash1, 'string');
    assertEquals(hash1 === hash2, false);
  });

  it('should never hash .git, node_modules or .tano', async () => {
    const dir = await createTempDir();

    await Deno.mkdir(join(dir, '.git'));
    await Deno.mkdir(join(dir, 'node_modules'));
    await Deno.mkdir(join(dir, '.tano'));
    await Deno.writeTextFile(join(dir, 'a.ts'), 'a');
    await Deno.writeTextFile(join(dir, '.git', 'index'), 'before');
    await Deno.writeTextFile(join(dir, 'node_modules', 'x.js'), 'before');
    await Deno.writeTextFile(join(dir, '.tano', 'cache.json'), 'before');

    const hash1 = await computeHash({ include: ['**'], root: dir });

    await Deno.writeTextFile(join(dir, '.git', 'index'), 'after!');
    await Deno.writeTextFile(join(dir, 'node_modules', 'x.js'), 'after!');
    await Deno.writeTextFile(join(dir, '.tano', 'cache.json'), 'after!');

    const hash2 = await computeHash({ include: ['**'], root: dir });

    assertEquals(hash1, hash2);
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

  it('should change hash when the content changes but the size does not', async () => {
    const dir = await createTempDir();
    const file = join(dir, 'a.ts');

    await Deno.writeTextFile(file, 'before');

    const hash1 = await computeHash({ include: ['**'], root: dir });

    await Deno.writeTextFile(file, 'after!');

    const hash2 = await computeHash({ include: ['**'], root: dir });

    assertEquals(hash1 === hash2, false);
  });

  it('should hash the same sources equally regardless of where they are checked out', async () => {
    const hashes: string[] = [];

    for (let run = 0; run < 2; run++) {
      const dir = await createTempDir();

      await Deno.mkdir(join(dir, 'src'));
      await Deno.writeTextFile(join(dir, 'src', 'a.ts'), 'the same content');

      hashes.push(await computeHash({ include: ['**'], root: dir }) as string);
    }

    assertEquals(hashes[0], hashes[1]);
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
