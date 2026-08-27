// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module parses the CLI arguments.
 *
 * @module
 */

import { parseArgs } from '@std/cli';
import { join } from '@std/path';
import type { Logger } from '@std/log';
import { getCwd, getImportUrl } from './utils.ts';
import { logger } from './logger.ts';
import { setup } from './config.ts';
import type { TTanoArgs, TTanoCliAction, TTanoConfig } from './types.ts';

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
    string: ['file', 'task', 'log-level', 'log-file'],
    collect: ['log-output'],
    boolean: ['help', 'quiet', 'fail-fast', 'version', 'upgrade', 'force', 'no-cache', 'log-everything', 'list', 'dry-run'],
    negatable: ['fail-fast'],
    default: {
      file: 'tanofile.ts',
      quiet: false,
      force: false,
      'fail-fast': true,
      'log-level': 'INFO',
      'log-output': ['console'],
      'no-cache': false,
      'log-everything': false,
      list: false,
      'dry-run': false,
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
  const list: boolean = flags.list;
  const dryRun: boolean = flags['dry-run'];

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

  setup(config);

  const log: Logger = logger();

  log.debug(`Config      ${JSON.stringify(config)}`);
  log.debug('');

  const args: TTanoArgs = {
    action,
    failFast,
    dryRun,
    file,
    list,
    noCache,
    force,
    task,
  };

  return args;
};
