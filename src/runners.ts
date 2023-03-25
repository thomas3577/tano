import { Logger, logger } from './logger.ts';

import type { Code, CodeFunction, CodeFunctionWithoutDone, CodeOptions, Command, CommandOptions, Condition, ConditionType2, ProcessOutput } from './types.ts';

const log: Logger = logger();

export const runCode = async (code: Code, options?: CodeOptions): Promise<void> => {
  log.debug('Run code...');

  if (typeof code === 'function') {
    if (options?.repl) {
      log.debug('Run code with repl.');

      const funcAsString: string = code.toString();
      const command: Command = ['deno', 'repl', '--eval', `(${funcAsString})(); close();`];

      await runCommand(command, options);
    } else {
      log.debug('Run code function.');

      await executeCodeFunction(code)
        // TODO(thu): Currently no return value. It's always void.
        .then((output) => {
          if (options?.output) {
            options?.output(undefined, output);
          }
        })
        .catch((err: unknown) => {
          if (options?.output) {
            options?.output(err, undefined);
          }

          throw err;
        });
    }
  } else {
    log.debug('Run code from file.');

    const file: string = code.file instanceof URL ? code.file.toString() : code.file;
    const command: Command = ['deno', 'run', ...(options?.args || []), file];

    await runCommand(command, options);
  }

  log.debug('Run code completed.');
};

export const runCommand = async (command: Command, options?: CommandOptions): Promise<void> => {
  log.debug('Run command...');

  const quiet: boolean = Deno.env.get('QUIET') === 'true';
  const { status, rawOutput, rawError, error, process } = await runProcess(command, options);
  const textDecoder = new TextDecoder();

  if (status?.code === 0) {
    if (options?.output) {
      const output: string | undefined = textDecoder.decode(rawOutput) || undefined;
      const error: string | undefined = textDecoder.decode(rawError) || undefined;

      options?.output(error, output);
    }

    if (!quiet && rawOutput && rawOutput?.length > 0) {
      await Deno.stdout.write(rawOutput as Uint8Array);
    }

    if (rawError && rawError?.length > 0) {
      await Deno.stderr.write(rawError as Uint8Array);
    }

    process?.close();
  } else {
    const err: string = error || textDecoder.decode(rawError);
    if (options?.output) {
      options?.output(err, undefined);
    }

    process?.kill();

    await Promise.reject(err);
  }

  log.debug('Run command completed.');
};

export const executeCondition = async (condition: Condition): Promise<boolean> => {
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

  log.debug(`Execute condition completed with '${result}'.`);

  return result;
};

export const executeCodeFunction = async (code: CodeFunction): Promise<void> => {
  log.debug('Execute code function...');

  await new Promise<void>((resolve, reject) => {
    try {
      if (code.length > 0) {
        code((err: unknown) => {
          if (err) {
            reject(err);
          }

          return resolve();
        });
      } else {
        resolve((code as CodeFunctionWithoutDone)());
      }
    } catch (err: unknown) {
      reject(err);
    }
  });

  log.debug('Execute code function completed.');
};

const runProcess = async (command: Command, options?: CommandOptions): Promise<ProcessOutput> => {
  log.debug('Run process...');

  try {
    const process: Deno.Process<Deno.RunOptions> = Deno.run({
      cmd: Array.isArray(command) ? command : command.split(' '),
      cwd: options?.cwd || Deno.cwd(),
      env: options?.env,
      stdout: options?.stdout || 'piped',
      stderr: options?.stderr || 'piped',
      stdin: options?.stdin || 'null',
    });

    const [status, rawOutput, rawError] = await Promise.all([
      process.status(),
      process.output(),
      process.stderrOutput(),
    ]);

    log.debug('Run process completed.');

    return {
      status,
      rawOutput,
      rawError,
      process,
    };
  } catch (err: unknown) {
    const error = typeof err === 'string' ? err : (err as Error)?.message ?? 'Unknown err';

    return { error };
  }
};
