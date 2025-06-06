// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertInstanceOf, assertNotEquals } from '@std/assert';
import { afterEach, describe, it } from '@std/testing/bdd';
import { handler } from './handler.ts';
import { Task } from './task.ts';
import type { TOptions } from './types.ts';

describe(Task.name, () => {
  afterEach(() => {
    handler.clear();
  });

  it(`Should create a instance of Task`, () => {
    const actual: Task = new Task('task-test-01');

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-01');
  });

  it(`Should run the command line.`, async () => {
    const needs: string[] = [];

    const actual: Task = new Task('task-test-02', needs, `pwsh -c echo 'Runs my task'`);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-02');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should run the function. (1)`, async () => {
    const func = () => {/* do nothing */};
    const needs: string[] = [];

    const actual: Task = new Task('task-test-03', needs, func);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-03');

    await actual.runThis();

    assertEquals(actual.status, 'success');
  });

  it(`Should run the function. (2)`, async () => {
    const func = () => Promise.resolve('my output');
    const needs: string[] = [];

    await new Promise((resolve) => {
      const options: TOptions = {
        output: (_, event) => {
          assertEquals(event, 'my output');
          resolve(true);
        },
      };

      const actual: Task = new Task('task-test-04', needs, func, options);

      assertNotEquals(actual, null);
      assertInstanceOf(actual, Task);
      assertEquals(actual.name, 'task-test-04');

      actual.runThis();
    });
  });

  it(`Should not run if conditions false. (1)`, async () => {
    const func = () => {/* do nothing */};
    const needs: string[] = [];
    const options: TOptions = {
      condition: 1 + 2 === 4,
    };

    const actual: Task = new Task('task-test-05', needs, func, options);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-05');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (2)`, async () => {
    const func = () => {/* do nothing */};
    const needs: string[] = [];
    const options: TOptions = {
      condition: () => false,
    };

    const actual: Task = new Task('task-test-06', needs, func, options);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-06');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (3)`, async () => {
    const func = () => {/* do nothing */};
    const needs: string[] = [];
    const options: TOptions = {
      condition: (done) => setTimeout(() => done(false), 100),
    };

    const actual: Task = new Task('task-test-07', needs, func, options);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-07');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (4)`, async () => {
    const func = () => {/* do nothing */};
    const needs: string[] = [];
    const options: TOptions = {
      condition: async () => {
        return await Promise.resolve(false);
      },
    };

    const actual: Task = new Task('task-test-08', needs, func, options);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-08');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });

  it(`Should not run if conditions false. (5)`, async () => {
    const func = () => {/* do nothing */};
    const needs: string[] = [];
    const options: TOptions = {
      condition: () => {
        return Promise.resolve(false);
      },
    };

    const actual: Task = new Task('task-test-09', needs, func, options);

    assertNotEquals(actual, null);
    assertInstanceOf(actual, Task);
    assertEquals(actual.name, 'task-test-09');

    await actual.runThis();

    assertEquals(actual.status, 'skipped');
  });
});
