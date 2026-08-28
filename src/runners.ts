// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module contains runners for code and commands.
 *
 * @module
 */

import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import { abortable } from '@std/async/abortable';
import { runSignal } from './abort.ts';
import { config } from './config.ts';
import { tokenize } from './tokenize.ts';
import type { TCode, TCodeFunction, TCodeOptions, TCommand, TCommandOptions, TCondition, TConditionType2 } from './types.ts';

/**
 * Builds a writable stream that hands complete lines to `onLine`.
 *
 * @remarks
 * A chunk does not have to end at a line break, so a partial line is kept until the rest arrives. Without that, a long line reaches the logger and the `output` callback in pieces. The decoder is asked to stream as well, so a multi byte character split across two chunks survives.
 *
 * @param {Function} onLine - Called once per complete line, without its line break.
 *
 * @returns {WritableStream<Uint8Array>} The stream to pipe a process output into.
 */
const toLineStream = (onLine: (line: string) => void): WritableStream<Uint8Array> => {
  const decoder: TextDecoder = new TextDecoder();

  let rest: string = '';

  return new WritableStream({
    write(chunk: Uint8Array): void {
      const lines: string[] = (rest + decoder.decode(chunk, { stream: true })).split(/\r?\n/);

      rest = lines.pop() ?? '';

      lines.forEach(onLine);
    },
    close(): void {
      if (rest.length > 0) {
        onLine(rest);
      }
    },
  });
};

const getProcess = (command: TCommand, options?: TCommandOptions, signal?: AbortSignal): Deno.ChildProcess => {
  if (command == null) {
    throw new Error('Command is required.');
  }

  if (typeof command !== 'string' && !Array.isArray(command)) {
    throw new Error('Command must be a string or an array of strings.');
  }

  const args: string[] = Array.isArray(command) ? [...command] : tokenize(command);
  const executable = args.shift();

  if (!executable || executable.trim().length < 1) {
    throw new Error('Command is empty.');
  }

  const cmd: Deno.Command = new Deno.Command(executable, {
    args,
    cwd: options?.cwd || Deno.cwd(),
    env: options?.env,
    signal,
    stdout: options?.stdout || 'piped',
    stderr: options?.stderr || 'piped',
    stdin: options?.stdin || 'piped',
  });

  return cmd.spawn();
};

/**
 * Runs code.
 *
 * @remarks
 * This can be a function or a path to a JavaScript/TypeScript file.
 *
 * @param {TCode} code - The code which should be executed.
 * @param {TCodeOptions} options - [optionalParam=undefined] Options.
 * @param {string} taskName - [optionalParam=undefined] Name of the task, used to prefix its output while tasks run at the same time.
 *
 * @returns {Promise<void>}
 */
export const runCode = async (code: TCode, options?: TCodeOptions, taskName?: string): Promise<void> => {
  const logThis: boolean = options?.logThis ?? config().logEverything;
  const log: Logger = logger();

  log.debug('Run code...');

  if (typeof code === 'function') {
    if (options?.repl) {
      log.debug('Run code with repl.');

      const funcAsString: string = code.toString();
      const command: TCommand = ['deno', 'repl', '--eval', `(${funcAsString})(); close();`];

      await runCommand(command, options as TCommandOptions, taskName);
    } else {
      log.debug('Run code function.');

      // JavaScript cannot stop a running function, so a timeout can only fail the task. The function itself keeps going.
      const run = (promise: Promise<unknown>): Promise<unknown> =>
        options?.timeout === undefined ? promise : abortable(promise, AbortSignal.timeout(options.timeout)).catch((err: unknown) => {
          throw err instanceof DOMException && err.name === 'TimeoutError' ? new Error(`Timed out after ${options.timeout}ms.`) : err;
        });

      await run(executeCodeFunction(code))
        .then((output) => {
          if (!output) {
            return;
          }

          if (logThis) {
            log.info(output);
          }

          if (typeof options?.output === 'function') {
            options?.output(undefined, output);
          }
        })
        .catch((err) => {
          if (logThis) {
            log.error(err);
          }

          if (typeof options?.output === 'function') {
            options?.output(err);
          }

          throw err;
        });
    }
  } else {
    log.debug('Run code from file.');

    const file: string = code.file instanceof URL ? code.file.toString() : code.file;
    const command: TCommand = ['deno', 'run', ...(options?.args || []), file];

    await runCommand(command, options as TCommandOptions, taskName);
  }

  log.debug('Run code completed.');
};

/**
 * Runs a command.
 *
 * @param {TCommand} command - The command which should be executed. A string is split into `args` by {@linkcode tokenize}, where quotes group their content and unquoted shell operators are rejected. Use the array form to pass pre-split arguments.
 * @param {TCommandOptions} options - [optionalParam=undefined] Options.
 * @param {string} taskName - [optionalParam=undefined] Name of the task, used to prefix its output while tasks run at the same time.
 *
 * @returns {Promise<number>}
 */
export const runCommand = async (command: TCommand, options?: TCommandOptions, taskName?: string): Promise<void> => {
  const logThis: boolean = options?.logThis ?? config().logEverything;
  const log: Logger = logger();

  log.debug('Run command...');

  const { quiet, concurrency } = config();

  // Only when tasks run at the same time, because then the lines of several processes end up mixed together.
  const prefix: string = taskName !== undefined && concurrency > 1 ? `${taskName} | ` : '';
  const commandText: string = Array.isArray(command) ? command.join(' ') : command;
  const timeout: undefined | number = typeof options?.timeout === 'number' ? options.timeout : undefined;
  const timeoutSignal: undefined | AbortSignal = timeout === undefined ? undefined : AbortSignal.timeout(timeout);
  const signals: Array<AbortSignal> = [runSignal(), options?.signal, timeoutSignal].filter((signal): signal is AbortSignal => signal !== undefined);
  const process: Deno.ChildProcess = getProcess(command, options, AbortSignal.any(signals));

  // Output pipe
  process.stdout.pipeTo(
    toLineStream((line: string): void => {
      if (!quiet && !logThis) {
        console.log(line.length > 0 ? `${prefix}${line}` : line);
      }

      if (line.length < 1) {
        return;
      }

      if (logThis) {
        log.info(line);
      }

      if (typeof options?.output === 'function') {
        options?.output(undefined, line);
      }
    }),
  );

  // Error pipe
  process.stderr.pipeTo(
    toLineStream((line: string): void => {
      if (!quiet) {
        console.error(line.length > 0 ? `${prefix}${line}` : line);
      }

      if (line.length < 1) {
        return;
      }

      if (logThis) {
        log.error(line);
      }

      if (typeof options?.output === 'function') {
        options?.output(line, undefined);
      }
    }),
  );

  process.stdin.close();

  const status: Deno.CommandStatus = await process.status;

  if (status.code !== 0) {
    // The child is killed through the signal, so it only reports a non-zero exit. The timeout is the more useful reason to name.
    const error = timeoutSignal?.aborted ? `Timed out after ${timeout}ms: ${commandText}` : `Command failed with exit code ${status.code}: ${commandText}`;

    if (logThis) {
      log.error(error);
    }

    if (typeof options?.output === 'function') {
      options?.output(error, undefined);
    }

    throw new Error(error);
  }

  log.debug(`Run command completed with code '{code}'.`, status);
};

/**
 * Runs code as a condition.
 *
 * @param {TCondition} condition - The code which should be executed.
 *
 * @remarks
 * It is important that the code returns a boolean.
 *
 * @returns {Promise<Boolean>} If `true`, the task will be executed. Otherwise it will be skipped.
 */
export const executeCondition = async (condition: TCondition): Promise<boolean> => {
  const log: Logger = logger();

  log.debug('Execute condition...');

  const result: boolean = await new Promise<boolean>((resolve, reject) => {
    try {
      if (typeof condition === 'function') {
        if (condition.length > 0) {
          condition((result) => resolve(result));
        } else {
          resolve((condition as TConditionType2)());
        }
      } else {
        resolve(condition === true);
      }
    } catch (err: unknown) {
      reject(err);
    }
  });

  log.debug(`Execute condition completed with '{result}'.`, { result });

  return result;
};

/**
 * Runs a code function.
 *
 * @param {TCodeFunction} code - The code which should be executed.
 *
 * @returns {Promise<void | T>}
 */
export const executeCodeFunction = async <T>(code: TCodeFunction): Promise<void | T> => {
  const log: Logger = logger();

  log.debug('Execute code function...');

  const output = await new Promise<void | T>((resolve, reject) => {
    try {
      if (code.length > 0) {
        code((err: unknown) => {
          if (err) {
            throw err;
          }

          resolve();
        });
      } else {
        resolve((code as <T>() => Promise<void | T>)());
      }
    } catch (err: unknown) {
      reject(err);
    }
  });

  log.debug('Execute code function completed.');

  return output;
};
