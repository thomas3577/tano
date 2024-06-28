/**
 * This module contains the logger function to create a new logger.
 * @module
 */

import { format } from '@std/datetime/format';
import { BaseHandler, getLogger, LevelName, Logger, LogRecord, setup } from '@std/log';
import { ConsoleHandler } from '@std/log/console-handler';
import { gray, white } from '@std/fmt/colors';

import { consoleMock } from './console.ts';

const log = console.log;
const stream = new TextEncoderStream();

class LogStream {
  #readable = stream.readable.pipeThrough(new TextDecoderStream());

  get readable(): ReadableStream<string> {
    return this.#readable;
  }
}

const logStream = new LogStream();

class StreamHandler extends BaseHandler {
  #writer: WritableStreamDefaultWriter<string> = stream.writable.getWriter();

  async handle(logRecord: LogRecord): Promise<void> {
    const chunk = this.format(logRecord);

    await this.#writer.ready;
    await this.#writer.write(chunk);
  }
}

const streamHandler: StreamHandler = new StreamHandler('DEBUG', {});

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

export { Logger, logStream };

/**
 * Creates an instance of a task logger.
 *
 * @returns {Logger}
 */
export const logger = (): Logger => {
  const quiet: boolean = Deno.env.get('QUIET') === 'true';
  const logLevel: LevelName = Deno.env.get('LOG_LEVEL')?.toUpperCase() as LevelName || 'INFO';

  consoleHandler.log = log;

  // deno-lint-ignore no-global-assign
  console = quiet ? consoleMock : console;

  setup({
    handlers: {
      console: consoleHandler,
      stream: streamHandler,
    },
    loggers: {
      default: {
        level: logLevel,
        handlers: ['console', 'stream'],
      },
    },
  });

  return getLogger();
};
