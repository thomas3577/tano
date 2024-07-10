/**
 * The Module container only the needs helper function.
 *
 * @module
 */

import type { Needs, TaskParams } from './types.ts';

/**
 * Just a wrapper to hold the `needs`. A function to define an ordered series of tasks that must be listed before the current task.
 *
 * @param {...Array<string | TaskParams>} values - Task names and Tasks.
 *
 * @remarks
 * The order of the specified task names and tasks is taken into account.
 *
 * @returns {Object} All `needs` as a Object.
 */
export const needs = (...values: Array<string | TaskParams>): Needs => ({
  values,
});
