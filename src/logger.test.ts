// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertInstanceOf } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { gray } from '@std/fmt/colors';
import { Logger, LogLevels } from '@std/log';
import type { LogRecord } from '@std/log';
import { logger, logStream } from './logger.ts';
import { resetConfig, setup } from './config.ts';

afterEach(() => {
  resetConfig();
});

describe(`logger`, () => {
  it(`Should create a instance of Logger`, () => {
    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.INFO);
  });

  it(`Should have log level 'ERROR' (1)`, () => {
    setup({ logLevel: 'ERROR' });

    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.ERROR);
  });

  it(`Should have log level 'ERROR' (1) for a lowercase log level`, () => {
    setup({ logLevel: 'error' });

    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.ERROR);
  });
});

describe(`logStream`, () => {
  it('Should stream the log output', async () => {
    setup({ logLevel: 'debug', logOutput: ['console', 'stream'] });

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

        log = JSON.parse(value);
      }
    })();

    actual.info('Hello, world!');

    await new Promise((resolve) => setTimeout(resolve, 250));

    assertEquals(log.msg, 'Hello, world!');
    assertEquals(log.levelName, 'INFO');
    assertEquals(log.loggerName, 'default');

    actual.info(`Starting '${gray('{name}')}'...`, { name: 'my-task' });

    await new Promise((resolve) => setTimeout(resolve, 250));

    assertEquals(log.msg, `Starting 'my-task'...`);

    await reader.cancel();
  });
});
