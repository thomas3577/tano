// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertInstanceOf } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';
import { Logger, LogLevels } from '@std/log';
import type { LogRecord } from '@std/log';
import { logger, logStream } from './logger.ts';

const envKeys = ['QUIET', 'LOG_LEVEL', 'LOG_OUTPUT'] as const;
type TEnvKey = (typeof envKeys)[number];
type TEnvSnapshot = Record<TEnvKey, string | undefined>;

const snapshotEnv = (): TEnvSnapshot => {
  const snapshot = {} as TEnvSnapshot;

  for (const key of envKeys) {
    snapshot[key] = Deno.env.get(key);
  }

  return snapshot;
};

const restoreEnv = (snapshot: TEnvSnapshot): void => {
  for (const key of envKeys) {
    const value = snapshot[key];

    if (value === undefined) {
      Deno.env.delete(key);
      continue;
    }

    Deno.env.set(key, value);
  }
};

const resetLoggerEnv = (): void => {
  Deno.env.set('QUIET', 'false');
  Deno.env.delete('LOG_LEVEL');
  Deno.env.delete('LOG_OUTPUT');
};

describe(`logger`, () => {
  let envSnapshot: TEnvSnapshot;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    resetLoggerEnv();
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it(`Should create a instance of Logger`, () => {
    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.INFO);
  });

  it(`Should have log level 'ERROR' (1)`, () => {
    Deno.env.set('QUIET', 'false');
    Deno.env.set('LOG_LEVEL', 'ERROR');

    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.ERROR);
  });

  it(`Should have log level 'ERROR' (1)`, () => {
    Deno.env.set('QUIET', 'false');
    Deno.env.set('LOG_LEVEL', 'error');

    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.ERROR);
  });
});

describe(`logStream`, () => {
  let envSnapshot: TEnvSnapshot;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    resetLoggerEnv();
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('Should stream the log output', async () => {
    Deno.env.set('QUIET', 'false');
    Deno.env.set('LOG_LEVEL', 'debug');
    Deno.env.set('LOG_OUTPUT', 'console, stream');

    const actual: Logger = logger();
    const reader = logStream.readable.getReader();

    let log: LogRecord = {
      msg: 'msg',
      args: [],
      level: LogLevels.INFO,
      loggerName: 'loggerName',
      levelName: '',
      datetime: new Date(),
    } as unknown as LogRecord;

    assertEquals(actual.handlers.length, 2);

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        console.log(value);
        log = JSON.parse(value);
      }
    })();

    actual.info('Hello, world!');

    await new Promise((resolve) => setTimeout(resolve, 250));

    assertEquals(log.msg, 'Hello, world!');
    assertEquals(log.levelName, 'INFO');
    assertEquals(log.loggerName, 'default');

    await reader.cancel();
  });
});
