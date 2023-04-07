import type { Needs, TaskParams } from './types.ts';

/**
 * Just a wrapper to hold the `needs`.
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
