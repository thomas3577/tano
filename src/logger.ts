/**
 * This module contains the logger function to create a new logger.
 * @module
 */

import { format } from '@std/datetime/format';
import { BaseHandler, FileHandler, getLogger, LevelName, Logger, LogRecord, setup } from '@std/log';
import { ConsoleHandler } from '@std/log/console-handler';
import { gray, white } from '@std/fmt/colors';

import { consoleMock } from './console.ts';
import type { LogHandler, LogStream } from './types.ts';

const log = console.log;
const stream = new TextEncoderStream();
const readable = stream.readable.pipeThrough(new TextDecoderStream());
const ansiEscapeCodePattern = new RegExp('/\x1b\[[0-9;]*m/g');
const writer: WritableStreamDefaultWriter<string> = stream.writable.getWriter();

/**
 * A readable stream of the log.
 */
const logStream: LogStream = {
  /**
   * The readable stream of the log.
   */
  get readable(): ReadableStream<string> {
    return readable;
  },
};

class StreamHandler extends BaseHandler {
  async handle(logRecord: LogRecord): Promise<void> {
    const chunk = this.format(logRecord);

    await writer.ready;
    await writer.write(chunk);
  }
}

/**
 * Creates an instance of a task logger.
 *
 * @returns {Logger}
 */
const logger = (loggerName: string = 'default'): Logger => {
  const quiet: boolean = Deno.env.get('QUIET') === 'true';
  const logLevel: LevelName = Deno.env.get('LOG_LEVEL')?.toUpperCase() as LevelName || 'INFO';
  const logHandlers: LogHandler[] = Deno.env.get('LOG_OUTPUT')?.split(',').map((item) => item.trim()) as LogHandler[] || ['console'] as LogHandler[];

  // deno-lint-ignore no-global-assign
  console = quiet ? consoleMock : console;

  const handlers: any = {};

  if (logHandlers.includes('console')) {
    const consoleHandler = new ConsoleHandler('DEBUG', {
      formatter: (logRecord: LogRecord) => {
        const timestamp: string = format(logRecord.datetime, 'HH:mm:ss');
        const name = loggerName !== 'default' ? ` ${white('[')}${gray(loggerName)}${white(']')}` : '';
        let msg: string = !logRecord.msg ? '' : `${white('[')}${gray(timestamp)}${white(']')}${name} ${logRecord.msg}`;

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

    consoleHandler.log = log;

    handlers['console'] = consoleHandler;
  }

  if (logHandlers.includes('file')) {
    const fileHandler = new FileHandler('DEBUG', {
      filename: Deno.env.get('LOG_FILE') as string, // deno-lint-ignore no-undef
    });

    handlers['file'] = fileHandler;
  }

  if (logHandlers.includes('stream')) {
    const streamHandler: StreamHandler = new StreamHandler('DEBUG', {
      formatter: (logRecord: LogRecord) => {
        const timestamp: string = format(logRecord.datetime, 'HH:mm:ss');

        return JSON.stringify({ ...logRecord, timestamp, loggerName }).replace(ansiEscapeCodePattern, '');
      },
    });

    handlers['stream'] = streamHandler;
  }

  setup({
    handlers,
    loggers: {
      default: {
        level: logLevel,
        handlers: logHandlers,
      },
    },
  });

  return getLogger();
};

export type { LogHandler, LogStream };

export { Logger, logger, logStream };
