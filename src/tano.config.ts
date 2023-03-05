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
    boolean: ['force', 'help', 'quiet', 'abort-on-error', 'version'],
    default: {
      file: 'tanofile.ts',
      quiet: false,
      'abort-on-error': true,
      'log-level': 'INFO',
    },
  });

  const task: string = flags.task || flags._[0] as string;
  const logLevel: string = flags['log-level'].toUpperCase();
  const abortOnError: boolean = flags['abort-on-error'];
  const file: string = await getImportUrl(flags.file);
  const cwd: string = getCwd(file);

  Deno.env.set('ABORT_ON_ERROR', `${abortOnError}`);
  Deno.env.set('SILENT', `${flags.quiet}`);
  Deno.env.set('FORCE', `${flags.force}`);
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
    abortOnError,
    action,
  };

  return config;
};
