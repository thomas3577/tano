/**
 * This module contains the logger function to create a new logger.
 * @module
 */

import { format } from '@std/datetime/format';
import { gray, white } from '@std/fmt/colors';
import { BaseHandler, ConsoleHandler, FileHandler, getLogger, LevelName, LogConfig, Logger, LogRecord, setup } from '@std/log';
import type { BaseHandlerOptions, ConsoleHandlerOptions, FileHandlerOptions } from '@std/log';
import { consoleMock } from './console.ts';
import type { LogHandler, LogStream } from './types.ts';

const log = console.log;
const ansiEscapeCodePattern: RegExp = new RegExp('/\x1b\[[0-9;]*m/g');
const stream: TextEncoderStream = new TextEncoderStream();
const readable: ReadableStream<string> = stream.readable.pipeThrough(new TextDecoderStream());
const writer: WritableStreamDefaultWriter<string> = stream.writable.getWriter();
const levelName: LevelName = 'DEBUG';

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

const consoleHandlerOptions: ConsoleHandlerOptions = {
  formatter: (logRecord: LogRecord): string => {
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
};

const consoleHandler: ConsoleHandler = new ConsoleHandler(levelName, consoleHandlerOptions);

const streamHandlerOptions: BaseHandlerOptions = {
  formatter: (logRecord: LogRecord): string => {
    const msg: string = JSON.stringify({ ...logRecord }).replace(ansiEscapeCodePattern, '');

    return msg;
  },
};

const streamHandler: StreamHandler = new StreamHandler(levelName, streamHandlerOptions);

const fileHandlerOptions: FileHandlerOptions = {
  filename: Deno.env.get('LOG_FILE') as string,
};

const fileHandler = new FileHandler(levelName, fileHandlerOptions);

/**
 * Creates an instance of a logger.
 *
 * @returns {Logger}
 */
const logger = (): Logger => {
  const quiet: boolean = Deno.env.get('QUIET') === 'true';
  const level: LevelName = Deno.env.get('LOG_LEVEL')?.toUpperCase() as LevelName || 'INFO';
  const handlers: LogHandler[] = Deno.env.get('LOG_OUTPUT')?.split(',').map((item) => item.trim()) as LogHandler[] || ['console'] as LogHandler[];

  // deno-lint-ignore no-global-assign
  console = quiet ? consoleMock : console;

  const config: LogConfig = {
    handlers: {},
    loggers: {
      default: {
        level,
        handlers,
      },
    },
  };

  if (handlers.includes('console')) {
    consoleHandler.log = log;
    config.handlers = config.handlers ?? {};
    config.handlers['console'] = consoleHandler;
  }

  if (handlers.includes('stream')) {
    config.handlers = config.handlers ?? {};
    config.handlers['stream'] = streamHandler;
  }

  if (handlers.includes('file')) {
    config.handlers = config.handlers ?? {};
    config.handlers['file'] = fileHandler;
  }

  setup(config);

  return getLogger();
};

export type { LogHandler, LogStream };

export { logger, logStream };
