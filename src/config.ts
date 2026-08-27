// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module holds the tano configuration.
 *
 * @remarks
 * The configuration used to travel through process environment variables, which leaked every value into the environment of every spawned task. It is kept here instead.
 *
 * @module
 */

import type { TTanoConfig, TTanoConfigStrict } from './types.ts';

const defaults: TTanoConfigStrict = {
  tanoCwd: '',
  failFast: true,
  force: false,
  logFile: './tano.log',
  logLevel: 'INFO',
  logOutput: ['console'],
  logEverything: false,
  noCache: false,
  quiet: false,
};

let current: TTanoConfigStrict = { ...defaults };
let version: number = 0;

/**
 * Gets the current tano configuration, with all defaults applied.
 *
 * @returns {TTanoConfigStrict} The current configuration.
 */
export const config = (): TTanoConfigStrict => current;

/**
 * Gets a counter that is increased whenever the configuration changes.
 *
 * @remarks
 * Lets a consumer cache something derived from the configuration and notice when it went stale, without this module having to know about that consumer.
 *
 * @returns {number} The current version of the configuration.
 */
export const configVersion = (): number => version;

/**
 * Possibility to setup the tano configuration. Just add to your `tanofile.ts`.
 *
 * @remarks
 * Only the given properties are changed, everything else keeps its current value.
 *
 * @param {TTanoConfig} config - The tano configuration.
 *
 * @example Set config in your `tanofile.ts`:
 * ```ts
 * import { setup } from 'jsr:@dx/tano';
 *
 * setup({
 *   logLevel: 'DEBUG',
 * });
 * ```
 */
export const setup = (config: TTanoConfig): void => {
  current = { ...current, ...config };
  version++;
};

/**
 * Resets the configuration to its defaults.
 *
 * @remarks
 * Only needed to isolate tests from each other.
 */
export const resetConfig = (): void => {
  current = { ...defaults };
  version++;
};
