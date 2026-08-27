// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertThrows } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { tokenize } from './tokenize.ts';

describe(tokenize.name, () => {
  it(`Should split at whitespace runs.`, () => {
    assertEquals(tokenize('deno fmt --check'), ['deno', 'fmt', '--check']);
    assertEquals(tokenize('deno   fmt'), ['deno', 'fmt']);
    assertEquals(tokenize('  deno fmt  '), ['deno', 'fmt']);
    assertEquals(tokenize('deno\tfmt'), ['deno', 'fmt']);
    assertEquals(tokenize(''), []);
    assertEquals(tokenize('   '), []);
  });

  it(`Should remove single quotes and keep their content as one argument.`, () => {
    assertEquals(tokenize(`echo 'Task 06'`), ['echo', 'Task 06']);
    assertEquals(tokenize(`echo ''`), ['echo', '']);
    assertEquals(tokenize(`echo 'a"b'`), ['echo', 'a"b']);
  });

  it(`Should remove double quotes and keep their content as one argument.`, () => {
    assertEquals(tokenize(`echo "Task 06"`), ['echo', 'Task 06']);
    assertEquals(tokenize(`echo ""`), ['echo', '']);
    assertEquals(tokenize(`echo "a'b"`), ['echo', `a'b`]);
    assertEquals(tokenize(`pwsh -c "echo 'Task 06'"`), ['pwsh', '-c', `echo 'Task 06'`]);
  });

  it(`Should join quotes that are adjacent to other text.`, () => {
    assertEquals(tokenize(`--msg="a b"`), ['--msg=a b']);
    assertEquals(tokenize(`'a'b'c'`), ['abc']);
  });

  it(`Should treat a backslash as an ordinary character.`, () => {
    assertEquals(tokenize('deno run C:\\src\\build.ts'), ['deno', 'run', 'C:\\src\\build.ts']);
    assertEquals(tokenize('deno run "C:\\Program Files\\build.ts"'), ['deno', 'run', 'C:\\Program Files\\build.ts']);
  });

  it(`Should not let a backslash escape a quote, so the quote still opens a quoted section.`, () => {
    assertThrows(() => tokenize('echo a\\"b'), Error, 'Unterminated double quote');
  });

  it(`Should throw on an unterminated quote.`, () => {
    assertThrows(() => tokenize(`echo 'unterminated`), Error, 'Unterminated single quote');
    assertThrows(() => tokenize(`echo "unterminated`), Error, 'Unterminated double quote');
  });

  it(`Should throw on unquoted shell operators.`, () => {
    assertThrows(() => tokenize('ls -la | wc -l'), Error, `Unquoted shell operator '|'`);
    assertThrows(() => tokenize('deno lint && deno test'), Error, `Unquoted shell operator '&'`);
    assertThrows(() => tokenize('echo x > file.txt'), Error, `Unquoted shell operator '>'`);
    assertThrows(() => tokenize('cat < file.txt'), Error, `Unquoted shell operator '<'`);
    assertThrows(() => tokenize('deno lint; deno test'), Error, `Unquoted shell operator ';'`);
    assertThrows(() => tokenize('echo `date`'), Error, 'Unquoted shell operator');
    assertThrows(() => tokenize('echo $(date)'), Error, `Unquoted shell operator '$('`);
  });

  it(`Should pass shell operators through when they are quoted.`, () => {
    assertEquals(tokenize(`deno eval 'a | b'`), ['deno', 'eval', 'a | b']);
    assertEquals(tokenize(`deno eval "a && b"`), ['deno', 'eval', 'a && b']);
    assertEquals(tokenize(`deno eval '$(date)'`), ['deno', 'eval', '$(date)']);
  });

  it(`Should not reject characters that are meaningless without a shell.`, () => {
    assertEquals(tokenize('find . -name *.ts'), ['find', '.', '-name', '*.ts']);
    assertEquals(tokenize('grep x$ file.txt'), ['grep', 'x$', 'file.txt']);
    assertEquals(tokenize('deno eval 1+1'), ['deno', 'eval', '1+1']);
  });
});
