// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertStringIncludes } from '@std/assert';
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

Deno.test.afterEach(async () => {
  while (dirs.length > 0) {
    const dir = dirs.pop() as string;
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test(`cli > Should exit with 0 if the task succeeds.`, async () => {
  const actual = await runCli(`task('ok', ['deno', 'eval', 'console.log("TASK_OK")']);`, ['ok']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, 'TASK_OK');
});

Deno.test(`cli > Should exit with 1 if the task fails.`, async () => {
  const actual = await runCli(`task('boom', ['deno', 'eval', 'Deno.exit(3)']);`, ['boom']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, 'Aborted with errors.');
});

Deno.test(`cli > Should exit with 1 if the tanofile can not be loaded.`, async () => {
  const actual = await runCli(`task('ok', <<< this is not typescript >>>);`, ['ok']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, 'Failed to load tanofile');
});

Deno.test(`cli > Should exit with 1 if the task does not exist.`, async () => {
  const actual = await runCli(`task('ok', ['deno', 'eval', 'console.log("TASK_OK")']);`, ['nope']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, `A task with the name 'nope' does not exist.`);
});

Deno.test(`cli > Should exit with 1 and run nothing if a needed task does not exist.`, async () => {
  const actual = await runCli(`task('ok', needs('nope'), ['deno', 'eval', 'console.log("TASK_OK")']);`, ['ok']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, `A task with the name 'nope' does not exist.`);
  assertEquals(actual.stdout.includes('TASK_OK'), false);
});

Deno.test(`cli > Should run the remaining tasks and list all failed ones if fail-fast is off.`, async () => {
  const actual = await runCli(tanofileWithTwoFailingTasks, ['all', '--fail-fast=false']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stdout, 'B_RAN');
  assertStringIncludes(actual.stderr, 'Failed tasks: a, c');
});

Deno.test(`cli > Should treat --no-fail-fast like --fail-fast=false.`, async () => {
  const actual = await runCli(tanofileWithTwoFailingTasks, ['all', '--no-fail-fast']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stdout, 'B_RAN');
  assertStringIncludes(actual.stderr, 'Failed tasks: a, c');
});

Deno.test(`cli > Should list all tasks sorted by name and run nothing.`, async () => {
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

Deno.test(`cli > Should print the execution plan and run nothing on --dry-run.`, async () => {
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

Deno.test(`cli > Should apply a log level that the tanofile sets after its tasks.`, async () => {
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

Deno.test(`cli > Should not leak tano configuration into the environment of a task.`, async () => {
  const keys = `["QUIET","FORCE","NO_CACHE","FAIL_FAST","LOG_LEVEL","LOG_OUTPUT","LOG_FILE","LOG_EVERYTHING","TANO_CWD"]`;
  const actual = await runCli(`task('env', ['deno', 'eval', 'console.log("LEAKED=" + ${keys}.filter((key) => Deno.env.get(key) !== undefined).join(","))']);`, ['env']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, 'LEAKED=\n');
});

Deno.test(`cli > Should pass a quoted argument to a non-shell process as one argument.`, async () => {
  const actual = await runCli(`task('quoted', \`deno eval 'console.log("ARGS=" + JSON.stringify(Deno.args))' one 'two three'\`);`, ['quoted']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, 'ARGS=["one","two three"]');
});

Deno.test(`cli > Should exit with 1 on --dry-run if the task does not exist.`, async () => {
  const actual = await runCli(`task('ok', ['deno', 'eval', '1']);`, ['nope', '--dry-run']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, `A task with the name 'nope' does not exist.`);
});

Deno.test(`cli > Should let a CLI flag win over setup() in the tanofile.`, async () => {
  const tanofile = `
setup({ logLevel: 'ERROR' });
task('t', ['deno', 'eval', 'console.log("OUT")']);
`;
  const actual = await runCli(tanofile, ['t', '-l', 'DEBUG']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, `Starting 't'`);
});

Deno.test(`cli > Should apply failFast from setup() in the tanofile.`, async () => {
  const actual = await runCli(`setup({ failFast: false });${tanofileWithTwoFailingTasks}`, ['all']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stdout, 'B_RAN');
  assertStringIncludes(actual.stderr, 'Failed tasks: a, c');
});

Deno.test(`cli > Should let --fail-fast win over failFast from setup().`, async () => {
  const actual = await runCli(`setup({ failFast: false });${tanofileWithTwoFailingTasks}`, ['all', '--fail-fast']);

  assertEquals(actual.code, 1);
  assertEquals(actual.stdout.includes('B_RAN'), false);
});

Deno.test(`cli > Should keep the diagnostics out of stdout when a task fails.`, async () => {
  const actual = await runCli(`task('boom', ['deno', 'eval', 'Deno.exit(3)']);`, ['boom']);

  assertEquals(actual.code, 1);
  assertEquals(actual.stdout.includes('Aborted with errors.'), false);
  assertStringIncludes(actual.stderr, 'Command failed with exit code 3');
});

Deno.test(`cli > Should write a readable json cache without needing an unstable flag.`, async () => {
  const actual = await runCli(`task('t', ['deno', 'eval', '1']);`, ['t'], true);

  assertEquals(actual.code, 0);

  const content: string = await Deno.readTextFile(join(actual.dir, '.tano', 'cache.json'));

  assertEquals(Object.keys(JSON.parse(content).tasks), ['t']);
  assertStringIncludes(content, `"lastStatus": "success"`);
});

Deno.test(`cli > Should record a failed task in the cache.`, async () => {
  const actual = await runCli(`task('boom', ['deno', 'eval', 'Deno.exit(1)']);`, ['boom'], true);

  assertEquals(actual.code, 1);

  const content: string = await Deno.readTextFile(join(actual.dir, '.tano', 'cache.json'));

  assertEquals(JSON.parse(content).tasks.boom.lastStatus, 'failed');
});

Deno.test(`cli > Should run independent tasks at the same time with --concurrency.`, async () => {
  const actual = await runCli(tanofileWithTwoTimedTasks, ['all', '--concurrency', '2']);

  assertEquals(actual.code, 0);
  assertEquals(await overlaps(actual.dir), true);
});

Deno.test(`cli > Should run one task after the other by default.`, async () => {
  const actual = await runCli(tanofileWithTwoTimedTasks, ['all']);

  assertEquals(actual.code, 0);
  assertEquals(await overlaps(actual.dir), false);
});

Deno.test(`cli > Should prefix the output with the task name when running in parallel.`, async () => {
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

Deno.test(`cli > Should leave the output unprefixed when running one task at a time.`, async () => {
  const actual = await runCli(`task('a', ['deno', 'eval', 'console.log("from-a")']);`, ['a']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, 'from-a');
  assertEquals(actual.stdout.includes('a | from-a'), false);
});

Deno.test(`cli > Should keep a long line whole for the logger even when it arrives in pieces.`, async () => {
  const code = `const out = 'X'.repeat(200000); console.log('head-' + out + '-tail');`;
  const actual = await runCli(`task('big', ['deno', 'eval', ${JSON.stringify(code)}], { logThis: true });`, ['big']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, `head-${'X'.repeat(200000)}-tail`);
});

Deno.test(`cli > Should report a bad --concurrency value without a stack trace.`, async () => {
  const actual = await runCli(`task('t', ['deno', 'eval', '1']);`, ['t', '--concurrency', 'abc']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, `'--concurrency' must be a positive integer, got 'abc'.`);
  assertEquals(actual.stderr.includes('Uncaught'), false);
});

Deno.test(`cli > Should stop a task that runs into its timeout.`, async () => {
  const slow = `['deno', 'eval', 'await new Promise((resolve) => setTimeout(resolve, 3000)); console.log("SLOW_DONE")']`;
  const actual = await runCli(`task('slow', ${slow}, { timeout: 300 });`, ['slow']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, 'Timed out after 300ms');
  assertEquals(actual.stdout.includes('SLOW_DONE'), false);
});

Deno.test(`cli > Should fail a code task at its timeout, even though the function cannot be stopped.`, async () => {
  const actual = await runCli(`task('slow', async () => { await new Promise((resolve) => setTimeout(resolve, 1500)); }, { timeout: 300 });`, ['slow']);

  assertEquals(actual.code, 1);
  assertStringIncludes(actual.stderr, 'Timed out after 300ms.');
});

Deno.test(`cli > Should stop a task when the signal from its options is aborted.`, async () => {
  const tanofile = `
const controller = new AbortController();

setTimeout(() => controller.abort(), 200);

task('slow', ['deno', 'eval', 'await new Promise((resolve) => setTimeout(resolve, 3000)); console.log("SLOW_DONE")'], { signal: controller.signal });
`;
  const actual = await runCli(tanofile, ['slow']);

  assertEquals(actual.code, 1);
  assertEquals(actual.stdout.includes('SLOW_DONE'), false);
});

// Windows has no real signals: Deno.kill terminates the process instead of delivering SIGINT, so the handler could never run. A real Ctrl+C in a console does reach it.
const testWithSignals = Deno.build.os === 'windows' ? Deno.test.ignore : Deno.test;

testWithSignals(`cli > Should stop the tasks and exit with 130 on SIGINT.`, async () => {
  const dir: string = await Deno.makeTempDir({ prefix: 'tano-cli-test-' });
  dirs.push(dir);

  const file: string = join(dir, 'tanofile.ts');
  await Deno.writeTextFile(file, `import { task } from '${modUrl}';\ntask('slow', ['deno', 'eval', 'await new Promise((resolve) => setTimeout(resolve, 8000)); console.log("SLOW_DONE")']);\n`);

  const child: Deno.ChildProcess = new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-run', '-RWE', cliPath, '--no-cache', '--file', file, 'slow'],
    stdout: 'piped',
    stderr: 'piped',
  }).spawn();

  // Long enough for deno to start and the task to be spawned, far short of the eight seconds the task sleeps.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  Deno.kill(child.pid, 'SIGINT');

  const output: Deno.CommandOutput = await child.output();
  const decoder: TextDecoder = new TextDecoder();

  assertEquals(output.code, 130);
  assertEquals(stripAnsiCode(decoder.decode(output.stdout)).includes('SLOW_DONE'), false);
});

Deno.test(`cli > Should run again when a watched file changes.`, async () => {
  const dir: string = await Deno.makeTempDir({ prefix: 'tano-cli-test-' });
  dirs.push(dir);

  const marker: string = join(dir, 'runs.txt');
  const watched: string = join(dir, 'watched.txt');

  await Deno.writeTextFile(watched, 'one');
  await Deno.writeTextFile(
    join(dir, 'tanofile.ts'),
    [
      `import { task } from '${modUrl}';`,
      `task('mark', ['deno', 'eval', 'await Deno.writeTextFile(Deno.args[0], "x", { append: true })', ${JSON.stringify(marker)}]);`,
    ].join('\n'),
  );

  const child: Deno.ChildProcess = new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-run', '-RWE', cliPath, '--no-cache', '--file', join(dir, 'tanofile.ts'), 'mark', '--watch'],
    stdout: 'null',
    stderr: 'null',
  }).spawn();

  const runs = async (): Promise<number> => (await Deno.readTextFile(marker).catch(() => '')).length;
  const until = async (count: number): Promise<boolean> => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await runs() >= count) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
  };

  const ranOnce: boolean = await until(1);

  await Deno.writeTextFile(watched, 'two');

  const ranTwice: boolean = await until(2);

  child.kill();
  await child.status;

  assertEquals(ranOnce, true);
  assertEquals(ranTwice, true);
});

Deno.test(`cli > Should print the help even when quiet.`, async () => {
  const actual = await runCli(`task('t', ['deno', 'eval', '1']);`, ['--help', '-q']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, 'USAGE:');
});

Deno.test(`cli > Should silence its own diagnostics but not a code task when quiet.`, async () => {
  const actual = await runCli(`task('t', () => console.log('CODE_OUT'));`, ['t', '-q']);

  assertEquals(actual.code, 0);
  assertStringIncludes(actual.stdout, 'CODE_OUT');
  assertEquals(actual.stdout.includes(`Starting 't'`), false);
});
