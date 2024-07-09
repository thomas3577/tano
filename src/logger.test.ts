import { assertEquals, assertInstanceOf, assertNotEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { Logger, LogLevels, LogRecord } from '@std/log';
import { logger, logStream } from './logger.ts';

describe(`logger`, () => {
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
  it('Should stream the log output', async () => {
    Deno.env.set('QUIET', 'false');
    Deno.env.set('LOG_LEVEL', 'debug');
    Deno.env.set('LOG_OUTPUT', 'console, stream');

    const actual: Logger = logger();
    const reader = logStream.readable.getReader();

    let log: LogRecord = new LogRecord({
      msg: 'msg',
      args: [],
      level: LogLevels.INFO,
      loggerName: 'loggerName',
    });

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
