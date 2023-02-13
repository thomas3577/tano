import * as log from 'std/log/mod.ts';
import { format } from 'std/datetime/format.ts';

import { Command, CommandOrExecutorOrOptions, Executor, ICommandOptions, IExecutorOptions, IHandler, ITask, ITaskParams, Options, RequiredOrCommandOrExecutor, TaskDefinition, TaskStatus } from './definitions.ts';
import { handler } from './handler.ts';

export class Task implements ITask, ITaskParams {
  private readonly _created: Date = new Date();
  private readonly _handler: IHandler = handler;
  private readonly _name: string;
  private readonly _required: Array<string>;
  private readonly _command: Command;
  private readonly _executor: Executor;
  private readonly _options: Options;
  private _status: TaskStatus = 'ready';
  private _starting: null | PerformanceMark = null;
  private _finished: null | PerformanceMark = null;
  private _measure: null | PerformanceMeasure = null;
  private _process: null | Deno.Process = null;

  constructor(nameOrTask: string | ITaskParams, required: Array<string> = [], command?: Command, executor?: Executor, options?: Options) {
    const task: ITaskParams = typeof nameOrTask === 'object' ? nameOrTask as unknown as ITaskParams : {
      name: nameOrTask as string,
      required,
      command,
      executor,
      options,
    };

    this._name = task.name;
    this._required = task.required as Array<string>;
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
  public get required(): Array<string> {
    return this._required;
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

    log.info(`[${format(new Date(this._starting.startTime), 'HH:mm:ss')}] Starting '${this._name}'...`);

    if (this._command !== undefined) {
      await this._runCommand(this._command, this._options);
    } else if (this._executor !== undefined) {
      await this._runExecutor(this._executor, this._options);
    }

    this._finished = performance.mark('finished', {
      startTime: Date.now(),
    });

    this._measure = performance.measure(this._name, 'starting', 'finished');

    log.info(`[${format(new Date(this._finished.startTime), 'HH:mm:ss')}] Finished '${this._name}' after ${this._measure.duration} ms`);
  }

  public reset(): void {
    this._starting = null;
    this._finished = null;
    this._process = null;
    this._status = 'ready';
  }

  private async _runCommand(command: Command, options: ICommandOptions): Promise<void> {
    this._process = Deno.run({
      cwd: options?.cwd || Deno.cwd(),
      cmd: command.split(' '),
      stdout: 'piped',
      stderr: 'piped',
    });

    const status: Deno.ProcessStatus = await this._process.status();
    const rawOutput: Uint8Array = await this._process.output();
    const rawError: Uint8Array = await this._process.stderrOutput();

    if (status.code === 0) {
      await Deno.stdout.write(rawOutput);
      this._process.close();
      this._status = 'success';
    } else {
      await Promise.reject(new TextDecoder().decode(rawError));
      this._process.kill();
      this._status = 'failed';
    }
  }

  // TODO(thu): DO I really use options for executors?
  // deno-lint-ignore no-unused-vars
  private async _runExecutor(executor: Executor, options: IExecutorOptions): Promise<void> {
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

export const task: TaskDefinition = (nameOrTask: string | ITask | ITaskParams, param1?: RequiredOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): ITask => {
  if (nameOrTask instanceof Task) {
    return nameOrTask;
  }

  if (typeof nameOrTask === 'object') {
    return new Task(nameOrTask.name, nameOrTask.required, nameOrTask.command, nameOrTask.executor, nameOrTask.options);
  }

  let required: Array<string> = [];
  if (Array.isArray(param1)) {
    required = param1.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  let command: Command = undefined as unknown as Command;
  if (typeof param2 === 'string') {
    command = param2;
  } else if (typeof param1 === 'string') {
    command = param1;
  }

  let executor: Executor = undefined as unknown as Executor;
  if (typeof param1 === 'function') {
    executor = param1;
  } else if (typeof param2 === 'function') {
    executor = param2;
  }

  let options: Options = undefined as unknown as Options;
  if (typeof param2 === 'object') {
    options = param2;
  } else if (typeof param3 === 'object') {
    options = param3;
  }

  const instance: ITask = new Task(nameOrTask, required, command, executor, options);

  return instance;
};
