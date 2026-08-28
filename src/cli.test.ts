// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertStringIncludes } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { stripAnsiCode } from '@std/fmt/colors';
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

const tanofileWithTwoTimedTasks: string = `
const code = 'const started = Date.now(); await new Promise((resolve) => setTimeout(resolve, 300)); await Deno.writeTextFile(Deno.args[0], started + " " + Date.now());';

task('a', ['deno', 'eval', code, import.meta.dirname + '/a.txt']);
task('b', ['deno', 'eval', code, import.meta.dirname + '/b.txt']);
task('all', needs('a', 'b'));
`;

/**
 * Reads the two intervals the timed tasks wrote and reports whether they overlap.
 *
 * @remarks
 * Overlapping intervals mean the tasks ran at the same time. Each task sleeps far longer than a process takes to start, so the answer does not depend on timing luck.
 *
 * @param {string} dir - The directory the tanofile was written to.
 *
 * @returns {Promise<boolean>} if `true` the two tasks overlapped in time.
 */
const overlaps = async (dir: string): Promise<boolean> => {
  const read = async (name: string): Promise<Array<number>> => (await Deno.readTextFile(join(dir, name))).split(' ').map(Number);
  const [aStarted, aEnded] = await read('a.txt');
  const [bStarted, bEnded] = await read('b.txt');

  return aStarted < bEnded && bStarted < aEnded;
};

/**
 * Exit code and output of a tano CLI run.
 */
type TCliResult = {
  /**
   * The exit code of the CLI process.
   */
  code: number;

  /**
   * The temporary directory the tanofile was written to.
   */
  dir: string;

  /**
   * Everything the CLI process wrote to stdout, without escape codes.
   */
  stdout: string;

  /**
   * Everything the CLI process wrote to stderr, without escape codes.
   */
  stderr: string;
};

/**
 * Runs the tano CLI in a child process against a temporary tanofile.
 *
 * @param {string} tanofile - The body of the tanofile. `needs` and `task` are already imported.
 * @param {Array<string>} args - Additional CLI args.
 * @param {boolean} useCache - [optionalParam=false] If `true`, the run is not started with `--no-cache`.
 *
 * @returns {Promise<TCliResult>} Exit code and output of the run.
 */
const runCli = async (tanofile: string, args: string[] = [], useCache: boolean = false): Promise<TCliResult> => {
  const dir: string = await Deno.makeTempDir({ prefix: 'tano-cli-test-' });
  dirs.push(dir);

  const file: string = join(dir, 'tanofile.ts');
  await Deno.writeTextFile(file, `import { needs, setup, task } from '${modUrl}';\n${tanofile}\n`);

  const command: Deno.Command = new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-run', '-RWE', cliPath, ...(useCache ? [] : ['--no-cache']), '--file', file, ...args],
  });

  const output: Deno.CommandOutput = await command.output();
  const decoder: TextDecoder = new TextDecoder();

  return {
    code: output.code,
    dir,
    stdout: stripAnsiCode(decoder.decode(output.stdout)),
    stderr: stripAnsiCode(decoder.decode(output.stderr)),
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
    assertStringIncludes(actual.stderr, 'Aborted with errors.');
  });

  it(`Should exit with 1 if the tanofile can not be loaded.`, async () => {
    const actual = await runCli(`task('ok', <<< this is not typescript >>>);`, ['ok']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stderr, 'Failed to load tanofile');
  });

  it(`Should exit with 1 if the task does not exist.`, async () => {
    const actual = await runCli(`task('ok', ['deno', 'eval', 'console.log("TASK_OK")']);`, ['nope']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stderr, `A task with the name 'nope' does not exist.`);
  });

  it(`Should exit with 1 and run nothing if a needed task does not exist.`, async () => {
    const actual = await runCli(`task('ok', needs('nope'), ['deno', 'eval', 'console.log("TASK_OK")']);`, ['ok']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stderr, `A task with the name 'nope' does not exist.`);
    assertEquals(actual.stdout.includes('TASK_OK'), false);
  });

  it(`Should run the remaining tasks and list all failed ones if fail-fast is off.`, async () => {
    const actual = await runCli(tanofileWithTwoFailingTasks, ['all', '--fail-fast=false']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, 'B_RAN');
    assertStringIncludes(actual.stderr, 'Failed tasks: a, c');
  });

  it(`Should treat --no-fail-fast like --fail-fast=false.`, async () => {
    const actual = await runCli(tanofileWithTwoFailingTasks, ['all', '--no-fail-fast']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, 'B_RAN');
    assertStringIncludes(actual.stderr, 'Failed tasks: a, c');
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

  it(`Should apply a log level that the tanofile sets after its tasks.`, async () => {
    const tanofile = `
task('t', ['deno', 'eval', 'console.log("TASK_OUT")']);
setup({ logLevel: 'ERROR' });
`;
    const actual = await runCli(tanofile, ['t']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'TASK_OUT');
    assertEquals(actual.stdout.includes(`Starting 't'`), false);
    assertEquals(actual.stdout.includes('Finished after'), false);
  });

  it(`Should not leak tano configuration into the environment of a task.`, async () => {
    const keys = `["QUIET","FORCE","NO_CACHE","FAIL_FAST","LOG_LEVEL","LOG_OUTPUT","LOG_FILE","LOG_EVERYTHING","TANO_CWD"]`;
    const actual = await runCli(`task('env', ['deno', 'eval', 'console.log("LEAKED=" + ${keys}.filter((key) => Deno.env.get(key) !== undefined).join(","))']);`, ['env']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'LEAKED=\n');
  });

  it(`Should pass a quoted argument to a non-shell process as one argument.`, async () => {
    const actual = await runCli(`task('quoted', \`deno eval 'console.log("ARGS=" + JSON.stringify(Deno.args))' one 'two three'\`);`, ['quoted']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'ARGS=["one","two three"]');
  });

  it(`Should exit with 1 on --dry-run if the task does not exist.`, async () => {
    const actual = await runCli(`task('ok', ['deno', 'eval', '1']);`, ['nope', '--dry-run']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stderr, `A task with the name 'nope' does not exist.`);
  });

  it(`Should let a CLI flag win over setup() in the tanofile.`, async () => {
    const tanofile = `
setup({ logLevel: 'ERROR' });
task('t', ['deno', 'eval', 'console.log("OUT")']);
`;
    const actual = await runCli(tanofile, ['t', '-l', 'DEBUG']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, `Starting 't'`);
  });

  it(`Should apply failFast from setup() in the tanofile.`, async () => {
    const actual = await runCli(`setup({ failFast: false });${tanofileWithTwoFailingTasks}`, ['all']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stdout, 'B_RAN');
    assertStringIncludes(actual.stderr, 'Failed tasks: a, c');
  });

  it(`Should let --fail-fast win over failFast from setup().`, async () => {
    const actual = await runCli(`setup({ failFast: false });${tanofileWithTwoFailingTasks}`, ['all', '--fail-fast']);

    assertEquals(actual.code, 1);
    assertEquals(actual.stdout.includes('B_RAN'), false);
  });

  it(`Should keep the diagnostics out of stdout when a task fails.`, async () => {
    const actual = await runCli(`task('boom', ['deno', 'eval', 'Deno.exit(3)']);`, ['boom']);

    assertEquals(actual.code, 1);
    assertEquals(actual.stdout.includes('Aborted with errors.'), false);
    assertStringIncludes(actual.stderr, 'Command failed with exit code 3');
  });

  it(`Should write a readable json cache without needing an unstable flag.`, async () => {
    const actual = await runCli(`task('t', ['deno', 'eval', '1']);`, ['t'], true);

    assertEquals(actual.code, 0);

    const content: string = await Deno.readTextFile(join(actual.dir, '.tano', 'cache.json'));

    assertEquals(Object.keys(JSON.parse(content).tasks), ['t']);
    assertStringIncludes(content, `"lastStatus": "success"`);
  });

  it(`Should record a failed task in the cache.`, async () => {
    const actual = await runCli(`task('boom', ['deno', 'eval', 'Deno.exit(1)']);`, ['boom'], true);

    assertEquals(actual.code, 1);

    const content: string = await Deno.readTextFile(join(actual.dir, '.tano', 'cache.json'));

    assertEquals(JSON.parse(content).tasks.boom.lastStatus, 'failed');
  });

  it(`Should run independent tasks at the same time with --concurrency.`, async () => {
    const actual = await runCli(tanofileWithTwoTimedTasks, ['all', '--concurrency', '2']);

    assertEquals(actual.code, 0);
    assertEquals(await overlaps(actual.dir), true);
  });

  it(`Should run one task after the other by default.`, async () => {
    const actual = await runCli(tanofileWithTwoTimedTasks, ['all']);

    assertEquals(actual.code, 0);
    assertEquals(await overlaps(actual.dir), false);
  });

  it(`Should prefix the output with the task name when running in parallel.`, async () => {
    const tanofile = `
task('a', ['deno', 'eval', 'console.log("from-a")']);
task('b', ['deno', 'eval', 'console.log("from-b")']);
task('all', needs('a', 'b'));
`;
    const actual = await runCli(tanofile, ['all', '--concurrency', '2']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'a | from-a');
    assertStringIncludes(actual.stdout, 'b | from-b');
  });

  it(`Should leave the output unprefixed when running one task at a time.`, async () => {
    const actual = await runCli(`task('a', ['deno', 'eval', 'console.log("from-a")']);`, ['a']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'from-a');
    assertEquals(actual.stdout.includes('a | from-a'), false);
  });

  it(`Should keep a long line whole for the logger even when it arrives in pieces.`, async () => {
    const code = `const out = 'X'.repeat(200000); console.log('head-' + out + '-tail');`;
    const actual = await runCli(`task('big', ['deno', 'eval', ${JSON.stringify(code)}], { logThis: true });`, ['big']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, `head-${'X'.repeat(200000)}-tail`);
  });

  it(`Should report a bad --concurrency value without a stack trace.`, async () => {
    const actual = await runCli(`task('t', ['deno', 'eval', '1']);`, ['t', '--concurrency', 'abc']);

    assertEquals(actual.code, 1);
    assertStringIncludes(actual.stderr, `'--concurrency' must be a positive integer, got 'abc'.`);
    assertEquals(actual.stderr.includes('Uncaught'), false);
  });

  it(`Should print the help even when quiet.`, async () => {
    const actual = await runCli(`task('t', ['deno', 'eval', '1']);`, ['--help', '-q']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'USAGE:');
  });

  it(`Should silence its own diagnostics but not a code task when quiet.`, async () => {
    const actual = await runCli(`task('t', () => console.log('CODE_OUT'));`, ['t', '-q']);

    assertEquals(actual.code, 0);
    assertStringIncludes(actual.stdout, 'CODE_OUT');
    assertEquals(actual.stdout.includes(`Starting 't'`), false);
  });
});
