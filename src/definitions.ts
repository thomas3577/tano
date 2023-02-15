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
  options?: TaskOptions;
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
export type TaskOptions = ITaskOptions;
export type Condition = (..._args: any[]) => (boolean | Promise<boolean>) | boolean;
export type Command = string | Array<string>;
export type Executor = <T>(..._args: any[]) => void | T | Promise<void | T>;
export type Needs = Array<string | ITaskParams>;
export type CommandOrExecutorOrOptions = Command | Executor | TaskOptions;
export type NeedsOrCommandOrExecutor = Needs | Command | Executor;

export type TaskDefinition = {
  (task: ITask): ITask;
  (task: ITaskParams): ITask;
  (name: string, needs?: Array<string>): ITask;
  (name: string, needs?: Array<ITaskParams>): ITask;
  (name: string, needs?: Array<string | ITaskParams>): ITask;
  (name: string, command?: Command, options?: TaskOptions): ITask; // TODO(thu): Still in conflict with "needs"
  (name: string, executor?: Executor, options?: TaskOptions): ITask;
  (name: string, needs?: Array<string>, command?: Command, options?: TaskOptions): ITask;
  (name: string, needs?: Array<ITaskParams>, command?: Command, options?: TaskOptions): ITask;
  (name: string, needs?: Array<string | ITaskParams>, command?: Command, options?: TaskOptions): ITask;
  (name: string, needs?: Array<string>, executor?: Executor, options?: TaskOptions): ITask;
  (name: string, needs?: Array<ITaskParams>, executor?: Executor, options?: TaskOptions): ITask;
  (name: string, needs?: Array<string | ITaskParams>, executor?: Executor, options?: TaskOptions): ITask;
};
