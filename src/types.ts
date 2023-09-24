import { GlobToRegExpOptions } from 'std/path/glob.ts';

import { Task } from './task.ts';

/**
 * Great idea from Peter Kröner <peter@peterkroener.de> to make Properties optional.
 */
export type Optional<Source, Keys extends keyof Source> =
  & {
    [Key in Keys]?: Source[Key];
  }
  & Pick<Source, Exclude<keyof Source, Keys>>;

export type GlobHashOptions = Optional<GlobHashOptionsStrict, 'root' | 'globToRegExpOptions'>;

/**
 * Defines the files that must be included in the hash.
 *
 * @remarks
 * Internal type of The GlobHashOptions. The `root` property does have to be set.
 */
export interface GlobHashOptionsStrict {
  /**
   * Array of glob rules.
   */
  include: string[];

  /**
   * Array of glob rules.
   */
  exclude?: string[];

  /**
   * The directory in which the glob rules should be applied.
   * If a glob rule wants to include files outside the root directory, these files will be ignored.
   */
  root: string;

  /**
   * (optional) Deno GlobToRegExpOptions
   */
  globToRegExpOptions?: GlobToRegExpOptions;
}

/**
 * Defines the files that must be included in the hash.
 *
 * @remarks
 * The `root` property does not have to be set. Default is `.`.
 */
export type GlobHashSource = boolean | string | string[] | GlobHashOptions;

/**
 * There are two types of task. Commands, i.e. command line commands and code (JavaScript/TypeScript).
 */
export type TaskType = 'command' | 'code' | undefined;

export type ProcessError = {
  error?: string;
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

  /**
   * If you have set `source` in a task, and this `source` indicates that no files have changed since the last `run`, this task will be skipped.
   * But if you now set `force` to true, this task will be executed anyway.
   */
  force: boolean;
}

/**
 * This is the parameters that is stored when a task is completed.
 *
 * @remarks
 * The path where the data will be stored is `{cwd}/.tano/cache.json`.
 */
export interface TaskRunData {
  /**
   * Timestamp of the last execution of the task.
   */
  lastRun: string;

  /**
   * Status of the last execution of the task.
   */
  lastStatus: TaskStatus;

  /**
   * Checksum of all files by GlobHashOptions.
   */
  hash?: string;
}

/**
 * These are the parameters that are created in the working directory each time the tasks are executed.
 *
 * @remarks
 * The path where the data will be stored is `{cwd}/.tano/cache.json`.
 */
export interface TanoRunData {
  tasks: Record<string, TaskRunData>;
}

/**
 * These are the additional task run options (besides the `RunOptions`)
 */
export interface TaskOptions extends Deno.CommandOptions {
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
  source?: GlobHashSource;

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

/**
 * A simple condition.
 *
 * @example
 * 1 === 1;
 */
export type ConditionType1 = boolean;

/**
 * A function which returns a boolean or a promise of type boolean.
 *
 * @example
 * () => 1 === 1;
 *
 * @example
 * () => Promise.resolve(1 === 1);
 */
export type ConditionType2 = () => boolean | Promise<boolean>;

/**
 * A function with a callback function which returns a boolean.
 *
 * @example
 * (done) => done(1 === 1);
 */
export type ConditionType3 = (done: (result: boolean) => void) => void;

/**
 * Type of all possible condition types.
 */
export type Condition = ConditionType1 | ConditionType2 | ConditionType3;

export type CodeFunctionWithDone = (done: (err?: unknown) => void) => void;
export type CodeFunctionWithoutDone = <T>() => void | T | Promise<void | T>;
export type CodeFunction = CodeFunctionWithDone | CodeFunctionWithoutDone;
export type Code = CodeFunction | CodeFile;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type TaskStatus = 'ready' | 'skipped' | 'running' | 'success' | 'failed';
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
