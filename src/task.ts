import { Command, CommandOrExecutorOrOptions, Executor, ICommandOptions, IHandler, ITask, ITaskMethods, Options, RequiredOrCommandOrExecutor, TaskDefinition } from './definitions.ts';
import { handler } from './handler.ts';

export class Task implements ITask, ITaskMethods {
  private readonly _handler: IHandler = handler;
  private readonly _name: string;
  private readonly _required: Array<string>;
  private readonly _command: Command;
  private readonly _executor: Executor;
  private readonly _options: Options;
  private _process: Deno.Process | null = null;

  constructor(nameOrTask: string | ITask, required: Array<string> = [], command?: Command, executor?: Executor, options?: Options) {
    const task: ITask = typeof nameOrTask === 'object' ? nameOrTask as unknown as ITask : {
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

  public get name(): string {
    return this._name;
  }

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
    if (this._command) {
      return await this._runCommand(this._command, this._options);
    }
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
    } else {
      await Promise.reject(new TextDecoder().decode(rawError));
      this._process.kill();
    }
  }
}

export const task: TaskDefinition = (name: string | ITask, param1?: RequiredOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): ITask => {
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

  const instance: ITask = new Task(name, required, command, executor, options);

  return instance;
};
