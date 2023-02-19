import { format } from 'std/datetime/format.ts';
import { getLogger, handlers, Logger, LogRecord, setup } from 'std/log/mod.ts';
import { ConsoleHandler } from 'std/log/handlers.ts';
import { gray } from 'std/fmt/colors.ts';

type LogLevel = 'INFO' | 'NOTSET' | 'DEBUG' | 'WARNING' | 'ERROR' | 'CRITICAL' | undefined;

const consoleHandler: ConsoleHandler = new handlers.ConsoleHandler('DEBUG', {
  formatter: (logRecord: LogRecord) => {
    const timestamp: string = format(logRecord.datetime, 'HH:mm:ss');
    let msg: string = !logRecord.msg ? '' : `[${timestamp}] ${logRecord.msg}`;

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
});

export { Logger };

export const logger = (): Logger => {
  const silent = Deno.env.get('SILENT') === 'true';
  const logLevel: LogLevel = Deno.env.get('LOG_LEVEL')?.toUpperCase() as LogLevel || 'INFO';

  setup({
    handlers: silent ? undefined : {
      console: consoleHandler,
    },
    loggers: {
      default: {
        level: logLevel,
        handlers: ['console'],
      },
    },
  });

  return getLogger();
};
