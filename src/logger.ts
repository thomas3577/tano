import { format } from 'std/datetime/format.ts';
import { handlers, LogRecord, setup } from 'std/log/mod.ts';
import { gray } from 'std/fmt/colors.ts';
import * as logger from 'std/log/mod.ts';

setup({
  handlers: {
    console: new handlers.ConsoleHandler('DEBUG', {
      formatter: (logRecord: LogRecord) => {
        const datetime: string = format(logRecord.datetime, 'HH:mm:ss');
        let msg = !logRecord.msg ? '' : `[${datetime}] ${logRecord.msg}`;

        const params = logRecord.args?.at(0);
        if (params && typeof params === 'object') {
          for (const [key, value] of Object.entries(params)) {
            msg = msg.replace(`{${key}}`, `${value}`);
          }
        }

        if (logRecord.levelName === 'DEBUG') {
          msg = gray(msg);
        }

        return msg;
      },
    }),
  },
  loggers: {
    default: {
      level: 'INFO',
      handlers: ['console'],
    },
  },
});

export const log = logger;
