export interface ITanoConfig {
  file: string;
  task: string;
}

export interface IHandler {
  created: Date;
  starting: null | PerformanceMark;
  finished: null | PerformanceMark;
  count: number;
  executed: number;
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

export interface ICodeOptions extends ITaskOptions {
  repl?: boolean;
  args?: Array<string>;
}

export interface ICommandOptions extends ITaskOptions {
  [key: string]: any;
}

export interface ITaskParams {
  name: string;
  needs?: Array<string>;
  options?: ITaskOptions;
  executor?: Executor;
}

export interface ITask extends ITaskParams {
  status: TaskStatus;
  created: Date;
  starting: null | PerformanceMark;
  finished: null | PerformanceMark;
  measure: null | PerformanceMeasure;
  process: null | Deno.Process;
  run(): Promise<void>;
  runThis(): Promise<void>;
  reset(): void;
}

export interface INeeds {
  values: Array<string | ITaskParams>;
}

export interface ICodeFile {
  file: string | URL;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TaskStatus = 'ready' | 'running' | 'success' | 'failed';
export type Condition = (done: (result: boolean) => void) => (boolean | Promise<boolean>) | boolean;
export type Command = string | Array<string>;
export type CodeFunction = <T>(done?: (result: T) => T | void) => void | T | PromiseLike<T | void>;
export type CodeFile = ICodeFile;
export type Code = CodeFunction | CodeFile;
export type Options = ICodeOptions | ICommandOptions;
export type Executor = Command | Code;
export type Needs = INeeds;
export type ExecutorOrOptions = Executor | Options;
export type NeedsOrExecutor = Needs | Executor;

export type TaskDefinition = {
  (task: ITask): ITask;
  (task: ITaskParams): ITask;
  (name: string, needs?: INeeds): ITask;
  (name: string, command?: Command, options?: ICommandOptions): ITask;
  (name: string, needs?: INeeds, command?: Command, options?: ICommandOptions): ITask;
  (name: string, code?: Code, options?: ICodeOptions): ITask;
  (name: string, needs?: INeeds, code?: Code, options?: ICodeOptions): ITask;
};
