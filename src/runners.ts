/**
 * This module contains runners for code and commands.
 *
 * @module
 */

import type { Logger } from '@std/log';
import { logger } from './logger.ts';
import type { Code, CodeFunction, CodeOptions, Command, CommandOptions, Condition, ConditionType2, ICommandOptions, ProcessError } from './types.ts';

const getProcess = (command: Command, options?: CommandOptions): Deno.ChildProcess | ProcessError => {
  try {
    const args: string[] = Array.isArray(command) ? command : command.split(' ');
    const cmd: Deno.Command = new Deno.Command(args.shift() as string | URL, {
      args,
      cwd: options?.cwd || Deno.cwd(),
      env: options?.env,
      stdout: options?.stdout || 'piped',
      stderr: options?.stderr || 'piped',
      stdin: options?.stdin || 'piped',
    });

    return cmd.spawn();
  } catch (err: unknown) {
    const error = typeof err === 'string' ? err : (err as Error)?.message ?? 'Unknown error';

    return { error };
  }
};
/**
 * Runs code.
 *
 * @remarks
 * This can be a function or a path to a JavaScript/TypeScript file.
 *
 * @param {Code} code - The code which should be executed.
 * @param {CodeOptions} options - [optionalParam=undefined] Options.
 *
 * @returns {Promise<void>}
 */
export const runCode = async (code: Code, options?: CodeOptions): Promise<void> => {
  const logThis = options?.logThis ?? Deno.env.get('LOG_EVERYTHING') === 'true';
  const log: Logger = logger();

  log.debug('Run code...');

  if (typeof code === 'function') {
    if (options?.repl) {
      log.debug('Run code with repl.');

      const funcAsString: string = code.toString();
      const command: Command = ['deno', 'repl', '--eval', `(${funcAsString})(); close();`];

      await runCommand(command, options as ICommandOptions);
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
    const command: Command = ['deno', 'run', ...(options?.args || []), file];

    await runCommand(command, options as ICommandOptions);
  }

  log.debug('Run code completed.');
};

/**
 * Runs a command.
 *
 * @param {Command} command - The command which should be executed.
 * @param {CommandOptions} options - [optionalParam=undefined] Options.
 *
 * @returns {Promise<number>}
 */
export const runCommand = async (command: Command, options?: CommandOptions): Promise<void> => {
  const logThis: boolean = options?.logThis ?? Deno.env.get('LOG_EVERYTHING') === 'true';
  const log: Logger = logger();

  log.debug('Run command...');

  const textDecoder = new TextDecoder();
  const quiet: boolean = Deno.env.get('QUIET') === 'true';
  const processOrError: Deno.ChildProcess | ProcessError = getProcess(command, options);
  const processError: ProcessError = processOrError as ProcessError;
  const process: Deno.ChildProcess = processOrError as Deno.ChildProcess;

  if (processError.error) {
    await Promise.reject(processError.error);

    if (logThis) {
      log.error(processError.error);
    }

    if (typeof options?.output === 'function') {
      options?.output(processError.error, undefined);
    }
  }

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

  log.debug(`Run command completed with code '{code}'.`, status);
};

/**
 * Runs code as a condition.
 *
 * @param {Condition} condition - The code which should be executed.
 *
 * @remarks
 * It is important that the code returns a boolean.
 *
 * @returns {Promise<Boolean>} If `true`, the task will be executed. Otherwise it will be skipped.
 */
export const executeCondition = async (condition: Condition): Promise<boolean> => {
  const log: Logger = logger();

  log.debug('Execute condition...');

  const result: boolean = await new Promise<boolean>((resolve, reject) => {
    try {
      if (typeof condition === 'function') {
        if (condition.length > 0) {
          condition((result) => resolve(result));
        } else {
          resolve((condition as ConditionType2)());
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
 * @param {CodeFunction} code - The code which should be executed.
 *
 * @returns {Promise<void | T>}
 */
export const executeCodeFunction = async <T>(code: CodeFunction): Promise<void | T> => {
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
