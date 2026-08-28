// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module contains the logger function to create a new logger.
 *
 * @module
 */

import { format } from '@std/datetime/format';
import { join } from '@std/path';
import { gray, stripAnsiCode, white } from '@std/fmt/colors';
import { BaseHandler, ConsoleHandler, FileHandler, getLogger, LogLevels, setup } from '@std/log';
import type { BaseHandlerOptions, ConsoleHandlerOptions, FileHandlerOptions, LevelName, LogConfig, Logger, LogRecord } from '@std/log';
import { config, configVersion } from './config.ts';
import type { TLogHandler, TLogStream } from './types.ts';

const stream: TextEncoderStream = new TextEncoderStream();
const readable: ReadableStream<string> = stream.readable.pipeThrough(new TextDecoderStream());
const writer: WritableStreamDefaultWriter<string> = stream.writable.getWriter();
const levelName: LevelName = 'DEBUG';

let instance: null | Logger = null;
let instanceVersion: number = -1;

class StreamHandler extends BaseHandler {
  log(_: string): void {}

  override async handle(logRecord: LogRecord): Promise<void> {
    const chunk = this.format(logRecord);

    await writer.ready;
    await writer.write(chunk);
  }
}

/**
 * A console handler that writes errors to stderr instead of stdout, so that a redirect of one stream does not swallow the other.
 */
class TanoConsoleHandler extends ConsoleHandler {
  override handle(logRecord: LogRecord): void {
    if (this.level > logRecord.level) {
      return;
    }

    const msg: string = this.format(logRecord);

    if (logRecord.level >= LogLevels.ERROR) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }
}

const interpolate = (msg: string, params?: unknown): string => {
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params)) {
      msg = msg.replace(`{${key}}`, `${value}`);
    }
  }

  return msg;
};

/**
 * Builds the message for a handler that is not a terminal.
 *
 * @remarks
 * Colours are applied at the call site, so the raw message carries escape codes that only make sense on a console. A file or a stream consumer gets the plain text with its placeholders filled in.
 *
 * @param {LogRecord} logRecord - The record to build the message for.
 *
 * @returns {string} The interpolated message without escape codes.
 */
const plainMessage = (logRecord: LogRecord): string => stripAnsiCode(interpolate(logRecord.msg, logRecord.args?.at(0)));

let consoleHandler: TanoConsoleHandler;
const getConsoleHandler = (): TanoConsoleHandler => {
  if (!consoleHandler) {
    const consoleHandlerOptions: ConsoleHandlerOptions = {
      formatter: (logRecord: LogRecord): string => {
        const timestamp: string = format(logRecord.datetime, 'HH:mm:ss');
        const params = logRecord.args?.at(0);
        let msg: string = !logRecord.msg ? '' : `${white('[')}${gray(timestamp)}${white(']')} ${logRecord.msg}`;
        msg = interpolate(msg, params);

        if (logRecord.levelName === 'DEBUG') {
          msg = gray(msg);
        }

        return msg;
      },
    };

    consoleHandler = new TanoConsoleHandler(levelName, consoleHandlerOptions);
  }

  return consoleHandler;
};

let streamHandler: StreamHandler;
const getStreamHandler = (): StreamHandler => {
  if (!streamHandler) {
    const streamHandlerOptions: BaseHandlerOptions = {
      formatter: (logRecord: LogRecord): string => {
        const datetime: string = logRecord.datetime.toISOString();
        const msg: string = plainMessage(logRecord);
        const args = logRecord.args;
        const result: string = JSON.stringify({ ...logRecord, datetime, msg, args });

        return result;
      },
    };

    streamHandler = new StreamHandler(levelName, streamHandlerOptions);
  }

  return streamHandler;
};

let fileHandler: FileHandler;
const getFileHandler = (): FileHandler => {
  if (!fileHandler) {
    const fileHandlerOptions: FileHandlerOptions = {
      filename: config().logFile || join(config().tanoCwd || Deno.cwd(), 'tano.log'),
      formatter: (logRecord: LogRecord): string => `${logRecord.levelName} ${plainMessage(logRecord)}`,
    };

    fileHandler = new FileHandler(levelName, fileHandlerOptions);
  }

  return fileHandler;
};

/**
 * A readable stream of the log.
 */
export const logStream: TLogStream = {
  /**
   * The readable stream of the log.
   */
  get readable(): ReadableStream<string> {
    return readable;
  },
};

/**
 * Creates an instance of a logger.
 *
 * @example Creates a new task and runs it.
 * ```ts
 * import { logger } from 'jsr:@dx/tano';
 *
 * const log = logger();
 *
 * log.info('Hello World!');
 * ```
 *
 * @returns {Logger}
 */
export const logger = (): Logger => {
  if (instance && instanceVersion === configVersion()) {
    return instance;
  }

  const { quiet, logLevel, logOutput } = config();
  const level: LevelName = logLevel.toUpperCase() as LevelName;
  const handlers: TLogHandler[] = (quiet ? logOutput.filter((handler) => handler !== 'console') : logOutput) as TLogHandler[];

  const logConfig: LogConfig = {
    handlers: {},
    loggers: {
      default: {
        level,
        handlers,
      },
    },
  };

  if (handlers.includes('console')) {
    logConfig.handlers = logConfig.handlers ?? {};
    logConfig.handlers['console'] = getConsoleHandler();
  }

  if (handlers.includes('stream')) {
    logConfig.handlers = logConfig.handlers ?? {};
    logConfig.handlers['stream'] = getStreamHandler();
  }

  if (handlers.includes('file')) {
    logConfig.handlers = logConfig.handlers ?? {};
    logConfig.handlers['file'] = getFileHandler();
  }

  setup(logConfig);

  instance = getLogger();
  instanceVersion = configVersion();

  return instance;
};
