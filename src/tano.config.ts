import { parse } from 'std/flags/mod.ts';

import { getCwd, getImportUrl } from './tano.factory.ts';
import type { TanoCliAction, TanoConfig } from './definitions.ts';

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
    boolean: ['help', 'quiet', 'fail-fast', 'version'],
    default: {
      file: 'tanofile.ts',
      quiet: false,
      'fail-fast': false,
      'log-level': 'INFO',
    },
  });

  const task: string = flags.task || flags._[0] as string;
  const logLevel: string = flags['log-level'].toUpperCase();
  const failFast: boolean = flags['fail-fast'];
  const file: string = await getImportUrl(flags.file);
  const cwd: string = getCwd(file);

  Deno.env.set('FAIL-FAST', `${failFast}`);
  Deno.env.set('QUIET', `${flags.quiet}`);
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
  };

  return config;
};
