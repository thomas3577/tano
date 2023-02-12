export interface IHandler {
  createdAt: null | Date;
  count: number;
  add(task: ITaskParams): void;
  run(taskName?: string): Promise<void>;
}

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

export interface ITaskParams {
  name: string;
  required?: Array<string>;
  command?: Command;
  executor?: Executor;
  options?: Options;
}

export interface ITask extends ITaskParams {
  status: TaskStatus;
  started: null | Date;
  finished: null | Date;
  run<T>(): Promise<void>;
}

export type TaskStatus = 'ready' | 'running' | 'success' | 'failed';
export type Options = IExecutorOptions | ICommandOptions;
export type Condition = (..._args: any[]) => (boolean | Promise<boolean>) | boolean;
export type Command = string;
export type Executor = <T>(..._args: any[]) => void | T | Promise<void | T>;
export type Required = Array<string | ITaskParams>;
export type CommandOrExecutorOrOptions = Command | Executor | Options;
export type RequiredOrCommandOrExecutor = Required | Command | Executor;

export type TaskDefinition = {
  (task: ITask): ITask;
  (task: ITaskParams): ITask;
  (name: string, required?: Array<string>): ITask;
  (name: string, required?: Array<ITaskParams>): ITask;
  (name: string, required?: Array<string | ITaskParams>): ITask;
  (name: string, command?: Command, options?: ICommandOptions): ITask;
  (name: string, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<string>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<ITaskParams>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<string | ITaskParams>, command?: Command, options?: ICommandOptions): ITask;
  (name: string, required?: Array<string>, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<ITaskParams>, executor?: Executor, options?: IExecutorOptions): ITask;
  (name: string, required?: Array<string | ITaskParams>, executor?: Executor, options?: IExecutorOptions): ITask;
};
