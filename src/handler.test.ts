// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertInstanceOf, assertRejects } from '@std/assert';
import { afterEach, beforeAll, describe, it } from '@std/testing/bdd';
import { spy } from '@std/testing/mock';
import { handler } from './handler.ts';
import { needs } from './needs.ts';
import { task } from './task.factory.ts';

describe('handler', () => {
  beforeAll(() => {
    spy(Deno.writeTextFile);
  });

  afterEach(() => {
    handler.clear();
  });

  it(`Should have one task.`, () => {
    task('myTask', `deno eval 1`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);
  });

  it(`Should have two task.`, () => {
    task('default', needs('pre-task'), `deno eval 1`);
    task('pre-task', `deno eval 1`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);
  });

  it(`Should throws an error if no default-task and no task set.`, async () => {
    task('myTask', `deno eval 1`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);

    await assertRejects(
      async () => await handler.run(undefined),
      Error,
      `A task with the name 'default' does not exist.`,
    );

    assertEquals(handler.executed, 0);
  });

  it(`Should run one task.`, async () => {
    task('myTask', `deno eval 1`);

    assertEquals(handler.count, 1);
    assertEquals(handler.executed, 0);

    await handler.run('myTask');

    assertEquals(handler.executed, 1);
  });

  it(`Should throws an error if trying to runs two times.`, async () => {
    task('default', needs('pre-task'), `deno eval 1`);
    task('pre-task', `deno eval 1`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);

    await handler.run()
      .catch((err) => {
        assertInstanceOf(err, Error);
      });

    assertEquals(handler.executed, 2);
  });

  it(`Should runs two times.`, async () => {
    task('default', needs('pre-task'), `deno eval 1`);
    task('pre-task', `deno eval 1`);

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);

    handler.reset();

    assertEquals(handler.count, 2);
    assertEquals(handler.executed, 0);

    await handler.run();

    assertEquals(handler.executed, 2);
  });

  it(`Should abort at first error`, async () => {
    try {
      task('pre-task-one', () => {
        throw new Error('ERROR! ERROR! ERROR!');
      });
      task('pre-task-two', `deno eval 1`);
      task('default', needs('pre-task-one', 'pre-task-two'), `deno eval 1`);

      await handler.run();
    } catch (err: unknown) {
      assertInstanceOf(err, Error);
    }
  });

  it(`Should NOT abort at first error`, async () => {
    task('pre-task-one', () => {
      throw new Error('ERROR! ERROR! ERROR!');
    });
    task('pre-task-two', `deno eval 1`);
    task('default', needs('pre-task-one', 'pre-task-two'), `deno eval 1`);

    await assertRejects(
      async () => await handler.run('default', { failFast: false }),
      Error,
      'Failed tasks: pre-task-one',
    );

    assertEquals(handler.executed, 3);
  });

  it(`Should deduplicate shared dependencies in execution plan`, async () => {
    task('shared', () => {});
    task('task-a', needs('shared'), () => {});
    task('task-b', needs('shared'), () => {});
    task('default', needs('task-a', 'task-b'), () => {});

    const plan = handler.getPlan('default');

    assertEquals(plan, ['shared', 'task-a', 'task-b', 'default']);

    await handler.run('default');

    assertEquals(handler.executed, 4);
  });

  it(`Should group independent tasks into levels`, () => {
    task('shared', () => {});
    task('task-a', needs('shared'), () => {});
    task('task-b', needs('shared'), () => {});
    task('default', needs('task-a', 'task-b'), () => {});

    assertEquals(handler.getLevels('default'), [['shared'], ['task-a', 'task-b'], ['default']]);
  });

  it(`Should put a task after the deepest of its needs`, () => {
    task('a', () => {});
    task('b', needs('a'), () => {});
    task('default', needs('a', 'b'), () => {});

    assertEquals(handler.getLevels('default'), [['a'], ['b'], ['default']]);
  });

  it(`Should return a single level for a task without needs`, () => {
    task('lonely', () => {});

    assertEquals(handler.getLevels('lonely'), [['lonely']]);
  });

  it(`Should fail on circular dependencies`, async () => {
    task('task-a', needs('task-b'), () => {});
    task('task-b', needs('task-a'), () => {});
    task('default', needs('task-a'), () => {});

    await assertRejects(
      async () => await handler.run('default'),
      Error,
      'Circular dependency detected',
    );
  });
});
