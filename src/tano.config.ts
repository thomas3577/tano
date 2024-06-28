/**
 * This module contains the setup function for the CLI.
 * @module
 */

import { parseArgs } from '@std/cli';
import { join } from '@std/path';

import { getCwd, getImportUrl } from './utils.ts';

import type { TanoArgs, TanoCliAction, TanoConfig } from './types.ts';

/**
 * Sets up the environment variables for the CLI.
 *
 * @param {TanoConfig} config The tano configuration.
 */
export const setup = (config: TanoConfig): void => {
  if (config.cwd !== undefined) {
    Deno.env.set('TANO_CWD', config.cwd);
  }

  if (config.failFast !== undefined) {
    Deno.env.set('FAIL_FAST', `${config.failFast}`);
  }

  if (config.force !== undefined) {
    Deno.env.set('FORCE', `${config.force}`);
  }

  if (config.logFile !== undefined) {
    Deno.env.set('LOG_FILE', config.logFile);
  }

  if (config.logLevel !== undefined) {
    Deno.env.set('LOG_LEVEL', config.logLevel);
  }

  if (config.logOutput !== undefined) {
    Deno.env.set('LOG_OUTPUT', config.logOutput.join(','));
  }

  if (config.noCache !== undefined) {
    Deno.env.set('NO_CACHE', `${config.noCache}`);
  }

  if (config.quiet !== undefined) {
    Deno.env.set('QUIET', `${config.quiet}`);
  }
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
    boolean: ['help', 'quiet', 'fail-fast', 'version', 'update', 'force', 'no-cache'],
    default: {
      file: 'tanofile.ts',
      quiet: false,
      force: false,
      'fail-fast': false,
      'log-level': 'INFO',
      'log-output': ['console'],
      'no-cache': false,
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
  const cwd: string = getCwd(file);
  const failFast: boolean = flags['fail-fast'];
  const force: boolean = flags.force;
  const task: string = flags.task || flags._[0] as string;
  const logFile: string = flags['log-file'] ? flags['log-file'] : join(cwd, './tano.log');
  const logLevel: string = flags['log-level'].toUpperCase();
  const logOutput: string[] = flags['log-output'] as string[];
  const quiet: boolean = flags.quiet;
  const noCache: boolean = flags['no-cache'];

  const config: TanoConfig = {
    cwd,
    failFast,
    force,
    logFile,
    logLevel,
    logOutput,
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
