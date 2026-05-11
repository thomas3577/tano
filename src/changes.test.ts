// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

import { assertEquals } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { Changes } from './changes.ts';

const dirs: string[] = [];

const createTempDir = async (): Promise<string> => {
  const dir = await Deno.makeTempDir({ prefix: 'tano-changes-test-' });
  dirs.push(dir);

  return dir;
};

afterEach(async () => {
  while (dirs.length > 0) {
    const dir = dirs.pop() as string;
    await Deno.remove(dir, { recursive: true });
  }
});

describe('Changes', () => {
  it('should write and read run data via update/get without prior read', async () => {
    const dir = await createTempDir();
    const changes = new Changes(dir);

    const timestamp = new Date('2026-01-01T00:00:00.000Z');

    await changes.update('my-task', timestamp, 'success');
    const runData = await changes.get('my-task');

    assertEquals(runData, {
      lastRun: timestamp.toISOString(),
      lastStatus: 'success',
      hash: undefined,
    });

    changes.dispose();
  });
});
