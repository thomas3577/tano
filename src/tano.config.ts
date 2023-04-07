import { parse } from 'std/flags/mod.ts';

import { getCwd, getImportUrl } from './tano.factory.ts';

import type { TanoCliAction, TanoConfig } from './types.ts';

/**
 * Executed on every CLI call to prepare and provide all options.
 *
 * @returns {Promise<TanoConfig>} The tano configuration.
 */
export const setup = async (): Promise<TanoConfig> => {
  const flags = parse(Deno.args, {
    alias: {
      f: 'file',
      t: 'task',
      h: 'help',
      q: 'quiet',
      l: 'log-level',
      V: 'version',
    },
    string: ['file', 'task', 'log-level'],
    boolean: ['help', 'quiet', 'fail-fast', 'version', 'force'],
    default: {
      file: 'tanofile.ts',
      quiet: false,
      force: false,
      'fail-fast': false,
      'log-level': 'INFO',
    },
  });

  const file: string = await getImportUrl(flags.file);
  const task: string = flags.task || flags._[0] as string;
  const logLevel: string = flags['log-level'].toUpperCase();
  const failFast: boolean = flags['fail-fast'];
  const force: boolean = flags.force;
  const cwd: string = getCwd(file);

  Deno.env.set('FAIL-FAST', `${failFast}`);
  Deno.env.set('QUIET', `${flags.quiet}`);
  Deno.env.set('FORCE', `${force}`);
  Deno.env.set('LOG_LEVEL', logLevel);
  Deno.env.set('TANO_CWD', cwd);

  let action: TanoCliAction = 'run';
  if (flags.version) {
    action = 'version';
  } else if (flags.help) {
    action = 'help';
  }

  const config: TanoConfig = {
    file,
    task,
    failFast,
    action,
    force,
  };

  return config;
};
