export interface IOptionsBase {
  description: string;
}

export interface IExecutorOptions extends IOptionsBase {
  [key: string]: any;
}

export interface ICommandOptions extends IOptionsBase {
  cwd: string;
  executor: <T>(command: string, ...args: any[]) => void | T | Promise<void | T>;
}

export interface ITask {
  name: string;
  required?: Required;
  command?: Command;
  executor?: Executor;
  options?: Options;
}

export type Task = null | ITask;
export type Options = IExecutorOptions | ICommandOptions;
export type Command = string;
export type Executor = <T>(...args: any[]) => void | T | Promise<void | T>;
export type Required = string | Array<string> | Task | Array<Task> | Array<string | Task>;
export type CommandOrExecutorOrOptions = Command | Executor | Options;
export type RequiredOrCommandOrExecutor = Required | Executor;

export type TaskDefinition = {
  (name: string, required?: string): Task;
  (name: string, required?: Array<string>): Task;
  (name: string, required?: Task): Task;
  (name: string, required?: Array<Task>): Task;
  (name: string, required?: Array<string | Task>): Task;
  (name: string, command?: Command, options?: ICommandOptions): Task;
  (name: string, executor?: Executor, options?: IExecutorOptions): Task;
  (name: string, required?: string, command?: Command, options?: ICommandOptions): Task;
  (name: string, required?: Array<string>, command?: Command, options?: ICommandOptions): Task;
  (name: string, required?: Task, command?: Command, options?: ICommandOptions): Task;
  (name: string, required?: Array<Task>, command?: Command, options?: ICommandOptions): Task;
  (name: string, required?: Array<string | Task>, command?: Command, options?: ICommandOptions): Task;
  (name: string, required?: string, executor?: Executor, options?: IExecutorOptions): Task;
  (name: string, required?: Array<string>, executor?: Executor, options?: IExecutorOptions): Task;
  (name: string, required?: Task, executor?: Executor, options?: IExecutorOptions): Task;
  (name: string, required?: Array<Task>, executor?: Executor, options?: IExecutorOptions): Task;
  (name: string, required?: Array<string | Task>, executor?: Executor, options?: IExecutorOptions): Task;
};

export const task: TaskDefinition = (name: string, param1?: RequiredOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): Task => {
  return null;
};
