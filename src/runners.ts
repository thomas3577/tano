// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * This module contains runners for code and commands.
 *
 * @module
 */

import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import type { TCode, TCodeFunction, TCodeOptions, TCommand, TCommandOptions, TCondition, TConditionType2 } from './types.ts';

const hasUnsupportedStringCommandSyntax = (value: string): boolean => /"|\\[\s"'\\]/.test(value);

const getProcess = (command: TCommand, options?: TCommandOptions): Deno.ChildProcess => {
  if (command == null) {
    throw new Error('Command is required.');
  }

  if (typeof command !== 'string' && !Array.isArray(command)) {
    throw new Error('Command must be a string or an array of strings.');
  }

  const isCommandArray = Array.isArray(command);

  if (!isCommandArray && hasUnsupportedStringCommandSyntax(command)) {
    throw new Error('String commands do not support shell quoting or escaping. Please pass command as an array of arguments.');
  }

  const args: string[] = isCommandArray ? [...command] : command.split(' ');
  const executable = args.shift();

  if (!executable || executable.trim().length < 1) {
    throw new Error('Command is empty.');
  }

  const cmd: Deno.Command = new Deno.Command(executable, {
    args,
    cwd: options?.cwd || Deno.cwd(),
    env: options?.env,
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
 *
 * @returns {Promise<void>}
 */
export const runCode = async (code: TCode, options?: TCodeOptions): Promise<void> => {
  const logThis: boolean = options?.logThis ?? Deno.env.get('LOG_EVERYTHING') === 'true';
  const log: Logger = logger();

  log.debug('Run code...');

  if (typeof code === 'function') {
    if (options?.repl) {
      log.debug('Run code with repl.');

      const funcAsString: string = code.toString();
      const command: TCommand = ['deno', 'repl', '--eval', `(${funcAsString})(); close();`];

      await runCommand(command, options as TCommandOptions);
    } else {
      log.debug('Run code function.');

      await executeCodeFunction(code)
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

    await runCommand(command, options as TCommandOptions);
  }

  log.debug('Run code completed.');
};

/**
 * Runs a command.
 *
 * @param {TCommand} command - The command which should be executed. If this is a string, it is split by spaces into `args` and must not contain shell-style quoting/escaping. Use the array form to pass pre-split arguments safely.
 * @param {TCommandOptions} options - [optionalParam=undefined] Options.
 *
 * @returns {Promise<number>}
 */
export const runCommand = async (command: TCommand, options?: TCommandOptions): Promise<void> => {
  const logThis: boolean = options?.logThis ?? Deno.env.get('LOG_EVERYTHING') === 'true';
  const log: Logger = logger();

  log.debug('Run command...');

  const textDecoder = new TextDecoder();
  const quiet: boolean = Deno.env.get('QUIET') === 'true';
  const process: Deno.ChildProcess = getProcess(command, options);

  // Output pipe
  process.stdout.pipeTo(
    new WritableStream({
      write(chunk: Uint8Array): void {
        if (!quiet && !logThis) {
          Deno.stdout.writeSync(chunk);
        }

        const lines: string[] = textDecoder.decode(chunk).split(/\r?\n/);
        for (const line of lines) {
          if (line?.length < 1) {
            continue;
          }

          if (logThis) {
            log.info(line);
          }

          if (typeof options?.output === 'function') {
            options?.output(undefined, line);
          }
        }
      },
    }),
  );

  // Error pipe
  process.stderr.pipeTo(
    new WritableStream({
      write(chunk: Uint8Array): void {
        if (!quiet) {
          Deno.stderr.writeSync(chunk);
        }

        const lines: string[] = textDecoder.decode(chunk).split(/\r?\n/);
        for (const line of lines) {
          if (line?.length < 1) {
            continue;
          }

          if (logThis) {
            log.error(line);
          }

          if (typeof options?.output === 'function') {
            options?.output(line, undefined);
          }
        }
      },
    }),
  );

  process.stdin.close();

  const status: Deno.CommandStatus = await process.status;

  if (status.code !== 0) {
    const commandText = Array.isArray(command) ? command.join(' ') : command;
    const error = `Command failed with exit code ${status.code}: ${commandText}`;

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
