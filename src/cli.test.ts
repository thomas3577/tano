// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertStringIncludes } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { fromFileUrl, join } from '@std/path';

const cliPath: string = fromFileUrl(import.meta.resolve('../cli.ts'));
const modUrl: string = import.meta.resolve('../mod.ts');
const dirs: string[] = [];
const tanofileWithTwoFailingTasks: string = `
task('a', ['deno', 'eval', 'Deno.exit(1)']);
task('b', ['deno', 'eval', 'console.log("B_RAN")']);
task('c', ['deno', 'eval', 'Deno.exit(1)']);
task('all', needs('a', 'b', 'c'));
`;

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

  it(`Should exit with 1 if the task does not exist.`, async () => {
    const actual = await runCli(`task('ok', ['deno', 'eval', 'console.log("TASK_OK")']);`, ['nope']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, `A task with the name 'nope' does not exist.`);
  });

  it(`Should exit with 1 and run nothing if a needed task does not exist.`, async () => {
    const actual = await runCli(`task('ok', needs('nope'), ['deno', 'eval', 'console.log("TASK_OK")']);`, ['ok']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, `A task with the name 'nope' does not exist.`);
    assertEquals(actual.stdout.includes('TASK_OK'), false);
  });

  it(`Should run the remaining tasks and list all failed ones if fail-fast is off.`, async () => {
    const actual = await runCli(tanofileWithTwoFailingTasks, ['all', '--fail-fast=false']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, 'B_RAN');
    assertStringIncludes(actual.stdout, 'Failed tasks: a, c');
  });

  it(`Should treat --no-fail-fast like --fail-fast=false.`, async () => {
    const actual = await runCli(tanofileWithTwoFailingTasks, ['all', '--no-fail-fast']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, 'B_RAN');
    assertStringIncludes(actual.stdout, 'Failed tasks: a, c');
  });

  it(`Should list all tasks sorted by name and run nothing.`, async () => {
    const tanofile = `
task('build', ['deno', 'eval', 'console.log("BUILD_RAN")'], { description: 'Builds the thing' });
task('audit', ['deno', 'eval', '1']);
task('default', needs('audit', 'build'));
`;
    const actual = await runCli(tanofile, ['--list']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, '  audit\n  build     Builds the thing\n  default\n');
    assertEquals(actual.stdout.includes('BUILD_RAN'), false);
    assertEquals(actual.stdout.includes('Starting...'), false);
  });

  it(`Should print the execution plan and run nothing on --dry-run.`, async () => {
    const tanofile = `
task('audit', ['deno', 'eval', 'console.log("AUDIT_RAN")']);
task('build', needs('audit'), ['deno', 'eval', 'console.log("BUILD_RAN")']);
task('default', needs('build'));
`;
    const actual = await runCli(tanofile, ['--dry-run']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, `Plan for 'default':`);
    assertStringIncludes(actual.stdout, '  1. audit\n  2. build\n  3. default\n');
    assertEquals(actual.stdout.includes('AUDIT_RAN'), false);
    assertEquals(actual.stdout.includes('BUILD_RAN'), false);
  });

  it(`Should exit with 1 on --dry-run if the task does not exist.`, async () => {
    const actual = await runCli(`task('ok', ['deno', 'eval', '1']);`, ['nope', '--dry-run']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, `A task with the name 'nope' does not exist.`);
  });
});
