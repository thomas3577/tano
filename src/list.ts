// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module provides the output for the CLI options that query a tanofile instead of running it.
 *
 * @remarks
 * These outputs are the requested result of the command itself, like `--help` and `--version`, and are therefore written to the console and not through the logger.
 *
 * @module
 */

import { basename } from '@std/path';
import type { Task } from './task.ts';

/**
 * Prints all tasks of a tanofile, sorted by name, with their description if they have one.
 *
 * @param {Array<Task>} tasks - The tasks to print.
 * @param {string} file - Path or URL of the tanofile the tasks came from.
 */
export const listTasks = (tasks: Array<Task>, file: string): void => {
  const names: Array<string> = tasks.map((task) => task.name).sort((a, b) => a.localeCompare(b));
  const width: number = Math.max(...names.map((name) => name.length), 0);
  const descriptions: Map<string, undefined | string> = new Map(tasks.map((task) => [task.name, task.options?.description]));

  console.log(`\nTasks in ${basename(file)}:\n`);

  for (const name of names) {
    const description: undefined | string = descriptions.get(name);

    console.log(`  ${description ? name.padEnd(width + 3) + description : name}`);
  }

  console.log('');
};

/**
 * Prints the tasks that would be executed, in the order in which they would run.
 *
 * @param {string} taskName - Name of the entry task.
 * @param {Array<string>} taskNames - Names of all tasks of the plan, in execution order.
 */
export const listPlan = (taskName: string, taskNames: Array<string>): void => {
  const width: number = String(taskNames.length).length;

  console.log(`\nPlan for '${taskName}':\n`);

  taskNames.forEach((name, index) => {
    const position: string = String(index + 1).padStart(width);

    console.log(`  ${position}. ${name}`);
  });

  console.log('');
};
