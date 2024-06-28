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
  Deno.env.set('FAIL_FAST', `${config.failFast}`);
  Deno.env.set('QUIET', `${config.quiet}`);
  Deno.env.set('FORCE', `${config.force}`);
  Deno.env.set('LOG_LEVEL', config.logLevel);
  Deno.env.set('LOG_OUTPUT', config.logOutput.join(','));
  Deno.env.set('LOG_FILE', config.logFile);
  Deno.env.set('NO_CACHE', `${config.noCache}`);
  Deno.env.set('TANO_CWD', config.cwd);
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
  const logFile: string = flags['log-file'] ? flags['log-file'] : join(cwd, './tano.log');
  const config: TanoConfig = {
    file,
    cwd,
    task: flags.task || flags._[0] as string,
    logLevel: flags['log-level'].toUpperCase(),
    logOutput: flags['log-output'] as string[],
    failFast: flags['fail-fast'],
    force: flags.force,
    noCache: flags['no-cache'],
    quiet: flags.quiet,
    logFile,
    action,
  };

  setup(config);

  const args: TanoArgs = {
    file: config.file,
    task: config.task,
    failFast: config.failFast,
    action: config.action,
    force: config.force,
    noCache: config.noCache,
  };

  return args;
};
