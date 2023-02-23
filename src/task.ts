import { bold, gray, red } from 'std/fmt/colors.ts';
import { format } from 'std/fmt/duration.ts';

import { Logger, logger } from './logger.ts';
import { Handler, handler } from './handler.ts';
import { isCode, isCommand } from './helper.ts';

import type { Code, CodeFunction, CodeOptions, Command, CommandOptions, Condition, Executor, Options, TaskParams, TaskStatus } from './definitions.ts';

type TaskType = 'command' | 'code' | undefined;

const toCommand = (commandOrCode?: Executor): Command => {
  return (isCommand(commandOrCode) ? commandOrCode : undefined as unknown) as Command;
};

const toCode = (commandOrCode?: Executor): Code => {
  return (isCode(commandOrCode) ? commandOrCode : undefined as unknown) as Code;
};

/**
 * Creates a new Task.
 */
export class Task implements TaskParams {
  private readonly _log: Logger = logger();
  private readonly _created: Date = new Date();
  private readonly _handler: Handler = handler;
  private readonly _name: string;
  private readonly _needs: Array<string>;
  private readonly _executor: Executor;
  private readonly _options: Options;
  private readonly _type: TaskType = undefined;
  private _status: TaskStatus = 'ready';
  private _starting: null | PerformanceMark = null;
  private _finished: null | PerformanceMark = null;
  private _measure: null | PerformanceMeasure = null;
  private _process: null | Deno.Process = null;

  /**
   * Creates a new instance ot Task.
   *
   * @param {string | TaskParams} nameOrTask - The name or an object which provides all task parameters.
   * @param {string[]=[]} needs - Defines the dependencies which should be executed before this task.
   * @param {Command | Code} executor - A command, function or JS/TS-file to execute.
   * @param {Options} options - Options, depending on whether the executor is of type Command or Code.
   */
  constructor(nameOrTask: string | TaskParams, needs: Array<string> = [], executor?: Executor, options?: Options) {
    const task: TaskParams = typeof nameOrTask === 'object' ? nameOrTask as unknown as TaskParams : {
      name: nameOrTask as string,
      needs,
      executor,
      options,
    };

    this._name = task.name;
    this._needs = task.needs as Array<string>;
    this._executor = task.executor as Command;
    this._options = task.options as Options;
    this._handler.add(this);

    if (isCommand(executor)) {
      this._type = 'command';
    } else if (isCode(executor)) {
      this._type = 'code';
    }
  }

  /**
   * Unique name of the task.
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Status of the task.
   */
  public get status(): TaskStatus {
    return this._status;
  }

  /**
   * Timestamp when the handler was created.
   */
  public get created(): Date {
    return this._created;
  }

  /**
   * Performance mark when the last run starts.
   */
  public get starting(): null | PerformanceMark {
    return this._starting;
  }

  /**
   * Performance mark when the last run ends.
   */
  public get finished(): null | PerformanceMark {
    return this._finished;
  }

  /**
   * Performance measure of the last run.
   */
  public get measure(): null | PerformanceMeasure {
    return this._measure;
  }

  /**
   * Task that must be executed before this task is executed.
   */
  public get needs(): Array<string> {
    return this._needs;
  }

  /**
   * The command or code that will be executed by this task if it is set.
   */
  public get executor(): Executor {
    return this._executor;
  }

  /**
   * Options, depending on whether the executor is of type Command or Code.
   */
  public get options(): Options {
    return this._options;
  }

  /**
   * Gets the current process.
   */
  public get process(): null | Deno.Process {
    return this._process;
  }

  /**
   * Executes all dependent tasks and its own.
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  public async run(): Promise<void> {
    await this._handler.run(this._name);
  }

  /**
   * Executes only this task (without the dependencies).
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  public async runThis(): Promise<void> {
    if (this._type === undefined) {
      return;
    }

    if (this._status !== 'ready') {
      throw new Error(`The task '${this._name}' has already been run.`);
    }

    const result: boolean = await this._executeCondition(this._options?.condition || ((): boolean => true));
    if (!result) {
      this._log.warning('');
      this._log.warning(`Task {name} not started. The conditions of this task were not matched.`, {
        name: `'${gray(this._name)}'`,
      });

      return;
    }

    this._preRun();

    await this._run(this._type, this._executor, this._options)
      .catch((err) => {
        this._status = 'failed';

        this._log.error(`${bold(red('Error'))} {name}: ${err}`, {
          name: `'${gray(this._name)}'`,
        });

        throw err;
      });

    this._postRun();
  }

  /**
   * Resets the task so that it can be executed again.
   */
  public reset(): void {
    this._starting = null;
    this._finished = null;
    this._process = null;
    this._status = 'ready';
  }

  private _preRun(): void {
    this._log.info('');
    this._log.info(`Starting {name}...`, {
      name: `'${gray(this._name)}'`,
    });

    if (this._options?.description) {
      this._log.info(`Description: ${gray(this._options.description)}`);
    }

    this._finished = null;
    this._starting = performance.mark(`starting_${this._name}`, {
      startTime: Date.now(),
    });

    this._status = 'running';
  }

  private _postRun(): void {
    this._status = 'success';

    this._finished = performance.mark(`finished_${this._name}`, {
      startTime: Date.now(),
    });

    this._measure = performance.measure(this._name, `starting_${this._name}`, `finished_${this._name}`);

    this._log.info(`Finished {name} after {duration}`, {
      name: `'${gray(this._name)}'`,
      duration: `${bold(format(this._measure.duration, { ignoreZero: true }))}`,
    });
  }

  private async _run(type: TaskType, executor: Executor, options: Options): Promise<void> {
    if (type === 'command') {
      await this._runCommand(toCommand(executor), options);
    } else if (this._type === 'code') {
      await this._runCode(toCode(executor), options);
    }
  }

  private async _runCommand(command: Command, options: CommandOptions): Promise<void> {
    this._process = Deno.run({
      cmd: Array.isArray(command) ? command : command.split(' '),
      cwd: options?.cwd || Deno.cwd(),
      env: options?.env,
      stdout: options?.stdout || 'piped',
      stderr: options?.stderr || 'piped',
      stdin: options?.stdin || 'null',
    });

    const status: Deno.ProcessStatus = await this._process.status();
    const rawOutput: Uint8Array = await this._process.output();
    const rawError: Uint8Array = await this._process.stderrOutput();

    if (status.code === 0) {
      await Deno.stdout.write(rawOutput);

      this._process.close();
    } else {
      await Promise.reject(new TextDecoder().decode(rawError));

      this._process.kill();
    }
  }

  private async _runCode(code: Code, options: CodeOptions): Promise<void> {
    if (typeof code === 'function') {
      if (options?.repl) {
        const funcAsString = code.toString();
        const command: Command = ['deno', 'repl', '--eval', `(${funcAsString})(); close();`];

        return await this._runCommand(command, options);
      }

      return await this._executeCodeFunction(code);
    }

    const file: string = code.file instanceof URL ? code.file.toString() : code.file;
    const command: Command = ['deno', 'run', ...(options?.args || []), file];

    return await this._runCommand(command, options);
  }

  private async _executeCodeFunction(code: CodeFunction): Promise<void> {
    return code.length > 0 ? await new Promise((resolve) => code(() => resolve())) : await Promise.resolve(code(() => {}));
  }

  private async _executeCondition(condition: Condition): Promise<boolean> {
    return condition.length > 0 ? await new Promise((resolve) => condition((result: boolean) => resolve(result))) : await Promise.resolve(condition(() => true));
  }
}
