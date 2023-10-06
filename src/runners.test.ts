import { assertEquals } from 'std/assert/mod.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { executeCodeFunction, executeCondition, runCode, runCommand } from './runners.ts';

import type { Code, CodeFunction, Command, Condition } from './types.ts';

describe(runCode.name, () => {
  it(`if runCode(undefined)`, async () => {
    const actual = await runCode(undefined as unknown as Code)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if runCode(null)`, async () => {
    const actual = await runCode(null as unknown as Code)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if runCode(() => {})`, async () => {
    const actual = await runCode(() => {})
      .then(() => true);

    assertEquals(actual, true);
  });

  it(`if runCode(() => {}) with repl`, async () => {
    const actual = await runCode(() => {}, { repl: true })
      .then(() => true);

    assertEquals(actual, true);
  });

  it(`if runCode({ file: './examples/tanofile.code.ts' })`, async () => {
    const actual = await runCode({ file: './examples/tanofile.code.ts' })
      .then(() => true);

    assertEquals(actual, true);
  });
});

describe(runCommand.name, () => {
  it(`if runCommand(undefined)`, async () => {
    const command = undefined;
    const actual = await runCommand(command as unknown as Command)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if runCommand(null)`, async () => {
    const command = null;
    const actual = await runCommand(command as unknown as Command)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if runCommand('')`, async () => {
    const command = '';
    const actual = await runCommand(command as unknown as Command)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if runCommand('ls')`, async () => {
    const command = 'ls';
    const actual = await runCommand(command as unknown as Command)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, true);
  });

  it(`if runCommand('ls --all')`, async () => {
    const command = 'ls --all';
    const actual = await runCommand(command as unknown as Command)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, true);
  });

  it(`if runCommand(['ls', '--all'])`, async () => {
    const command = ['ls', '--all'];
    const actual = await runCommand(command as unknown as Command)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, true);
  });
});

describe(executeCondition.name, () => {
  it(`if executeCondition(undefined)`, async () => {
    const condition = undefined;
    const actual = await executeCondition(condition as unknown as Condition);

    assertEquals(actual, false);
  });

  it(`if executeCondition(null)`, async () => {
    const condition = null;
    const actual = await executeCondition(condition as unknown as Condition);

    assertEquals(actual, false);
  });

  it(`if executeCondition(1)`, async () => {
    const condition = 1;
    const actual = await executeCondition(condition as unknown as Condition);

    assertEquals(actual, false);
  });

  it(`if executeCondition(true)`, async () => {
    const condition = true;
    const actual = await executeCondition(condition as unknown as Condition);

    assertEquals(actual, true);
  });

  it(`if executeCondition(() => true)`, async () => {
    const condition = () => true;
    const actual = await executeCondition(condition);

    assertEquals(actual, true);
  });

  it(`if executeCondition(() => Promise.resolve(true))`, async () => {
    const condition = () => Promise.resolve(true);
    const actual = await executeCondition(condition);

    assertEquals(actual, true);
  });

  it(`if executeCondition(() => Promise.reject())`, async () => {
    const condition = () => Promise.reject(new Error('my error'));
    const actual = await executeCondition(condition)
      .catch(() => false);

    assertEquals(actual, false);
  });
});

describe(executeCodeFunction.name, () => {
  it(`if executeCodeFunction(undefined)`, async () => {
    const code = undefined;
    const actual = await executeCodeFunction(code as unknown as CodeFunction)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if executeCodeFunction(null)`, async () => {
    const code = null;
    const actual = await executeCodeFunction(code as unknown as CodeFunction)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if executeCodeFunction('')`, async () => {
    const code = '';
    const actual = await executeCodeFunction(code as unknown as CodeFunction)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });

  it(`if executeCodeFunction(() => {})`, async () => {
    const code = () => {/* do nothing */};
    const actual = await executeCodeFunction(code as unknown as CodeFunction)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, true);
  });

  it(`if executeCodeFunction(() => Promise.resolve())`, async () => {
    const code = () => Promise.resolve();
    const actual = await executeCodeFunction(code as unknown as CodeFunction)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, true);
  });

  it(`if executeCodeFunction(() => Promise.reject())`, async () => {
    const code = () => Promise.reject(new Error('my error'));
    const actual = await executeCodeFunction(code as unknown as CodeFunction)
      .then(() => true)
      .catch(() => false);

    assertEquals(actual, false);
  });
});
