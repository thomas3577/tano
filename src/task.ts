import { bold, gray, red } from 'std/fmt/colors.ts';
import { format } from 'std/fmt/duration.ts';

import { Logger, logger } from './logger.ts';
import { handler } from './handler.ts';

import type { Code, CodeFunction, Command, Condition, ICodeOptions, ICommandOptions, IHandler, ITask, ITaskParams, Options, TaskStatus } from './definitions.ts';

export class Task implements ITask, ITaskParams {
  private readonly _log: Logger = logger();
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
    await this._handler.run(this._name);
  }

  public async runThis(): Promise<void> {
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

    if (this._command === undefined && this._code === undefined) {
      return;
    }

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

    if (this._command !== undefined) {
      await this._runCommand(this._command, this._options);
    } else if (this._code !== undefined) {
      await this._runCode(this._code, this._options);
    }

    this._finished = performance.mark(`finished_${this._name}`, {
      startTime: Date.now(),
    });

    this._measure = performance.measure(this._name, `starting_${this._name}`, `finished_${this._name}`);

    this._log.info(`Finished {name} after {duration}`, {
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
      this._log.error(`${bold(red('Error'))} {name}: ${rawError}`, {
        name: `'${gray(this._name)}'`,
      });

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

        return await this._runCommand(command, options)
          .then(() => {
            this._status = 'success';
          })
          .catch((err) => {
            this._status = 'failed';

            throw err;
          });
      }

      return await this._executeCodeFunction(code)
        .then(() => {
          this._status = 'success';
        })
        .catch((err) => {
          this._status = 'failed';

          throw err;
        });
    }

    const file: string = code.file instanceof URL ? code.file.toString() : code.file;
    const command: Command = ['deno', 'run', ...(options?.args || []), file];

    return await this._runCommand(command, options)
      .then(() => {
        this._status = 'success';
      })
      .catch((err) => {
        this._status = 'failed';

        throw err;
      });
  }

  private async _executeCodeFunction(code: CodeFunction): Promise<void> {
    if (code.length > 0) {
      return await new Promise((resolve) => code(() => resolve()));
    } else {
      return await Promise.resolve(code(() => {}));
    }
  }

  private async _executeCondition(condition: Condition): Promise<boolean> {
    if (condition.length > 0) {
      return await new Promise((resolve) => condition((result: boolean) => resolve(result)));
    } else {
      return await Promise.resolve(condition(() => true));
    }
  }
}
