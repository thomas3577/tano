// Copyright 2018-2024 the tano authors. All rights reserved. MIT license.

/**
 * This module contains the setup function for the CLI.
 *
 * @module
 */

import { parseArgs } from '@std/cli';
import { join } from '@std/path';
import type { Logger } from '@std/log';
import { getCwd, getImportUrl, toSnakeCase } from './utils.ts';
import { logger } from './logger.ts';
import { handler } from './handler.ts';
import type { TTanoArgs, TTanoCliAction, TTanoConfig } from './types.ts';

type EnvSetBy = 'setup';

const setEnv = (config: TTanoConfig, setBy?: EnvSetBy): void => {
  const overwrittenBy = setBy ? ` (overwritten by ${setBy})` : '';

  Object.entries(config).forEach(([key, value]) => {
    const envKey = toSnakeCase(key)?.toUpperCase();
    if (envKey && value !== undefined) {
      Deno.env.set(envKey, `${value}`);
    }
  });

  const log: Logger = logger();

  handler.updateLogger();

  Object.keys(config).forEach((key) => {
    const envKey = toSnakeCase(key)?.toUpperCase();
    if (envKey) {
      log.debug(`${(envKey + ':').padEnd(16)}${Deno.env.get(envKey)}${overwrittenBy}`);
    }
  });

  log.debug('');
};

/**
 * Possibility to setup the tano configuration. Just add to your `tanofile.ts`.
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
  setEnv(config, 'setup');
};

/**
 * Executed on every CLI call to prepare and provide all options.
 *
 * @returns {Promise<TTanoArgs>} The tano args.
 */
export const parseTanoArgs = async (): Promise<TTanoArgs> => {
  const flags = parseArgs(Deno.args, {
    alias: {
      f: 'file',
      t: 'task',
      h: 'help',
      q: 'quiet',
      l: 'log-level',
      V: 'version',
      U: 'update',
    },
    string: ['file', 'task', 'log-level', 'log-file'],
    collect: ['log-output'],
    boolean: ['help', 'quiet', 'fail-fast', 'version', 'update', 'force', 'no-cache', 'log-everything'],
    default: {
      file: 'tanofile.ts',
      quiet: false,
      force: false,
      'fail-fast': false,
      'log-level': 'INFO',
      'log-output': ['console'],
      'no-cache': false,
      'log-everything': false,
    },
  });

  let action: TTanoCliAction = 'run';
  if (flags.version) {
    action = 'version';
  } else if (flags.help) {
    action = 'help';
  } else if (flags.update) {
    action = 'update';
  }

  const file: string | undefined = action === 'run' ? await getImportUrl(flags.file) : undefined;
  const tanoCwd: string = getCwd(file);
  const failFast: boolean = flags['fail-fast'];
  const force: boolean = flags.force;
  const task: string = flags.task || flags._[0] as string;
  const logFile: string = flags['log-file'] ? flags['log-file'] : join(tanoCwd, './tano.log');
  const logLevel: string = flags['log-level'].toUpperCase();
  const logEverything: boolean = flags['log-everything'];
  const logOutput: string[] = flags['log-output'] as string[];
  const quiet: boolean = flags.quiet;
  const noCache: boolean = flags['no-cache'];

  const config: TTanoConfig = {
    tanoCwd,
    failFast,
    force,
    logFile,
    logLevel,
    logOutput,
    logEverything,
    noCache,
    quiet,
  };

  setEnv(config);

  const args: TTanoArgs = {
    action,
    failFast,
    file,
    noCache,
    force,
    task,
  };

  return args;
};
