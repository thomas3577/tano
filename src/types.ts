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
 * RunOptions are almost the same as the Deno.RunOptions with the difference that we exclude the attribute "cmd"
 * because we handle this outside of these options.
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
  /**
   * The path to the tanofile.
   */
  file: string;

  /**
   * Name of the task to be executed.
   */
  task: string;

  /**
   * If `true`, it will be aborted at the first error.
   */
  failFast: boolean;

  /**
   * The CLI action.
   */
  action: TanoCliAction;
}

/**
 * These are the parameters that are created in the working directory each time the tasks are executed.
 */
export interface TaskRunData {
  /**
   * Defines the timestamp when the task was last executed. The timestamp is in ISO string format.
   */
  lastRun?: string;
}

/**
 * These are the additional task run options (besides the `RunOptions`)
 */
export interface TaskOptions extends RunOptions {
  /**
   * You can specify a function that returns a boolean. As a condition whether a task must be executed or skipped. If `true`, the task is executed.
   */
  condition?: Condition;

  /**
   * The source to which this task surely refers. You can use `glob` for this.
   *
   * @remarks
   * `source` is only necessary if a task is to be executed only if something has changed at the source.
   */
  source?: string[];

  /**
   * Callback function to get to output from the task.
   *
   * @remarks
   * Unstable! The output property will probably change again.
   */
  output?: (err: unknown, output: any) => void;
}

/**
 * These are the additional task run options for code tasks (besides the `TaskOptions`)
 */
export interface CodeOptions extends TaskOptions {
  /**
   * If you want, you can run your code with Deno repl.
   * This has the advantage that the code is executed in a separate process. But there are also some disadvantages :-)
   */
  repl?: boolean;

  /**
   * If your runs a TypeScript/JavaScript file, you can add Deno args here.
   */
  args?: Array<string>;
}

/**
 * These are the additional task run options for command tasks (besides the `TaskOptions`)
 */
export interface CommandOptions extends TaskOptions {
  /**
   * Note! Currently there are no command specific properties.
   */
  [key: string]: any;
}

/**
 * The task parameters.
 */
export interface TaskParams {
  /**
   * The name of the task. This name have to be unique.
   */
  name: string;

  /**
   * Defines the tasks that must be performed beforehand.
   */
  needs?: Array<string>;

  /**
   * Options depending on the executor type.
   */
  options?: TaskOptions;

  /**
   * There are two different types of tasks. Code tasks and command tasks.
   */
  executor?: Executor;
}

export interface Needs {
  /**
   * List of task names or task objects.
   */
  values: Array<string | TaskParams>;
}

export interface CodeFile {
  /**
   * If the `code` is a TypeScript/JavaScript file.
   */
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
