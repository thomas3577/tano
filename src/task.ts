import { Command, CommandOrExecutorOrOptions, Executor, ICommandOptions, ITask, ITaskMethods, Options, RequiredOrCommandOrExecutor, TaskDefinition } from './definitions.ts';
import { getCommand, getExecutor, getOptions, getRequired } from './utils.ts';

export class Task implements ITask, ITaskMethods {
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
  const required: Array<string> = getRequired(param1);
  const command: Command = getCommand(param1, param2);
  const executor: Executor = getExecutor(param1, param2);
  const options: Options = getOptions(param2, param3);
  const instance: ITask = new Task(name, required, command, executor, options);

  return instance;
};
