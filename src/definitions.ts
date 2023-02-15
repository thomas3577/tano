export interface IHandler {
  created: Date;
  starting: null | PerformanceMark;
  finished: null | PerformanceMark;
  count: number;
  add(task: ITaskParams): void;
  run(taskName?: string): Promise<void>;
  reset(): void;
  clear(): void;
}

export type RunOptions = Omit<Deno.RunOptions, 'cmd'>;

export interface ITaskOptions extends RunOptions {
  description?: string;
  condition?: Condition;
}

export interface ITaskParams {
  name: string;
  needs?: Array<string>;
  command?: Command;
  executor?: Executor;
  options?: ITaskOptions;
}

export interface ITask extends ITaskParams {
  status: TaskStatus;
  created: Date;
  starting: null | PerformanceMark;
  finished: null | PerformanceMark;
  run(): Promise<void>;
  reset(): void;
}

export interface INeeds {
  values: Array<string | ITaskParams>;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TaskStatus = 'ready' | 'running' | 'success' | 'failed';
export type Condition = (..._args: any[]) => (boolean | Promise<boolean>) | boolean;
export type Command = string | Array<string>;
export type Executor = <T>(..._args: any[]) => void | T | Promise<void | T>;
export type Needs = INeeds;
export type CommandOrExecutorOrOptions = Command | Executor | ITaskOptions;
export type NeedsOrCommandOrExecutor = Needs | Command | Executor;

export type TaskDefinition = {
  (task: ITask): ITask;
  (task: ITaskParams): ITask;
  (name: string, needs?: INeeds): ITask;
  (name: string, command?: Command, options?: ITaskOptions): ITask;
  (name: string, executor?: Executor, options?: ITaskOptions): ITask;
  (name: string, needs?: INeeds, command?: Command, options?: ITaskOptions): ITask;
  (name: string, needs?: INeeds, executor?: Executor, options?: ITaskOptions): ITask;
};
