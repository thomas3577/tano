// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module parses the CLI arguments.
 *
 * @module
 */

import { parseArgs } from '@std/cli';
import type { Logger } from '@std/log';
import { getCwd, getImportUrl } from './utils.ts';
import { logger } from './logger.ts';
import { setup } from './config.ts';
import type { TTanoArgs, TTanoCliAction, TTanoConfig } from './types.ts';

/**
 * Checks if a flag was actually passed on the command line.
 *
 * @remarks
 * Needed because `parseArgs` fills every boolean flag with its default, which makes an unset flag indistinguishable from one that was passed as `false`. Only a flag that was really passed may override what the tanofile configured.
 *
 * @param {string} name - The long name of the flag.
 * @param {string} alias - [optionalParam=undefined] The short name of the flag.
 *
 * @returns {boolean} if `true` the flag was passed.
 */
const isFlagGiven = (name: string, alias?: string): boolean => Deno.args.some((arg) => arg === `--${name}` || arg === `--no-${name}` || arg.startsWith(`--${name}=`) || (alias !== undefined && arg === `-${alias}`));

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
      U: 'upgrade',
    },
    string: ['file', 'task', 'log-level', 'log-file', 'concurrency'],
    collect: ['log-output'],
    boolean: ['help', 'quiet', 'fail-fast', 'version', 'upgrade', 'force', 'no-cache', 'log-everything', 'list', 'dry-run', 'watch'],
    negatable: ['fail-fast'],
    default: {
      file: 'tanofile.ts',
      quiet: false,
      force: false,
      'fail-fast': true,
      'no-cache': false,
      'log-everything': false,
      list: false,
      'dry-run': false,
      watch: false,
    },
  });

  let action: TTanoCliAction = 'run';
  if (flags.version) {
    action = 'version';
  } else if (flags.help) {
    action = 'help';
  } else if (flags.upgrade) {
    action = 'upgrade';
  }

  const file: string | undefined = action === 'run' ? await getImportUrl(flags.file) : undefined;
  const task: string = flags.task || flags._[0] as string;
  const list: boolean = flags.list;
  const dryRun: boolean = flags['dry-run'];
  const watch: boolean = flags.watch;

  // Declared as a boolean so that `--watch build` keeps `build` as the task name instead of swallowing it as the glob. The narrowing glob is only read from the `--watch=<glob>` form.
  const watchGlob: undefined | string = Deno.args.find((arg) => arg.startsWith('--watch='))?.slice('--watch='.length);

  const config: TTanoConfig = { tanoCwd: getCwd(file) };
  const logOutput: string[] = (flags['log-output'] ?? []) as string[];

  if (isFlagGiven('fail-fast')) {
    config.failFast = flags['fail-fast'];
  }

  if (isFlagGiven('force')) {
    config.force = flags.force;
  }

  if (isFlagGiven('no-cache')) {
    config.noCache = flags['no-cache'];
  }

  if (isFlagGiven('log-everything')) {
    config.logEverything = flags['log-everything'];
  }

  if (isFlagGiven('quiet', 'q')) {
    config.quiet = flags.quiet;
  }

  if (flags['log-level'] !== undefined) {
    config.logLevel = flags['log-level'].toUpperCase();
  }

  if (flags['log-file'] !== undefined) {
    config.logFile = flags['log-file'];
  }

  if (logOutput.length > 0) {
    config.logOutput = logOutput;
  }

  if (flags.concurrency !== undefined) {
    const concurrency: number = Number(flags.concurrency);

    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error(`'--concurrency' must be a positive integer, got '${flags.concurrency}'.`);
    }

    config.concurrency = concurrency;
  }

  setup(config);

  const log: Logger = logger();

  log.debug(`Config      ${JSON.stringify(config)}`);
  log.debug('');

  const args: TTanoArgs = {
    action,
    config,
    dryRun,
    file,
    list,
    task,
    watch,
    watchGlob,
  };

  return args;
};
