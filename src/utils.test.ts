// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertInstanceOf } from '@std/assert';
import { toFileUrl } from '@std/path';
import { getCwd, getImportUrl, isCode, isCommand, isExecutor, isNeeds, toCode, toCommand, toExecutor } from './utils.ts';
import type { TExecutor, TNeedsOrExecutor } from './types.ts';

Deno.test(`${isNeeds.name} > if isNeeds(undefined)`, () => {
  const param = undefined;
  const actual = isNeeds(param);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds(null)`, () => {
  const param = null;
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds('')`, () => {
  const param = '';
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds('task')`, () => {
  const param = 'task';
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds(true)`, () => {
  const param = true;
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds(1)`, () => {
  const param = 1;
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds({})`, () => {
  const param = {};
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds([])`, () => {
  const param: unknown = [];
  const actual = isNeeds(param as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds({ file: 'something.json' })`, () => {
  const param = { file: 'something.json' };
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds({ values: undefined })`, () => {
  const param = { values: undefined };
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds({ values: null })`, () => {
  const param = { values: null };
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds({ values: 'task' })`, () => {
  const param = { values: 'task' };
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, false);
});

Deno.test(`${isNeeds.name} > if isNeeds({ values: [] })`, () => {
  const param = { values: [] };
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, true);
});

Deno.test(`${isNeeds.name} > if isNeeds({ values: ['task'] })`, () => {
  const param = { values: ['task'] };
  const actual = isNeeds(param as unknown as TNeedsOrExecutor);

  assertEquals(actual, true);
});

Deno.test(`${isCommand.name} > isCommand(undefined)`, () => {
  const param = undefined;
  const actual = isCommand(param);

  assertEquals(actual, false);
});

Deno.test(`${isCommand.name} > isCommand(null)`, () => {
  const param = null;
  const actual = isCommand(param);

  assertEquals(actual, false);
});

Deno.test(`${isCommand.name} > isCommand(() => {})`, () => {
  const param = () => {/* do nothing */};
  const actual = isCommand(param);

  assertEquals(actual, false);
});

Deno.test(`${isCommand.name} > isCommand('')`, () => {
  const param = '';
  const actual = isCommand(param);

  assertEquals(actual, true);
});

Deno.test(`${isCommand.name} > isCommand('my command')`, () => {
  const param = 'my command';
  const actual = isCommand(param);

  assertEquals(actual, true);
});

Deno.test(`${isCommand.name} > isCommand([''])`, () => {
  const param = [''];
  const actual = isCommand(param);

  assertEquals(actual, true);
});

Deno.test(`${isCommand.name} > isCommand(['my', 'command'])`, () => {
  const param = ['my', 'command'];
  const actual = isCommand(param);

  assertEquals(actual, true);
});

Deno.test(`${isCode.name} > isCode(undefined)`, () => {
  const param = undefined;
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode(null)`, () => {
  const param = null;
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode('')`, () => {
  const param = '';
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode('my command')`, () => {
  const param = 'my command';
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode(true)`, () => {
  const param = true;
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode(() => {})`, () => {
  const param = () => {/* do nothing */};
  const actual = isCode(param);

  assertEquals(actual, true);
});

Deno.test(`${isCode.name} > isCode({})`, () => {
  const param = {};
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode({ file: undefined })`, () => {
  const param = { file: undefined };
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode({ file: null })`, () => {
  const param = { file: null };
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode({ file: 'my-file.js' })`, () => {
  const param = { file: 'my-file.js' };
  const actual = isCode(param);

  assertEquals(actual, true);
});

Deno.test(`${isCode.name} > isCode({ file: new URL('https://www.contoso.com/my-file.js') })`, () => {
  const param = { file: new URL('https://www.contoso.com/my-file.js') };
  const actual = isCode(param);

  assertEquals(actual, true);
});

Deno.test(`${isCode.name} > isCode({ file: './my-file.ts' })`, () => {
  const param = { file: './my-file.ts' };
  const actual = isCode(param);

  assertEquals(actual, true);
});

Deno.test(`${isCode.name} > isCode({ file: new URL('https://www.contoso.com/my-file.ts') })`, () => {
  const param = { file: new URL('https://www.contoso.com/my-file.ts') };
  const actual = isCode(param);

  assertEquals(actual, true);
});

Deno.test(`${isCode.name} > isCode({ file: 'my-file.exe' })`, () => {
  const param = { file: 'my-file.exe' };
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode({ file: new URL('https://www.contoso.com/my-file.exe') })`, () => {
  const param = { file: new URL('https://www.contoso.com/my-file.exe') };
  const actual = isCode(param);

  assertEquals(actual, false);
});

Deno.test(`${isCode.name} > isCode({ file: new URL('file://test.ts') })`, () => {
  const param = { file: new URL('file://var/test.ts') };
  const actual = isCode(param);

  assertEquals(actual, true);
});

Deno.test(`${isExecutor.name} > isExecutor(() => {})`, () => {
  const param = () => {/* do nothing */};
  const actual = isExecutor(param);

  assertEquals(actual, true);
});

Deno.test(`${isExecutor.name} > isExecutor('my command')`, () => {
  const param = 'my command';
  const actual = isExecutor(param);

  assertEquals(actual, true);
});

Deno.test(`${toExecutor.name} > if toExecutor(undefined)`, () => {
  const executor = undefined;
  const actual = toExecutor(executor);

  assertEquals(actual, undefined);
});

Deno.test(`${toExecutor.name} > if toExecutor(null)`, () => {
  const executor = null;
  const actual = toExecutor(executor as unknown as TExecutor);

  assertEquals(actual, undefined);
});

Deno.test(`${toExecutor.name} > if toExecutor('')`, () => {
  const executor = '';
  const actual = toExecutor(executor);

  assertEquals(actual, '');
});

Deno.test(`${toExecutor.name} > if toExecutor('pwsh -c ls')`, () => {
  const executor = 'pwsh -c ls';
  const actual = toExecutor(executor);

  assertEquals(actual, 'pwsh -c ls');
});

Deno.test(`${toExecutor.name} > if toExecutor('pwsh -c echo Hello World!')`, () => {
  const executor = 'pwsh -c echo Hello World!';
  const actual = toExecutor(executor);

  assertEquals(actual, 'pwsh -c echo Hello World!');
});

Deno.test(`${toExecutor.name} > if toExecutor(['pwsh', '-c echo Hello World!'])`, () => {
  const executor = ['pwsh', '-c echo Hello World!'];
  const actual = toExecutor(executor);

  assertEquals(actual, ['pwsh', '-c echo Hello World!']);
});

Deno.test(`${toExecutor.name} > toExecutor([''])`, () => {
  const executor = [''];
  const actual = toExecutor(executor as unknown as TExecutor);

  assertEquals(actual, ['']);
});

Deno.test(`${toExecutor.name} > toExecutor(() => {})`, () => {
  const executor = () => {/* do nothing */};
  const actual = toExecutor(executor as unknown as TExecutor);

  assertEquals(actual, executor);
});

Deno.test(`${toExecutor.name} > toExecutor({ file: 'test.ts' })`, () => {
  const executor = { file: 'test.ts' };
  const actual = toExecutor(executor as unknown as TExecutor);

  assertEquals(actual, { file: 'test.ts' });
});

Deno.test(`${toCommand.name} > if toCommand(undefined)`, () => {
  const executor = undefined;
  const actual = toCommand(executor);

  assertEquals(actual, undefined);
});

Deno.test(`${toCommand.name} > if toCommand(null)`, () => {
  const executor = null;
  const actual = toCommand(executor as unknown as TExecutor);

  assertEquals(actual, undefined);
});

Deno.test(`${toCommand.name} > if toCommand('')`, () => {
  const executor = '';
  const actual = toCommand(executor);

  assertEquals(actual, '');
});

Deno.test(`${toCommand.name} > if toCommand('pwsh -c ls')`, () => {
  const executor = 'pwsh -c ls';
  const actual = toCommand(executor);

  assertEquals(actual, 'pwsh -c ls');
});

Deno.test(`${toCommand.name} > if toCommand('pwsh -c echo Hello World!')`, () => {
  const executor = 'pwsh -c echo Hello World!';
  const actual = toCommand(executor);

  assertEquals(actual, 'pwsh -c echo Hello World!');
});

Deno.test(`${toCommand.name} > if toCommand(['pwsh', '-c echo Hello World!'])`, () => {
  const executor = ['pwsh', '-c echo Hello World!'];
  const actual = toCommand(executor);

  assertEquals(actual, ['pwsh', '-c echo Hello World!']);
});

Deno.test(`${toCommand.name} > if toCommand(() => {})`, () => {
  const executor = () => {/* do nothing */};
  const actual = toCommand(executor);

  assertEquals(actual, undefined);
});

Deno.test(`${toCode.name} > toCode(undefined)`, () => {
  const executor = undefined;
  const actual = toCode(executor);

  assertEquals(actual, undefined);
});

Deno.test(`${toCode.name} > toCode(null)`, () => {
  const executor = null;
  const actual = toCode(executor as unknown as TExecutor);

  assertEquals(actual, undefined);
});

Deno.test(`${toCode.name} > toCode('')`, () => {
  const executor = '';
  const actual = toCode(executor as unknown as TExecutor);

  assertEquals(actual, undefined);
});

Deno.test(`${toCode.name} > toCode([''])`, () => {
  const executor = [''];
  const actual = toCode(executor as unknown as TExecutor);

  assertEquals(actual, undefined);
});

Deno.test(`${toCode.name} > toCode(() => {})`, () => {
  const executor = () => {/* do nothing */};
  const actual = toCode(executor as unknown as TExecutor);

  assertEquals(actual, executor);
});

Deno.test(`${toCode.name} > toCode({ file: 'test.ts' })`, () => {
  const executor = { file: 'test.ts' };
  const actual = toCode(executor as unknown as TExecutor);

  assertEquals(actual, { file: 'test.ts' });
});

Deno.test(`${getImportUrl.name} > if param is undefined`, async () => {
  const fileOrUrl = undefined;
  let actual = 'init';

  try {
    actual = await getImportUrl(fileOrUrl as unknown as string);
  } catch (err: unknown) {
    assertInstanceOf(err, TypeError);
  }

  assertEquals(actual, 'init');
});

Deno.test(`${getImportUrl.name} > if param is null`, async () => {
  const fileOrUrl = null;
  let actual = 'init';

  try {
    actual = await getImportUrl(fileOrUrl as unknown as string);
  } catch (err: unknown) {
    assertInstanceOf(err, TypeError);
  }

  assertEquals(actual, 'init');
});

Deno.test(`${getImportUrl.name} > if param is a invalid path`, async () => {
  const fileOrUrl = 'something';
  let actual = 'init';

  try {
    actual = await getImportUrl(fileOrUrl);
  } catch (err: unknown) {
    assertInstanceOf(err, Error);
  }

  assertEquals(actual, 'init');
});

Deno.test(`${getImportUrl.name} > if param is not a file`, async () => {
  const fileOrUrl = './examples';
  let actual = 'init';

  try {
    actual = await getImportUrl(fileOrUrl);
  } catch (err: unknown) {
    assertInstanceOf(err, Error);
  }

  assertEquals(actual, 'init');
});

Deno.test(`${getImportUrl.name} > if param is a valid url`, async () => {
  const fileOrUrl = 'https://some.thing/tanofile.ts';
  const actual = await getImportUrl(fileOrUrl);

  assertEquals(actual, 'https://some.thing/tanofile.ts');
});

Deno.test(`${getImportUrl.name} > if param is a valid relative path`, async () => {
  const fileOrUrl = './examples/tanofile.ts';
  const actual = await getImportUrl(fileOrUrl);

  assertEquals(actual.endsWith('tanofile.ts'), true);
});

Deno.test(`${getImportUrl.name} > if param is a valid absolute path`, async () => {
  const fileOrUrl = await Deno.realPath('./examples/tanofile.ts');
  const actual = await getImportUrl(fileOrUrl);

  assertEquals(actual, toFileUrl(fileOrUrl).toString());
});

Deno.test(`${getCwd.name} > if param is undefined`, () => {
  const importUrl = undefined;
  const actual = getCwd(importUrl as unknown as string);

  assertEquals(actual, Deno.cwd());
});

Deno.test(`${getCwd.name} > if param is null`, () => {
  const importUrl = null;
  const actual = getCwd(importUrl as unknown as string);

  assertEquals(actual, Deno.cwd());
});

Deno.test(`${getCwd.name} > if param is a valid url`, () => {
  const importUrl = 'https://some.thing/tanofile.ts';
  const actual = getCwd(importUrl);

  assertEquals(actual, Deno.cwd());
});

Deno.test(`${getCwd.name} > if param is a valid absolute path`, () => {
  const importUrl = toFileUrl(Deno.realPathSync('./examples/tanofile.ts')).toString();
  const actual = getCwd(importUrl);

  assertEquals(actual.endsWith('examples'), true);
});
