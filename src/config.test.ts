// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { config, resetConfig, setup } from './config.ts';

afterEach(() => {
  resetConfig();
});

describe(`config`, () => {
  it(`Should have all defaults applied.`, () => {
    assertEquals(config(), {
      tanoCwd: '',
      failFast: true,
      force: false,
      logFile: '',
      logLevel: 'INFO',
      logOutput: ['console'],
      logEverything: false,
      noCache: false,
      quiet: false,
      concurrency: 1,
    });
  });

  it(`Should only change the given properties.`, () => {
    setup({ logLevel: 'DEBUG' });

    assertEquals(config().logLevel, 'DEBUG');
    assertEquals(config().logOutput, ['console']);
    assertEquals(config().quiet, false);
  });

  it(`Should keep earlier values on a second setup.`, () => {
    setup({ logLevel: 'DEBUG' });
    setup({ quiet: true });

    assertEquals(config().logLevel, 'DEBUG');
    assertEquals(config().quiet, true);
  });

  it(`Should not write anything to the environment.`, () => {
    setup({ quiet: true, logLevel: 'DEBUG', force: true });

    assertEquals(Deno.env.get('QUIET'), undefined);
    assertEquals(Deno.env.get('LOG_LEVEL'), undefined);
    assertEquals(Deno.env.get('FORCE'), undefined);
  });
});
