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

export interface ICodeOptions extends ITaskOptions {
  repl?: boolean;
  args?: Array<string>;
}

export interface ICommandOptions extends ITaskOptions {
  [key: string]: any;
}

export interface IExecutors {
  command?: Command;
  code?: Code;
}

export interface ITaskParams extends IExecutors {
  name: string;
  needs?: Array<string>;
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

export interface ICodeFile {
  file: string | URL;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TaskStatus = 'ready' | 'running' | 'success' | 'failed';
export type Condition = (..._args: any[]) => (boolean | Promise<boolean>) | boolean;
export type Command = string | Array<string>;
export type CodeFunction = <T>(done: () => void) => void | T | Promise<void | T>;
export type CodeFile = ICodeFile;
export type Code = CodeFunction | CodeFile;
export type Options = ICodeOptions | ICommandOptions;
export type Needs = INeeds;
export type CommandOrCodeOrOptions = Command | Code | Options;
export type NeedsOrCommandOrCode = Needs | Command | Code;

export type TaskDefinition = {
  (task: ITask): ITask;
  (task: ITaskParams): ITask;
  (name: string, needs?: INeeds): ITask;
  (name: string, command?: Command, options?: ICommandOptions): ITask;
  (name: string, code?: Code, options?: ICodeOptions): ITask;
  (name: string, needs?: INeeds, command?: Command, options?: ICommandOptions): ITask;
  (name: string, needs?: INeeds, code?: Code, options?: ICodeOptions): ITask;
};
