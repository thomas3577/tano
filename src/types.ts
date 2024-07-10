/**
 * This module contains types.
 *
 * @module
 */

import type { GlobToRegExpOptions } from '@std/path';
import type { Task } from './task.ts';

/**
 * The changes interface to determine if there are file changes in the glob area.
 */
export interface IChanges {
  /**
   * Indicates whether something has changed at the source or not.
   *
   * @param {string} taskName - Name of the desired task.
   * @param {GlobHashSource} source - Global hash source of the files to be checked for changes.
   */
  hasChanged(taskName: string, source?: GlobHashSource): Promise<boolean>;

  /**
   * Writes the information of the executed task to the database.
   *
   * @param {string} taskName - Name of the desired task.
   * @param {Date} timestamp - execution date.
   * @param {TaskStatus} status - Execution status of the task.
   * @param {GlobHashSource} source - Global hash source of the files.
   */
  update(taskName: string, timestamp: Date, status: TaskStatus, source?: GlobHashSource): Promise<void>;

  /**
   * Gets information about the last run.
   *
   * @param {string} taskName - Name of the desired task.
   */
  get(taskName: string): Promise<undefined | TaskRunData>;

  /**
   * Disposes of resources held by the object.
   */
  dispose(): void;
}

/**
 * Great idea from Peter Kröner <peter@peterkroener.de> to make Properties optional.
 */
export type Optional<Source, Keys extends keyof Source> =
  & {
    [Key in Keys]?: Source[Key];
  }
  & Pick<Source, Exclude<keyof Source, Keys>>;

/**
 * Same like {@linkcode GlobHashOptionsStrict} but `root` and `globToRegExpOptions` are optional.
 */
export type GlobHashOptions = Optional<GlobHashOptionsStrict, 'root' | 'globToRegExpOptions'>;

/**
 * Defines the files that must be included in the hash.
 *
 * @remarks
 * Internal type of The GlobHashOptions. The `root` property does have to be set.
 */
export type GlobHashOptionsStrict = {
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
   * Deno GlobToRegExpOptions
   */
  globToRegExpOptions: GlobToRegExpOptions;
};

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

/**
 * Defines a process error.
 */
export type ProcessError = {
  error?: string;
};

/**
 * Defines the possible log handler.
 */
export type LogHandler = 'console' | 'stream' | 'file';

/**
 * The log stream.
 */
export type LogStream = {
  /**
   * The readable stream of the log.
   */
  readable: ReadableStream<string>;
};

/**
 * RunOptions are almost the same as the Deno.RunOptions with the difference that we exclude the attribute "cmd"
 * because we handle this outside of these options.
 */
export type RunOptions = Omit<Deno.RunOptions, 'cmd'>;

/**
 * These are the tano actions that you can run through the CLI.
 */
export type TanoCliAction = 'run' | 'help' | 'version' | 'update';

/**
 * These are the tano options that you can specify either via environment variables or args.
 */
export type TanoArgs = {
  /**
   * The CLI action.
   */
  action: TanoCliAction;

  /**
   * If `true`, it will be aborted at the first error.
   */
  failFast: boolean;

  /**
   * The path to the tanofile.
   */
  file?: string;

  /**
   * If you have set `source` in a task, and this `source` indicates that no files have changed since the last `run`, this task will be skipped.
   * But if you now set `force` to true, this task will be executed anyway.
   */
  force: boolean;

  /**
   * If false, the cache mechanism is disabled.
   */
  noCache: boolean;

  /**
   * Name of the task to be executed.
   */
  task: string;
};

/**
 * These are the tano options that you can specify either via environment variables or args.
 */
export type TanoConfig = {
  /**
   * The working directory of the tanofile.
   */
  tanoCwd?: string;

  /**
   * If `true`, it will be aborted at the first error.
   */
  failFast?: boolean;

  /**
   * If you have set `source` in a task, and this `source` indicates that no files have changed since the last `run`, this task will be skipped.
   * But if you now set `force` to true, this task will be executed anyway.
   */
  force?: boolean;

  /**
   * The log file path.
   */
  logFile?: string;

  /**
   * The log level.
   */
  logLevel?: string;

  /**
   * The log output.
   */
  logOutput?: string[];

  /**
   * If true, you don't need to set `logThis` on every task.
   */
  logEverything?: boolean;

  /**
   * If false, the cache mechanism is disabled.
   */
  noCache?: boolean;

  /**
   * If `true`, the console output is quiet.
   */
  quiet?: boolean;
};

/**
 * Options for a task run.
 */
export type TaskRunOptions = {
  /**
   * If `true`, it will be aborted at the first error.
   */
  failFast?: boolean;

  /**
   * If you have set `source` in a task, and this `source` indicates that no files have changed since the last `run`, this task will be skipped.
   * But if you now set `force` to true, this task will be executed anyway.
   */
  force?: boolean;

  /**
   * If false, the cache mechanism is disabled.
   */
  noCache?: boolean;
};

/**
 * This is the parameters that is stored when a task is completed.
 *
 * @remarks
 * The path where the data will be stored is `{cwd}/.tano/cache.json`.
 */
export type TaskRunData = {
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
};

/**
 * These are the parameters that are created in the working directory each time the tasks are executed.
 *
 * @remarks
 * The path where the data will be stored is `{cwd}/.tano/cache.json`.
 */
export type TanoRunData = {
  /**
   * List of Tasks.
   */
  tasks: Record<string, TaskRunData>;
};

/**
 * These are the additional task run options (besides the `RunOptions`)
 */
export interface ITaskOptions extends Deno.CommandOptions {
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
   * Callback function to get output from the task.
   *
   * @remarks
   * Unstable! The output property will probably change again.
   */
  output?: (err: unknown, output?: unknown | string | object) => void;

  /**
   * If `true`, the output of the task will be logged.
   */
  logThis?: boolean;
}

/**
 * These are the additional task run options (besides the `RunOptions`)
 */
export type TaskOptions = ITaskOptions;

/**
 * These are the additional task run options for code tasks (besides the `TaskOptions`)
 */
export interface ICodeOptions extends TaskOptions {
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
 * These are the additional task run options for code tasks (besides the `TaskOptions`)
 */
export type CodeOptions = ICodeOptions;

/**
 * These are the additional task run options for command tasks (besides the `TaskOptions`)
 */
export interface ICommandOptions extends TaskOptions {
  /**
   * Note! Currently there are no command specific properties.
   */
  [key: string]: boolean | number | string | object | undefined;
}

/**
 * These are the additional task run options for command tasks (besides the `TaskOptions`)
 */
export type CommandOptions = ICommandOptions;

/**
 * The task parameters.
 */
export type TaskParams = {
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
};

/**
 * Defines a list of tasks that have to be executed before the parent task is executed.
 */
export type Needs = {
  /**
   * List of task names or task objects.
   */
  values: Array<string | TaskParams>;
};

/**
 * Defines a file that can be executed with Deno.
 */
export type CodeFile = {
  /**
   * If the `code` is a TypeScript/JavaScript file.
   */
  file: string | URL;
};

/**
 * A simple condition.
 *
 * @example If condition returns false, the task is skipped.
 * ```ts
 * task('myTask', `pwsh -c echo 'BEEP'`, {
 *   condition: 1 + 2 === 3
 * });
 * ```
 */
export type ConditionType1 = boolean;

/**
 * A function which returns a boolean or a promise of type boolean.
 *
 * @example If condition returns false, the task is skipped.
 * ```ts
 * task('myTask', `pwsh -c echo 'BEEP'`, {
 *   condition: () => 1 + 1 === 3
 * });
 * ```
 *
 * @example with promise
 * ```ts
 * task('myTask', `pwsh -c echo 'BEEP'`, {
 *   condition: () => Promise.resolve(1 === 1)
 * });
 * ```
 */
export type ConditionType2 = () => boolean | Promise<boolean>;

/**
 * A function with a callback function which returns a boolean.
 *
 * @example with don-callback-function
 * ```ts
 * task('myTask', `pwsh -c echo 'BEEP'`, {
 *   condition: (done) => done(1 === 1)
 * });
 * ```
 */
export type ConditionType3 = (done: (result: boolean) => void) => void;

/**
 * Type of all possible condition types.
 *
 * @example If condition returns false, the task is skipped.
 * ```ts
 * task('myTask', `pwsh -c echo 'BEEP'`, {
 *   condition: 1 + 2 === 3
 * });
 * ```
 */
export type Condition = ConditionType1 | ConditionType2 | ConditionType3;

/**
 * Defines a function which has a done-callback function.
 *
 * @example Calls a function with a done-callback function.
 * ```ts
 * task('myTask', (done) => {
 *   setTimeout(() => {
 *     done(true);
 *   }, 250);
 * });
 * ```
 */
export type CodeFunctionWithDone = (done: (err?: unknown) => void) => void;

/**
 * Defines a function that does not have a done callback function.
 *
 * @example Calls a function.
 * ```ts
 * task('myTask', () => {
 *   console.log('Hello World!');
 * });
 * ```
 */
export type CodeFunctionWithoutDone = <T>() => void | T | Promise<void | T>;

/**
 * Defines a function for execution.
 */
export type CodeFunction = CodeFunctionWithDone | CodeFunctionWithoutDone;

/**
 * Defines a function or a file for execution.
 */
export type Code = CodeFunction | CodeFile;

/**
 * Excludes selected properties.
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Defines the status of a task.
 */
export type TaskStatus = 'ready' | 'skipped' | 'running' | 'success' | 'failed';

/**
 * Defines a command for execution.
 */
export type Command = string | Array<string>;

/**
 * Defines the options for code or command.
 */
export type Options = CodeOptions | CommandOptions;

/**
 * Defines the executor.
 */
export type Executor = Command | Code | unknown;

/**
 * Defines a parameter, which can be an option object or an executor object.
 */
export type ExecutorOrOptions = Executor | Options;

/**
 * Defines a parameter, which can be an needs object or an executor object.
 */
export type NeedsOrExecutor = string | Needs | Executor;

/**
 * Variants of possible sets of parameters.
 */
export type TaskDefinition = {
  (task: Task): Task;
  (task: TaskParams): Task;
  (name: string, needs?: string): Task;
  (name: string, needs?: Needs): Task;
  (name: string, command?: Command, options?: CommandOptions): Task;
  (name: string, needs?: string, command?: Command, options?: CommandOptions): Task;
  (name: string, needs?: Needs, command?: Command, options?: CommandOptions): Task;
  (name: string, code?: Code, options?: CodeOptions): Task;
  (name: string, needs?: string, code?: Code, options?: CodeOptions): Task;
  (name: string, needs?: Needs, code?: Code, options?: CodeOptions): Task;
};

export interface TanoHandler {
  /**
   * Gets the timestamp when the handler was created.
   */
  created: Date;

  /**
   * Gets the performance mark when the last run starts.
   */
  starting: null | PerformanceMark;

  /**
   * Gets the performance mark when the last run ends.
   */
  finished: null | PerformanceMark;

  /**
   * Gets the performance measure of the last run.
   */
  measure: null | PerformanceMeasure;

  /**
   * Gets the number of tasks that are in the cache.
   */
  count: number;

  /**
   * Gets the number of executed tasks.
   */
  executed: number;

  /**
   * Managed the tano data.
   */
  changes: null | IChanges;

  /**
   * Adds a task to the cache.
   *
   * @param {Task} task - A task to add.
   */
  add(task: Task): void;

  /**
   * Runs the Task.
   * In the process, all dependent tasks `needs` are executed beforehand.
   *
   * @param {String} taskName - [optionalParam='default'] Name of the task.
   * @param {TaskRunOptions} options - [optionalParam={ failFast: true, force: false, noCache: false }]
   *
   * @returns {Promise<void>} - A promise that resolves to void.
   */
  run(taskName?: string, options?: TaskRunOptions): Promise<void>;

  /**
   * Resets all tasks so that you can run them again.
   */
  reset(): void;

  /**
   * Clears the cache. The handler will then have no more tasks to execute.
   */
  clear(): void;

  /**
   * Gets a list of all tasks to be executed in the correct order.
   *
   * @param {string} taskName - Name of the entry task.
   *
   * @returns {Array<string>} - List of the names of all executed tasks
   */
  getPlan(taskName: string): Array<string>;

  /**
   * Disposes the handler.
   */
  dispose(): void;

  /**
   * Adds an event listener for the `changed` event.
   * The event is triggered when a task changes its state.
   * The event detail contains the task name and the new state.
   *
   * @param fn - The event listener to add.
   */
  onChanged(fn: EventListenerOrEventListenerObject): void;

  /**
   * Removes an event listener for the `changed` event.
   *
   * @param fn - The event listener to remove.
   */
  offChanged(fn: EventListenerOrEventListenerObject): void;

  /**
   * Hack: Updates the logger of this handler.
   */
  updateLogger(): void;
}
