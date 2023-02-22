import { bold, gray, red } from 'std/fmt/colors.ts';
import { format } from 'std/fmt/duration.ts';

import { Logger, logger } from './logger.ts';
import { handler } from './handler.ts';

import type { Code, CodeFunction, Command, Condition, Executor, ICodeFile, ICodeOptions, ICommandOptions, IHandler, ITask, ITaskParams, Options, TaskStatus } from './definitions.ts';

type TaskType = 'command' | 'code' | undefined;

const toCommand = (commandOrCode?: Executor): Command => {
  if (typeof commandOrCode === 'string' || (typeof commandOrCode === 'object' && Array.isArray(commandOrCode))) {
    return commandOrCode as Command;
  } else {
    return undefined as unknown as Command;
  }
};

const toCode = (commandOrCode?: Executor): Code => {
  if ((typeof commandOrCode === 'object' && (commandOrCode as ICodeFile).file !== undefined) || typeof commandOrCode === 'function') {
    return commandOrCode as Code;
  } else {
    return undefined as unknown as Code;
  }
};

/**
 * Creates a new Task.
 */
export class Task implements ITask, ITaskParams {
  private readonly _log: Logger = logger();
  private readonly _created: Date = new Date();
  private readonly _handler: IHandler = handler;
  private readonly _name: string;
  private readonly _needs: Array<string>;
  private readonly _command: Command;
  private readonly _code: Code;
  private readonly _options: Options;
  private _type: TaskType = undefined;
  private _status: TaskStatus = 'ready';
  private _starting: null | PerformanceMark = null;
  private _finished: null | PerformanceMark = null;
  private _measure: null | PerformanceMeasure = null;
  private _process: null | Deno.Process = null;

  /**
   * Creates a new instance ot Task.
   *
   * @param {string | ITaskParams} nameOrTask - The name or an object which provides all task parameters.
   * @param {string[]=[]} needs - Defines the dependencies which should be executed before this task.
   * @param {Command | Code} executor - A command, function or JS/TS-file to execute.
   * @param {Options} options - Options, depending on whether the executor is of type Command or Code.
   */
  constructor(nameOrTask: string | ITaskParams, needs: Array<string> = [], executor?: Executor, options?: Options) {
    const code: Code = toCode(executor);
    const command: Command = toCommand(executor);
    const task: ITaskParams = typeof nameOrTask === 'object' ? nameOrTask as unknown as ITaskParams : {
      name: nameOrTask as string,
      needs,
      command,
      code,
      options,
    };

    this._name = task.name;
    this._needs = task.needs as Array<string>;
    this._command = task.command as Command;
    this._code = task.code as Code;
    this._options = task.options as Options;
    this._handler.add(this);

    if (this._command !== undefined) {
      this._type = 'command';
    } else if (this._code !== undefined) {
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
   * The command that will be executed by this task if it is set.
   */
  public get command(): Command {
    return this._command;
  }

  /**
   * The code that will be executed by this task if it is set.
   */
  public get code(): Code {
    return this._code;
  }

  /**
   * Options, depending on whether the executor is of type Command or Code.
   */
  public get options(): Options {
    return this._options;
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

    await this._run(this._type, this._command, this._code, this._options)
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

  private async _run(type: TaskType, command: Command, code: Code, options: Options): Promise<void> {
    if (type === 'command') {
      await this._runCommand(command, options);
    } else if (this._type === 'code') {
      await this._runCode(code, options);
    }
  }

  private async _runCommand(command: Command, options: ICommandOptions): Promise<void> {
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

  private async _runCode(code: Code, options: ICodeOptions): Promise<void> {
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
