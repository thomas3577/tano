// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertStringIncludes } from '@std/assert';
import { executeCodeFunction, executeCondition, runCode, runCommand } from './runners.ts';
import { abortRun, resetRun } from './abort.ts';
import type { TCode, TCodeFunction, TCommand, TCondition } from './types.ts';

Deno.test(`${runCode.name} > if runCode(undefined)`, async () => {
  const actual = await runCode(undefined as unknown as TCode)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${runCode.name} > if runCode(null)`, async () => {
  const actual = await runCode(null as unknown as TCode)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${runCode.name} > if runCode(() => {})`, async () => {
  const actual = await runCode(() => {})
    .then(() => true);

  assertEquals(actual, true);
});

Deno.test(`${runCode.name} > if runCode(() => {}) with repl`, async () => {
  const actual = await runCode(() => {}, { repl: true })
    .then(() => true);

  assertEquals(actual, true);
});

Deno.test(`${runCode.name} > if runCode({ file: './examples/tanofile.code.ts' })`, async () => {
  const actual = await runCode({ file: './examples/tanofile.code.ts' })
    .then(() => true);

  assertEquals(actual, true);
});

Deno.test(`${runCommand.name} > if runCommand(undefined)`, async () => {
  const command = undefined;
  const actual = await runCommand(command as unknown as TCommand)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${runCommand.name} > if runCommand(null)`, async () => {
  const command = null;
  const actual = await runCommand(command as unknown as TCommand)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${runCommand.name} > if runCommand('')`, async () => {
  const command = '';
  const actual = await runCommand(command as unknown as TCommand)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${runCommand.name} > if runCommand('deno eval 1+1')`, async () => {
  const command = 'deno eval 1+1';
  const actual = await runCommand(command as unknown as TCommand)
    .then(() => true)
    .catch((err) => {
      console.log('ERROR', err);
      return false;
    });

  assertEquals(actual, true);
});

Deno.test(`${runCommand.name} > if runCommand(['deno', 'eval', 'console.log("Hello World!")'])`, async () => {
  const command = ['deno', 'eval', 'console.log("Hello World!")'];
  const actual = await runCommand(command as unknown as TCommand)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, true);
});

Deno.test(`${runCommand.name} > if runCommand(['deno', 'eval', 'Deno.exit(2)'])`, async () => {
  const command = ['deno', 'eval', 'Deno.exit(2)'];
  const actual = await runCommand(command as unknown as TCommand)
    .then(() => false)
    .catch(() => true);

  assertEquals(actual, true);
});

Deno.test(`${runCommand.name} > if runCommand('deno eval "console.log(1+1)"')`, async () => {
  const command = 'deno eval "console.log(1+1)"';

  const actual = await runCommand(command as unknown as TCommand)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, true);
});

Deno.test(`${runCommand.name} > if runCommand('deno lint && deno test')`, async () => {
  const command = 'deno lint && deno test';

  let message = '';
  const actual = await runCommand(command as unknown as TCommand)
    .then(() => false)
    .catch((err) => {
      message = err instanceof Error ? err.message : String(err);
      return true;
    });

  assertEquals(actual, true);
  assertStringIncludes(message, `Unquoted shell operator '&'`);
});

Deno.test(`${runCommand.name} > if runCommand is aborted while it runs`, async () => {
  const command = ['deno', 'eval', 'await new Promise((resolve) => setTimeout(resolve, 3000)); console.log("NOT_REACHED")'];

  resetRun();

  const started = Date.now();
  const promise = runCommand(command as unknown as TCommand);

  setTimeout(() => abortRun(), 200);

  const actual = await promise
    .then(() => true)
    .catch(() => false);

  resetRun();

  assertEquals(actual, false);
  assertEquals(Date.now() - started < 2000, true);
});

Deno.test(`${executeCondition.name} > if executeCondition(undefined)`, async () => {
  const condition = undefined;
  const actual = await executeCondition(condition as unknown as TCondition);

  assertEquals(actual, false);
});

Deno.test(`${executeCondition.name} > if executeCondition(null)`, async () => {
  const condition = null;
  const actual = await executeCondition(condition as unknown as TCondition);

  assertEquals(actual, false);
});

Deno.test(`${executeCondition.name} > if executeCondition(1)`, async () => {
  const condition = 1;
  const actual = await executeCondition(condition as unknown as TCondition);

  assertEquals(actual, false);
});

Deno.test(`${executeCondition.name} > if executeCondition(true)`, async () => {
  const condition = true;
  const actual = await executeCondition(condition as unknown as TCondition);

  assertEquals(actual, true);
});

Deno.test(`${executeCondition.name} > if executeCondition(() => true)`, async () => {
  const condition = () => true;
  const actual = await executeCondition(condition);

  assertEquals(actual, true);
});

Deno.test(`${executeCondition.name} > if executeCondition(() => Promise.resolve(true))`, async () => {
  const condition = () => Promise.resolve(true);
  const actual = await executeCondition(condition);

  assertEquals(actual, true);
});

Deno.test(`${executeCondition.name} > if executeCondition(() => Promise.reject())`, async () => {
  const condition = () => Promise.reject(new Error('my error'));
  const actual = await executeCondition(condition)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${executeCodeFunction.name} > if executeCodeFunction(undefined)`, async () => {
  const code = undefined;
  const actual = await executeCodeFunction(code as unknown as TCodeFunction)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${executeCodeFunction.name} > if executeCodeFunction(null)`, async () => {
  const code = null;
  const actual = await executeCodeFunction(code as unknown as TCodeFunction)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${executeCodeFunction.name} > if executeCodeFunction('')`, async () => {
  const code = '';
  const actual = await executeCodeFunction(code as unknown as TCodeFunction)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});

Deno.test(`${executeCodeFunction.name} > if executeCodeFunction(() => {})`, async () => {
  const code = () => {/* do nothing */};
  const actual = await executeCodeFunction(code as unknown as TCodeFunction)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, true);
});

Deno.test(`${executeCodeFunction.name} > if executeCodeFunction(() => Promise.resolve())`, async () => {
  const code = () => Promise.resolve();
  const actual = await executeCodeFunction(code as unknown as TCodeFunction)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, true);
});

Deno.test(`${executeCodeFunction.name} > if executeCodeFunction(() => Promise.reject())`, async () => {
  const code = () => Promise.reject(new Error('my error'));
  const actual = await executeCodeFunction(code as unknown as TCodeFunction)
    .then(() => true)
    .catch(() => false);

  assertEquals(actual, false);
});
