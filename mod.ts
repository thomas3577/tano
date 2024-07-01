/**
 * The task function to create new tasks.
 *
 * @example Creates a default task which requires another task.
 * ```ts
 * import { needs, task } from 'jsr:@dx/tano';
 *
 * task('pre-task', `echo 'These were ...'`);
 * task('default', needs('pre-task'), `echo '...two tasks.'`).run();
 * ```
 */
export { task } from './src/task.factory.ts';

/**
 * Just a wrapper to hold the `needs`. A function to define an ordered series of tasks that must be listed before the current task.
 */
export { needs } from './src/needs.ts';

/**
 * An initial instance of the handler to run the tasks.
 *
 * @example Runs the task handler.
 * ```ts
 * import { handler } from 'jsr:@dx/tano';
 *
 * handler();
 * ```
 */
export { handler } from './src/handler.ts';

/**
 * The Task class.
 *
 * @example Creates a new task and runs it.
 * ```ts
 * import { Task } from '../src/task.ts';
 *
 * const task = new Task('my-task', null, () => console.log('Hello World!'));
 *
 * await task.runThis();
 * ```
 */
export { Task } from './src/task.ts';

/**
 * An instance of a LogStream.
 */
export { logger, logStream } from './src/logger.ts';

/**
 * Possibility to setup the tano configuration.
 *
 * Just add to your tanofile.ts
 */
export { setup } from './src/tano.config.ts';

/**
 * Types
 */
export type { Code, CodeFile, CodeFunction, CodeOptions, Command, CommandOptions, Condition, GlobHashSource, LogHandler, LogStream, Needs, TanoConfig, TaskParams, TaskStatus } from './src/types.ts';
