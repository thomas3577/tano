import { assertEquals, assertInstanceOf } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { LogLevels } from 'std/log/levels.ts';

import { Logger, logger } from './logger.ts';

describe(`logger`, () => {
  it(`Should create a instance of Logger`, () => {
    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.INFO);
  });

  it(`Should be quiet`, () => {
    Deno.env.set('SILENT', 'true');

    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 0);
    assertEquals(actual.level, LogLevels.INFO);
  });

  it(`Should have log level 'ERROR' (1)`, () => {
    Deno.env.set('SILENT', 'false');
    Deno.env.set('LOG_LEVEL', 'ERROR');

    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.ERROR);
  });

  it(`Should have log level 'ERROR' (1)`, () => {
    Deno.env.set('SILENT', 'false');
    Deno.env.set('LOG_LEVEL', 'error');

    const actual: Logger = logger();

    assertInstanceOf(actual, Logger);
    assertEquals(actual.handlers.length, 1);
    assertEquals(actual.level, LogLevels.ERROR);
  });
});
