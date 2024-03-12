/**
 * The task function to create new tasks.
 *
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
 * Types
 */
export type { Code, CodeFile, CodeFunction, CodeOptions, Command, CommandOptions, Condition, GlobHashSource, Needs, TaskParams, TaskStatus } from './src/types.ts';
