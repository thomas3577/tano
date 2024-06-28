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
  #writer: WritableStreamDefaultWriter<string> = stream.writable.getWriter();

  async handle(logRecord: LogRecord): Promise<void> {
    const chunk = this.format(logRecord);

    await this.#writer.ready;
    await this.#writer.write(chunk);
  }
}

const streamHandler: StreamHandler = new StreamHandler('DEBUG', {
  formatter: (logRecord: LogRecord) => {
    const timestamp: string = format(logRecord.datetime, 'HH:mm:ss');
    let msg: string = !logRecord.msg ? '' : `[${timestamp}] [${logRecord.levelName}] ${logRecord.msg}`;

    const params = logRecord.args?.at(0);
    if (params && typeof params === 'object') {
      for (const [key, value] of Object.entries(params)) {
        msg = msg.replace(`{${key}}`, `${value}`);
      }
    }

    return msg;
  },
});

const fileHandler = new FileHandler('DEBUG', {
  filename: Deno.env.get('LOG_FILE') as string, // deno-lint-ignore no-undef
});

const consoleHandler: ConsoleHandler = new ConsoleHandler('DEBUG', {
  formatter: (logRecord: LogRecord) => {
    const timestamp: string = format(logRecord.datetime, 'HH:mm:ss');
    let msg: string = !logRecord.msg ? '' : `${white('[')}${gray(timestamp)}${white(']')} ${logRecord.msg}`;

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

/**
 * Creates an instance of a task logger.
 *
 * @returns {Logger}
 */
const logger = (): Logger => {
  const quiet: boolean = Deno.env.get('QUIET') === 'true';
  const logLevel: LevelName = Deno.env.get('LOG_LEVEL')?.toUpperCase() as LevelName || 'INFO';
  const logHandlers: LogHandler[] = Deno.env.get('LOG_OUTPUT')?.split(',').map((item) => item.trim()) as LogHandler[] || ['console'] as LogHandler[];

  consoleHandler.log = log;

  // deno-lint-ignore no-global-assign
  console = quiet ? consoleMock : console;

  const handlers: any = {};

  if (logHandlers.includes('console')) {
    handlers['console'] = consoleHandler;
  }

  if (logHandlers.includes('file')) {
    handlers['file'] = fileHandler;
  }

  if (logHandlers.includes('stream')) {
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
