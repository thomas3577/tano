export interface IOptionsBase {
  description?: string;
  condition?: Condition;
}

export interface IExecutorOptions extends IOptionsBase {
  [key: string]: any;
}

export interface ICommandOptions extends IOptionsBase {
  cwd?: string;
  executor?: <T>(command: string, ...args: any[]) => void | T | Promise<void | T>;
}

export interface ITask {
  name: string;
  required?: Required;
  command?: Command;
  executor?: Executor;
  options?: Options;
  run(...args: any[]): void;
}

export type Options = IExecutorOptions | ICommandOptions;
export type Condition = (...args: any[]) => (boolean | Promise<boolean>) | boolean;
export type Command = string;
export type Executor = <T>(...args: any[]) => void | T | Promise<void | T>;
export type Required = string | Array<string> | ITask | Array<ITask> | Array<string | ITask>;
export type CommandOrExecutorOrOptions = Command | Executor | Options;
export type RequiredOrCommandOrExecutor = Required | Executor;

export type TaskDefinition = {
  (name: string, required?: string): ITask;
  (name: string, required?: Array<string>): ITask;
  (name: string, required?: ITask): ITask;
  (name: string, required?: Array<ITask>): ITask;
  (name: string, required?: Array<string | ITask>): ITask;
  (name: string, command?: Command, options?: ICommandOptions): ITask;
  (name: string, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: string, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<string>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: ITask, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<ITask>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<string | ITask>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: string, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<string>, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: ITask, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<ITask>, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<string | ITask>, executor?: Executor, options?: IExecutorOptions): ITask;
};

export class Task implements ITask {
  constructor(
    private readonly _name: string,
    private readonly _required: Required,
    private readonly _command: Command,
    private readonly _executor: Executor,
    private readonly _options: Options,
  ) {}

  public get name(): string {
    return this._name;
  }

  public get required(): Required {
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

  public run(...args: any[]): void {
    throw new Error('Method not implemented.');
  }
}

export const task: TaskDefinition = (name: string, param1?: RequiredOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): ITask => {
  return null as unknown as ITask;
};
