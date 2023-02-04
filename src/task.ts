export interface IOptionsBase {
  description?: string;
  condition?: Condition;
}

export interface IExecutorOptions extends IOptionsBase {
  [key: string]: any;
}

export interface ICommandOptions extends IOptionsBase {
  cwd?: string;
  executor?: <T>(command: string, ..._args: any[]) => void | T | Promise<void | T>;
}

export interface ITask {
  name: string;
  required?: Array<string>;
  command?: Command;
  executor?: Executor;
  options?: Options;
  run(..._args: any[]): void;
}

export type Options = IExecutorOptions | ICommandOptions;
export type Condition = (..._args: any[]) => (boolean | Promise<boolean>) | boolean;
export type Command = string;
export type Executor = <T>(..._args: any[]) => void | T | Promise<void | T>;
export type Required = string | Array<string> | ITask | Array<ITask> | Array<string | ITask>;
export type CommandOrExecutorOrOptions = Command | Executor | Options;
export type RequiredOrCommandOrExecutor = Required | Executor;

export type TaskDefinition = {
  (task: ITask): ITask;
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
  private readonly _name: string;
  private readonly _required: Array<string>;
  private readonly _command: Command;
  private readonly _executor: Executor;
  private readonly _options: Options;

  constructor(nameOrTask: string | ITask, required?: Array<string>, command?: Command, executor?: Executor, options?: Options) {
    if (typeof nameOrTask === 'object') {
      const task: ITask = nameOrTask as ITask;
      this._name = task.name;
      this._required = task.required as Array<string>;
      this._command = task.command as Command;
      this._executor = task.executor as Executor;
      this._options = task.options as Options;
    } else if (typeof nameOrTask === 'string') {
      this._name = nameOrTask;
      this._required = required as Array<string>;
      this._command = command as Command;
      this._executor = executor as Executor;
      this._options = options as Options;
    } else {
      throw new Error(`Wrong type of first argument`);
    }
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

  public run(..._args: any[]): void {
    throw new Error('Method not implemented.');
  }
}

const getRequired = (param1: any): Array<string> => {
  if (typeof param1 === 'string') {
    return [param1];
  }

  if (Array.isArray(param1)) {
    return param1.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  if (typeof param1 === 'object' && param1.name) {
    return [param1.name];
  }

  return [];
};

const getCommand = (param1: any, param2: any, required: Array<string>): Command => {
  let command: Command = undefined as unknown as Command;

  if (typeof param2 === 'string') {
    command = param2;
  } else if (typeof param1 === 'string') {
    command = param1;
  }

  if (required.some((i) => i === command)) {
    return undefined as unknown as Command;
  }

  return command;
};

const getExecutor = (param1: any, param2: any): Executor => {
  if (typeof param1 === 'function') {
    return param1;
  } else if (typeof param2 === 'function') {
    return param2;
  }

  return undefined as unknown as Executor;
};

const getOptions = (param2: any, param3: any): Options => {
  if (typeof param2 === 'object') {
    return param2;
  } else if (typeof param3 === 'object') {
    return param3;
  }

  return undefined as unknown as Options;
};

export const task: TaskDefinition = (name: string | ITask, param1?: RequiredOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): ITask => {
  const required: Array<string> = getRequired(param1);
  const command: Command = getCommand(param1, param2, required);
  const executor: Executor = getExecutor(param1, param2);
  const options: Options = getOptions(param2, param3);
  const instance: ITask = new Task(name, required, command, executor, options);

  return instance;
};
