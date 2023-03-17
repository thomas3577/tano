import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { isCode, isCommand, isExecutor, isNeeds, toCode, toCommand, toExecutor } from './utils.ts';

import type { Executor, NeedsOrExecutor } from './types.ts';

describe(isNeeds.name, () => {
  it(`if isNeeds(undefined)`, () => {
    const param = undefined;
    const actual = isNeeds(param);

    assertEquals(actual, false);
  });

  it(`if isNeeds(null)`, () => {
    const param = null;
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds('')`, () => {
    const param = '';
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds('task')`, () => {
    const param = 'task';
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds(true)`, () => {
    const param = true;
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds(1)`, () => {
    const param = 1;
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds({})`, () => {
    const param = {};
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds([])`, () => {
    const param: unknown = [];
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds({ file: 'something.json' })`, () => {
    const param = { file: 'something.json' };
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds({ values: undefined })`, () => {
    const param = { values: undefined };
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds({ values: null })`, () => {
    const param = { values: null };
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds({ values: 'task' })`, () => {
    const param = { values: 'task' };
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, false);
  });

  it(`if isNeeds({ values: [] })`, () => {
    const param = { values: [] };
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, true);
  });

  it(`if isNeeds({ values: ['task'] })`, () => {
    const param = { values: ['task'] };
    const actual = isNeeds(param as unknown as NeedsOrExecutor);

    assertEquals(actual, true);
  });
});

describe(isCommand.name, () => {
  it(`isCommand(undefined)`, () => {
    const param = undefined;
    const actual = isCommand(param);

    assertEquals(actual, false);
  });

  it(`isCommand(null)`, () => {
    const param = null;
    const actual = isCommand(param as any);

    assertEquals(actual, false);
  });

  it(`isCommand(() => {})`, () => {
    const param = () => {};
    const actual = isCommand(param);

    assertEquals(actual, false);
  });

  it(`isCommand('')`, () => {
    const param = '';
    const actual = isCommand(param as any);

    assertEquals(actual, true);
  });

  it(`isCommand('my command')`, () => {
    const param = 'my command';
    const actual = isCommand(param);

    assertEquals(actual, true);
  });

  it(`isCommand([''])`, () => {
    const param = [''];
    const actual = isCommand(param as any);

    assertEquals(actual, true);
  });

  it(`isCommand(['my', 'command'])`, () => {
    const param = ['my', 'command'];
    const actual = isCommand(param as any);

    assertEquals(actual, true);
  });
});

describe(isCode.name, () => {
  it(`isCode(undefined)`, () => {
    const param = undefined;
    const actual = isCode(param);

    assertEquals(actual, false);
  });

  it(`isCode(null)`, () => {
    const param = null;
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode('')`, () => {
    const param = '';
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode('my command')`, () => {
    const param = 'my command';
    const actual = isCode(param);

    assertEquals(actual, false);
  });

  it(`isCode(true)`, () => {
    const param = true;
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode(() => {})`, () => {
    const param = () => {};
    const actual = isCode(param);

    assertEquals(actual, true);
  });

  it(`isCode({})`, () => {
    const param = {};
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode({ file: undefined })`, () => {
    const param = { file: undefined };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode({ file: null })`, () => {
    const param = { file: null };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode({ file: 'my-file.js' })`, () => {
    const param = { file: 'my-file.js' };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, true);
  });

  it(`isCode({ file: new URL('https://www.contoso.com/my-file.js') })`, () => {
    const param = { file: new URL('https://www.contoso.com/my-file.js') };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, true);
  });

  it(`isCode({ file: './my-file.ts' })`, () => {
    const param = { file: './my-file.ts' };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, true);
  });

  it(`isCode({ file: new URL('https://www.contoso.com/my-file.ts') })`, () => {
    const param = { file: new URL('https://www.contoso.com/my-file.ts') };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, true);
  });

  it(`isCode({ file: 'my-file.exe' })`, () => {
    const param = { file: 'my-file.exe' };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode({ file: new URL('https://www.contoso.com/my-file.exe') })`, () => {
    const param = { file: new URL('https://www.contoso.com/my-file.exe') };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, false);
  });

  it(`isCode({ file: new URL('file://test.ts') })`, () => {
    const param = { file: new URL('file://var/test.ts') };
    const actual = isCode(param as unknown as any);

    assertEquals(actual, true);
  });
});

describe(isExecutor.name, () => {
  it(`isExecutor(() => {})`, () => {
    const param = () => {};
    const actual = isExecutor(param);

    assertEquals(actual, true);
  });

  it(`isExecutor('my command')`, () => {
    const param = 'my command';
    const actual = isExecutor(param);

    assertEquals(actual, true);
  });
});

describe(toExecutor.name, () => {
  it(`if toExecutor(undefined)`, () => {
    const executor = undefined;
    const actual = toExecutor(executor);

    assertEquals(actual, undefined);
  });

  it(`if toExecutor(null)`, () => {
    const executor = null;
    const actual = toExecutor(executor as unknown as Executor);

    assertEquals(actual, undefined);
  });

  it(`if toExecutor('')`, () => {
    const executor = '';
    const actual = toExecutor(executor);

    assertEquals(actual, '');
  });

  it(`if toExecutor('ls')`, () => {
    const executor = 'ls';
    const actual = toExecutor(executor);

    assertEquals(actual, 'ls');
  });

  it(`if toExecutor('ls --all')`, () => {
    const executor = 'ls --all';
    const actual = toExecutor(executor);

    assertEquals(actual, 'ls --all');
  });

  it(`if toExecutor(['ls', '--all'])`, () => {
    const executor = ['ls', '--all'];
    const actual = toExecutor(executor);

    assertEquals(actual, ['ls', '--all']);
  });

  it(`toExecutor([''])`, () => {
    const executor = [''];
    const actual = toExecutor(executor as unknown as Executor);

    assertEquals(actual, ['']);
  });

  it(`toExecutor(() => {})`, () => {
    const executor = () => {};
    const actual = toExecutor(executor as unknown as Executor);

    assertEquals(actual, executor);
  });

  it(`toExecutor({ file: 'test.ts' })`, () => {
    const executor = { file: 'test.ts' };
    const actual = toExecutor(executor as unknown as Executor);

    assertEquals(actual, { file: 'test.ts' });
  });
});

describe(toCommand.name, () => {
  it(`if toCommand(undefined)`, () => {
    const executor = undefined;
    const actual = toCommand(executor);

    assertEquals(actual, undefined);
  });

  it(`if toCommand(null)`, () => {
    const executor = null;
    const actual = toCommand(executor as unknown as Executor);

    assertEquals(actual, undefined);
  });

  it(`if toCommand('')`, () => {
    const executor = '';
    const actual = toCommand(executor);

    assertEquals(actual, '');
  });

  it(`if toCommand('ls')`, () => {
    const executor = 'ls';
    const actual = toCommand(executor);

    assertEquals(actual, 'ls');
  });

  it(`if toCommand('ls --all')`, () => {
    const executor = 'ls --all';
    const actual = toCommand(executor);

    assertEquals(actual, 'ls --all');
  });

  it(`if toCommand(['ls', '--all'])`, () => {
    const executor = ['ls', '--all'];
    const actual = toCommand(executor);

    assertEquals(actual, ['ls', '--all']);
  });

  it(`if toCommand(() => {})`, () => {
    const executor = () => {};
    const actual = toCommand(executor);

    assertEquals(actual, undefined);
  });
});

describe(toCode.name, () => {
  it(`toCode(undefined)`, () => {
    const executor = undefined;
    const actual = toCode(executor);

    assertEquals(actual, undefined);
  });

  it(`toCode(null)`, () => {
    const executor = null;
    const actual = toCode(executor as unknown as Executor);

    assertEquals(actual, undefined);
  });

  it(`toCode('')`, () => {
    const executor = '';
    const actual = toCode(executor as unknown as Executor);

    assertEquals(actual, undefined);
  });

  it(`toCode([''])`, () => {
    const executor = [''];
    const actual = toCode(executor as unknown as Executor);

    assertEquals(actual, undefined);
  });

  it(`toCode(() => {})`, () => {
    const executor = () => {};
    const actual = toCode(executor as unknown as Executor);

    assertEquals(actual, executor);
  });

  it(`toCode({ file: 'test.ts' })`, () => {
    const executor = { file: 'test.ts' };
    const actual = toCode(executor as unknown as Executor);

    assertEquals(actual, { file: 'test.ts' });
  });
});
