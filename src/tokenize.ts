// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

/**
 * This module contains a function to split a string command into arguments.
 *
 * @module
 */

/**
 * Characters that only mean something to a shell. Tano spawns the process directly, so they would silently end up as literal arguments.
 */
const SHELL_OPERATORS: RegExp = /[&|;<>`]/;

/**
 * Creates the error for an unquoted shell operator.
 *
 * @param {string} operator - The operator that was found.
 * @param {string} command - The command it was found in.
 *
 * @returns {Error} The error to throw.
 */
const operatorError = (operator: string, command: string): Error => new Error(`Unquoted shell operator '${operator}' in command '${command}'. Tano runs commands without a shell. Use 'needs' to chain tasks, a code task instead of a pipe, quotes to pass it as a literal argument, or an array of arguments.`);

/**
 * Splits a string command into its arguments.
 *
 * @remarks
 * Single and double quotes group their content into one argument and are removed. There are no escape sequences: a backslash is an ordinary character, so Windows paths can be written as they are. To use a quote inside an argument, pass the command as an array of arguments instead.
 *
 * @example Quotes group their content.
 * ```ts
 * const result = tokenize(`pwsh -c "echo 'Hello World!'"`); // ['pwsh', '-c', `echo 'Hello World!'`]
 * ```
 *
 * @param {string} command - The command to split.
 *
 * @returns {Array<string>} The arguments of the command.
 */
export const tokenize = (command: string): Array<string> => {
  const args: Array<string> = [];

  let current: string = '';
  let started: boolean = false;
  let quote: string = '';

  for (let index = 0; index < command.length; index++) {
    const char: string = command[index];

    if (quote) {
      if (char === quote) {
        quote = '';
      } else {
        current += char;
      }

      continue;
    }

    if (char === `'` || char === `"`) {
      quote = char;
      started = true;

      continue;
    }

    if (/\s/.test(char)) {
      if (started) {
        args.push(current);
        current = '';
        started = false;
      }

      continue;
    }

    if (char === '$' && command[index + 1] === '(') {
      throw operatorError('$(', command);
    }

    if (SHELL_OPERATORS.test(char)) {
      throw operatorError(char, command);
    }

    current += char;
    started = true;
  }

  if (quote) {
    throw new Error(`Unterminated ${quote === `'` ? 'single' : 'double'} quote in command '${command}'.`);
  }

  if (started) {
    args.push(current);
  }

  return args;
};
