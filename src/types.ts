import { Task } from './task.ts';

/**
 * There are two types of task. Commands, i.e. command line commands and code (JavaScript/TypeScript).
 */
export type TaskType = 'command' | 'code' | undefined;

export type ProcessOutput = {
  status?: Deno.ProcessStatus;
  rawOutput?: Uint8Array;
  rawError?: Uint8Array;
  error?: string;
  process?: Deno.Process<Deno.RunOptions>;
};

/**
 * RunOptions are almost the same as the Deno.RunOptions with the difference that we exclude the attribute "cmd" because we handle this outside of these options.
 */
export type RunOptions = Omit<Deno.RunOptions, 'cmd'>;

/**
 * These are the tano actions that you can run through the CLI.
 */
export type TanoCliAction = 'run' | 'help' | 'version';

/**
 * These are the tano options that you can specify either via environment variables or args.
 */
export interface TanoConfig {
  file: string;
  task: string;
  failFast: boolean;
  action: TanoCliAction;
}

/**
 * These are the parameters that are created in the working directory each time the tasks are executed.
 */
export interface TaskRunData {
  lastRun?: string;
}

/**
 * These are the additional task run options (besides the `RunOptions`)
 */
export interface TaskOptions extends RunOptions {
  condition?: Condition;
  output?: (err: unknown, output: any) => void;
}

/**
 * These are the additional task run options for code tasks (besides the `TaskOptions`)
 */
export interface CodeOptions extends TaskOptions {
  repl?: boolean;
  args?: Array<string>;
}

/**
 * These are the additional task run options for command tasks (besides the `TaskOptions`)
 */
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

export type ConditionType1 = boolean;
export type ConditionType2 = () => boolean | Promise<boolean>;
export type ConditionType3 = (done: (result: boolean) => void) => void;
export type Condition = ConditionType1 | ConditionType2 | ConditionType3;

export type CodeFunctionWithDone = (done: (err?: unknown) => void) => void;
export type CodeFunctionWithoutDone = () => void | Promise<void>;
export type CodeFunction = CodeFunctionWithDone | CodeFunctionWithoutDone;
export type Code = CodeFunction | CodeFile;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type TaskStatus = 'ready' | 'running' | 'success' | 'failed';
export type Command = string | Array<string>;
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
