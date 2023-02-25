import { Task } from './task.ts';

export type RunOptions = Omit<Deno.RunOptions, 'cmd'>;

export interface TanoConfig {
  file: string;
  task: string;
}

export interface TaskOptions extends RunOptions {
  description?: string;
  condition?: Condition;
}

export interface CodeOptions extends TaskOptions {
  repl?: boolean;
  args?: Array<string>;
}

export interface CommandOptions extends TaskOptions {
  [key: string]: any;
}

export interface TaskParams {
  name: string;
  needs?: Array<string>;
  options?: TaskOptions;
  executor?: Executor;
}

export interface Needs {
  values: Array<string | TaskParams>;
}

export interface CodeFile {
  file: string | URL;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type CodeFunctionWithDone = (done: (err?: unknown) => void) => void;
export type CodeFunctionWithoutDone = () => void | Promise<void>;
export type CodeFunction = CodeFunctionWithDone | CodeFunctionWithoutDone;
export type TaskStatus = 'ready' | 'running' | 'success' | 'failed';
export type Condition = (done: (result: boolean) => void) => (boolean | Promise<boolean>) | boolean;
export type Command = string | Array<string>;
export type Code = CodeFunction | CodeFile;
export type Options = CodeOptions | CommandOptions;
export type Executor = Command | Code;
export type ExecutorOrOptions = Executor | Options;
export type NeedsOrExecutor = Needs | Executor;

export type TaskDefinition = {
  (task: Task): Task;
  (task: TaskParams): Task;
  (name: string, needs?: Needs): Task;
  (name: string, command?: Command, options?: CommandOptions): Task;
  (name: string, needs?: Needs, command?: Command, options?: CommandOptions): Task;
  (name: string, code?: Code, options?: CodeOptions): Task;
  (name: string, needs?: Needs, code?: Code, options?: CodeOptions): Task;
};
