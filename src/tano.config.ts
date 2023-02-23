import { parse } from 'std/flags/mod.ts';

import { TanoConfig } from './definitions.ts';

export const setup = (): TanoConfig => {
  const flags = parse(Deno.args, {
    alias: {
      f: 'file',
      t: 'task',
      h: 'help',
      l: 'log-level',
    },
    string: ['file', 'task', 'log-level'],
    boolean: ['force', 'help', 'silent', 'abort-on-error'],
    default: {
      file: 'tanofile.ts',
      silent: false,
      'abort-on-error': true,
      'log-level': 'INFO',
    },
  });

  Deno.env.set('ABORT_ON_ERROR', `${flags['abort-on-error']}`);
  Deno.env.set('SILENT', `${flags.silent}`);
  Deno.env.set('FORCE', `${flags.force}`);
  Deno.env.set('LOG_LEVEL', flags['log-level'].toUpperCase());

  const config: TanoConfig = {
    file: flags.file,
    task: flags.task || flags._[0] as string,
  };

  return config;
};
