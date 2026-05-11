// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

import { assertEquals } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { TanoCache } from './cache.ts';
import type { TTanoRunData } from './types.ts';

const dirs: string[] = [];

const createTempDir = async (): Promise<string> => {
  const dir = await Deno.makeTempDir({ prefix: 'tano-cache-test-' });
  dirs.push(dir);

  return dir;
};

afterEach(async () => {
  while (dirs.length > 0) {
    const dir = dirs.pop() as string;
    await Deno.remove(dir, { recursive: true });
  }
});

describe('TanoCache', () => {
  it('should persist and read task data from kv', async () => {
    const dir = await createTempDir();
    const cache = new TanoCache(dir);

    const expected: TTanoRunData = {
      tasks: {
        'my-task': {
          lastRun: new Date('2026-01-01T00:00:00.000Z').toISOString(),
          lastStatus: 'success',
          hash: 'abc123',
        },
      },
    };

    await cache.write(expected);
    const actual = await cache.read();

    assertEquals(actual, expected);

    cache.dispose();
  });
});
