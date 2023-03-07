import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { runCode } from './runners.ts';

import type { Code } from './definitions.ts';

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
    const actual = await runCode(() => {}).then(() => true);

    assertEquals(actual, true);
  });

  it(`if runCode({ file: '../examples/tanofile.code.ts' })`, async () => {
    const actual = await runCode({ file: '../examples/tanofile.code.ts' }).then(() => true);

    assertEquals(actual, true);
  });
});
