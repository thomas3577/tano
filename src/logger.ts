import { format } from 'std/datetime/format.ts';
import { handlers, LogRecord, setup } from 'std/log/mod.ts';
import * as logger from 'std/log/mod.ts';

setup({
  handlers: {
    console: new handlers.ConsoleHandler('DEBUG', {
      formatter: (logRecord: LogRecord) => {
        const datetime: string = format(logRecord.datetime, 'HH:mm:ss');
        let msg = `[${datetime}] ${logRecord.msg}`;

        logRecord.args.forEach((arg, index) => {
          msg += `, arg${index}: ${arg}`;
        });

        return msg;
      },
    }),
  },
  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['console'],
    },
  },
});

export const log = logger;
