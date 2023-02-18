import { bold, gray } from 'std/fmt/colors.ts';
import { format } from 'std/fmt/duration.ts';

import { log } from './logger.ts';
import { handler } from './handler.ts';

import type { Code, CodeFunction, Command, ICodeOptions, ICommandOptions, IHandler, ITask, ITaskParams, Options, TaskStatus } from './definitions.ts';

export class Task implements ITask, ITaskParams {
  private readonly _created: Date = new Date();
  private readonly _handler: IHandler = handler;
  private readonly _name: string;
  private readonly _needs: Array<string>;
  private readonly _command: Command;
  private readonly _code: Code;
  private readonly _options: Options;
  private _status: TaskStatus = 'ready';
  private _starting: null | PerformanceMark = null;
  private _finished: null | PerformanceMark = null;
  private _measure: null | PerformanceMeasure = null;
  private _process: null | Deno.Process = null;

  constructor(nameOrTask: string | ITaskParams, needs: Array<string> = [], command?: Command, code?: Code, options?: Options) {
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

  public get command(): Command {
    return this._command;
  }

  public get code(): Code {
    return this._code;
  }

  public get options(): Options {
    return this._options;
  }

  public async run(): Promise<void> {
    if (this._command === undefined && this._code === undefined) {
      return;
    }

    log.info('');
    log.info(`Starting {name}...`, {
      name: `'${gray(this._name)}'`,
    });

    this._finished = null;
    this._starting = performance.mark(`starting_${this._name}`, {
      startTime: Date.now(),
    });

    this._status = 'running';

    if (this._command !== undefined) {
      await this._runCommand(this._command, this._options);
    } else if (this._code !== undefined) {
      await this._runCode(this._code, this._options);
    }

    this._finished = performance.mark(`finished_${this._name}`, {
      startTime: Date.now(),
    });

    this._measure = performance.measure(this._name, `starting_${this._name}`, `finished_${this._name}`);

    log.info(`Finished {name} after {duration}`, {
      name: `'${gray(this._name)}'`,
      duration: `${bold(format(this._measure.duration, { ignoreZero: true }))}`,
    });
  }

  public reset(): void {
    this._starting = null;
    this._finished = null;
    this._process = null;
    this._status = 'ready';
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
      this._status = 'success';
    } else {
      log.error(`[${this._name}] ${rawError}`);
      await Promise.reject(new TextDecoder().decode(rawError));
      this._process.kill();
      this._status = 'failed';
    }
  }

  private async _runCode(code: Code, options: ICodeOptions): Promise<void> {
    if (typeof code === 'function') {
      if (options?.repl) {
        const funcAsString = code.toString();
        const command: Command = ['deno', 'repl', '--eval', `(${funcAsString})(); close();`];

        return await this._runCommand(command, options);
      }

      const func: CodeFunction = code as CodeFunction;
      if (func.length > 0) {
        return await new Promise((resolve) => func(() => resolve()));
      } else {
        return await Promise.resolve(func(() => {}));
      }
    }

    const file: string = code.file instanceof URL ? code.file.toString() : code.file;
    const command: Command = ['deno', 'run', ...(options?.args || []), file];

    return await this._runCommand(command, options);
  }
}
