/**
 * This module contains the setup function for the CLI.
 * @module
 */

import { parseArgs } from '@std/cli';
import { join } from '@std/path';
import { Logger } from '@std/log';
import { getCwd, getImportUrl, toSnakeCase } from './utils.ts';
import { logger } from './logger.ts';
import { handler } from './handler.ts';
import type { TanoArgs, TanoCliAction, TanoConfig } from './types.ts';

/**
 * Sets up the environment variables for the CLI.
 *
 * @param {TanoConfig} config The tano configuration.
 */
export const setup = (config: TanoConfig): void => {
  Object.entries(config).forEach(([key, value]) => {
    const envKey = toSnakeCase(key)?.toUpperCase();
    if (envKey && !Deno.env.has(envKey) && value !== undefined) {
      Deno.env.set(envKey, `${value}`);
    }
  });

  const log: Logger = logger();

  handler.updateLogger();

  log.debug(`NO_CACHE:       ${Deno.env.get('NO_CACHE')}`);
  log.debug(`FAIL_FAST:      ${Deno.env.get('FAIL_FAST')}`);
  log.debug(`LOG_LEVEL:      ${Deno.env.get('LOG_LEVEL')}`);
  log.debug(`LOG_OUTPUT:     ${Deno.env.get('LOG_OUTPUT')}`);
  log.debug(`LOG_FILE:       ${Deno.env.get('LOG_FILE')}`);
  log.debug(`LOG_EVERYTHING: ${Deno.env.get('LOG_EVERYTHING')}`);
  log.debug(`QUIET:          ${Deno.env.get('QUIET')}`);
  log.debug(`FORCE:          ${Deno.env.get('FORCE')}`);
  log.debug(`TANO_CWD:       ${Deno.env.get('TANO_CWD')}`);
  log.debug('');
};

/**
 * Executed on every CLI call to prepare and provide all options.
 *
 * @returns {Promise<TanoArgs>} The tano args.
 */
export const parseTanoArgs = async (): Promise<TanoArgs> => {
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

  let action: TanoCliAction = 'run';
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

  const config: TanoConfig = {
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

  setup(config);

  const args: TanoArgs = {
    action,
    failFast,
    file,
    noCache,
    force,
    task,
  };

  return args;
};
