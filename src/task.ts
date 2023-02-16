import { error, info } from 'std/log/mod.ts';
import { format } from 'std/datetime/format.ts';

import { handler } from './handler.ts';

import type { Command, Executor, ICommandOptions, IExecutorOptions, IHandler, ITask, ITaskParams, Options, TaskStatus } from './definitions.ts';

export class Task implements ITask, ITaskParams {
  private readonly _created: Date = new Date();
  private readonly _handler: IHandler = handler;
  private readonly _name: string;
  private readonly _needs: Array<string>;
  private readonly _command: Command;
  private readonly _executor: Executor;
  private readonly _options: Options;
  private _status: TaskStatus = 'ready';
  private _starting: null | PerformanceMark = null;
  private _finished: null | PerformanceMark = null;
  private _measure: null | PerformanceMeasure = null;
  private _process: null | Deno.Process = null;

  constructor(nameOrTask: string | ITaskParams, needs: Array<string> = [], command?: Command, executor?: Executor, options?: Options) {
    const task: ITaskParams = typeof nameOrTask === 'object' ? nameOrTask as unknown as ITaskParams : {
      name: nameOrTask as string,
      needs,
      command,
      executor,
      options,
    };

    this._name = task.name;
    this._needs = task.needs as Array<string>;
    this._command = task.command as Command;
    this._executor = task.executor as Executor;
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

  public get executor(): Executor {
    return this._executor;
  }

  public get options(): Options {
    return this._options;
  }

  public async run(): Promise<void> {
    this._finished = null;
    this._starting = performance.mark('starting', {
      startTime: Date.now(),
    });

    this._status = 'running';

    info(`[${format(new Date(this._starting.startTime), 'HH:mm:ss')}] Starting '${this._name}'...`);

    if (this._command !== undefined) {
      await this._runCommand(this._command, this._options);
    } else if (this._executor !== undefined) {
      await this._runExecutor(this._executor, this._options);
    }

    this._finished = performance.mark('finished', {
      startTime: Date.now(),
    });

    this._measure = performance.measure(this._name, 'starting', 'finished');

    info(`[${format(new Date(this._finished.startTime), 'HH:mm:ss')}] Finished '${this._name}' after ${this._measure.duration} ms`);
  }

  public reset(): void {
    this._starting = null;
    this._finished = null;
    this._process = null;
    this._status = 'ready';
  }

  private async _runCommand(command: Command, options: ICommandOptions): Promise<void> {
    this._process = Deno.run({
      cmd: Array.isArray(command) ? command : command.split(' '), // TODO(thu): It's a bad idea to split. But [command] won't work.
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
      error(`[${format(new Date(), 'HH:mm:ss')}] ${rawError}`);
      await Promise.reject(new TextDecoder().decode(rawError));
      this._process.kill();
      this._status = 'failed';
    }
  }

  // deno-lint-ignore no-unused-vars
  private async _runExecutor(executor: Executor, options: IExecutorOptions): Promise<void> {
    // TODO(thu): Instead of this, better you call _runCommand here and use 'deno run'-Command
    // Note! You need options for permission like '-A' or '--allow-write'.
    if (this._returnsPromise(executor)) {
      if (this._isAsync(executor)) {
        return await executor();
      } else {
        return await new Promise((resolve, reject) => {
          (executor as () => Promise<void | any>)()
            .then(() => resolve())
            .catch((err: unknown) => reject(err));
        });
      }
    } else {
      return executor();
    }
  }

  private _returnsPromise(fn: () => void | any): boolean {
    return fn() instanceof Promise;
  }

  private _isAsync(fn: () => void | any): boolean {
    return fn.constructor.name === 'AsyncFunction';
  }
}
