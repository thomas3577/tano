// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module holds the abort signal of the current run.
 *
 * @remarks
 * Kept here instead of being threaded through `run`, `runThis` and the runners, which would change four signatures for one value that belongs to the run as a whole.
 *
 * @module
 */

let controller: AbortController = new AbortController();

/**
 * Gets the signal of the current run.
 *
 * @remarks
 * Every spawned task is wired to it, so aborting it stops all of them.
 *
 * @returns {AbortSignal} The signal of the current run.
 */
export const runSignal = (): AbortSignal => controller.signal;

/**
 * Aborts the current run, which stops every task that is running.
 */
export const abortRun = (): void => controller.abort();

/**
 * Starts a new run, so that a previous abort does not stop it right away.
 */
export const resetRun = (): void => {
  controller = new AbortController();
};
