// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module runs something again whenever a watched file changes.
 *
 * @module
 */

import { debounce } from '@std/async/debounce';
import { skipped, toRegExp } from './glob.ts';

/**
 * Runs `run` once and then again whenever a file below `root` changes.
 *
 * @remarks
 * The whole root is watched, because a glob can only say which paths are interesting, not which directories the file system has to report. A change is therefore filtered rather than narrowing what is watched.
 *
 * A file system reports several events per single write, so the trigger is debounced. Runs never overlap: a change that arrives while a run is in progress is collapsed into one further run afterwards, because a task cannot be executed twice at the same time.
 *
 * @param {string} root - The directory to watch.
 * @param {string} glob - [optionalParam=undefined] Only report changes matching this glob.
 * @param {AbortSignal} signal - Stops watching when aborted.
 * @param {Function} run - Called for the first run and after every relevant change.
 *
 * @returns {Promise<void>} Resolves once watching has stopped.
 */
export const watch = async (root: string, glob: undefined | string, signal: AbortSignal, run: () => Promise<void>): Promise<void> => {
  const matcher: undefined | RegExp = glob === undefined ? undefined : toRegExp(glob, root);
  const watcher: Deno.FsWatcher = Deno.watchFs(root);

  let running: boolean = false;
  let again: boolean = false;

  const runOnce = async (): Promise<void> => {
    if (running) {
      again = true;

      return;
    }

    running = true;

    try {
      await run();
    } finally {
      running = false;
    }

    if (again) {
      again = false;

      await runOnce();
    }
  };

  const trigger = debounce(() => void runOnce(), 120);
  const stop = (): void => watcher.close();

  signal.addEventListener('abort', stop, { once: true });

  try {
    await runOnce();

    for await (const event of watcher) {
      const relevant: boolean = event.paths.some((path) => !skipped.some((expression) => expression.test(path)) && (matcher === undefined || matcher.test(path)));

      if (relevant) {
        trigger();
      }
    }
  } finally {
    trigger.clear();

    signal.removeEventListener('abort', stop);
  }
};
