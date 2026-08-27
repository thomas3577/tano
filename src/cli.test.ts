// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertStringIncludes } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { fromFileUrl, join } from '@std/path';

const cliPath: string = fromFileUrl(import.meta.resolve('../cli.ts'));
const modUrl: string = import.meta.resolve('../mod.ts');
const dirs: string[] = [];

/**
 * Exit code and output of a tano CLI run.
 */
type TCliResult = {
  /**
   * The exit code of the CLI process.
   */
  code: number;

  /**
   * Everything the CLI process wrote to stdout. Note that the logger writes all levels to stdout, errors included.
   */
  stdout: string;

  /**
   * Everything the CLI process wrote to stderr.
   */
  stderr: string;
};

/**
 * Runs the tano CLI in a child process against a temporary tanofile.
 *
 * @param {string} tanofile - The body of the tanofile. `needs` and `task` are already imported.
 * @param {Array<string>} args - Additional CLI args.
 *
 * @returns {Promise<TCliResult>} Exit code and output of the run.
 */
const runCli = async (tanofile: string, args: string[] = []): Promise<TCliResult> => {
  const dir: string = await Deno.makeTempDir({ prefix: 'tano-cli-test-' });
  dirs.push(dir);

  const file: string = join(dir, 'tanofile.ts');
  await Deno.writeTextFile(file, `import { needs, task } from '${modUrl}';\n${tanofile}\n`);

  const command: Deno.Command = new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-run', '-RWE', '--unstable-kv', cliPath, '--no-cache', '--file', file, ...args],
  });

  const output: Deno.CommandOutput = await command.output();
  const decoder: TextDecoder = new TextDecoder();

  return {
    code: output.code,
    stdout: decoder.decode(output.stdout),
    stderr: decoder.decode(output.stderr),
  };
};

afterEach(async () => {
  while (dirs.length > 0) {
    const dir = dirs.pop() as string;
    await Deno.remove(dir, { recursive: true });
  }
});

describe('cli', () => {
  it(`Should exit with 0 if the task succeeds.`, async () => {
    const actual = await runCli(`task('ok', ['deno', 'eval', 'console.log("TASK_OK")']);`, ['ok']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'TASK_OK');
  });

  it(`Should exit with 1 if the task fails.`, async () => {
    const actual = await runCli(`task('boom', ['deno', 'eval', 'Deno.exit(3)']);`, ['boom']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, 'Aborted with errors.');
  });

  it(`Should exit with 1 if the tanofile can not be loaded.`, async () => {
    const actual = await runCli(`task('ok', <<< this is not typescript >>>);`, ['ok']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, 'Failed to load tanofile');
  });
});
