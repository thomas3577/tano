export interface IOptionsBase {
  cwd?: string;
  description?: string;
  condition?: Condition;
  abortOnError?: boolean;
}

export interface IExecutorOptions extends IOptionsBase {
  [key: string]: any;
}

export interface ICommandOptions extends IOptionsBase {
  [key: string]: any;
}

export interface ITask {
  name: string;
  required?: Array<string>;
  command?: Command;
  executor?: Executor;
  options?: Options;
}

export interface ITaskMethods {
  run<T>(): Promise<void>;
}

export type Options = IExecutorOptions | ICommandOptions;
export type Condition = (..._args: any[]) => (boolean | Promise<boolean>) | boolean;
export type Command = string;
export type Executor = <T>(..._args: any[]) => void | T | Promise<void | T>;
export type Required = Array<string | ITask>;
export type CommandOrExecutorOrOptions = Command | Executor | Options;
export type RequiredOrCommandOrExecutor = Required | Command | Executor;

export type TaskDefinition = {
  (task: ITask): ITask;
  (name: string, required?: Array<string>): ITask;
  (name: string, required?: Array<ITask>): ITask;
  (name: string, required?: Array<string | ITask>): ITask;
  (name: string, command?: Command, options?: ICommandOptions): ITask;
  (name: string, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<string>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<ITask>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<string | ITask>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<string>, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<ITask>, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<string | ITask>, executor?: Executor, options?: IExecutorOptions): ITask;
};
