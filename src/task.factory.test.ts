// Copyright 2018-2024 the tano authors. All rights reserved. MIT license.

import { assertEquals, assertNotEquals } from '@std/assert';
import { afterAll, afterEach, describe, it } from '@std/testing/bdd';
import { task } from './task.factory.ts';
import { handler } from './handler.ts';
import { Task } from './task.ts';
import { needs } from './needs.ts';

import type { TCodeFile, TTaskParams } from './types.ts';

describe(task.name, () => {
  describe('create tasks', () => {
    afterAll(() => {
      handler.clear();
    });

    it(`Task Var 01`, () => {
      const myTask: Task = task(new Task('my-task-01'));

      assertEquals(myTask.name, 'my-task-01');
      assertEquals(myTask.needs, []);
      assertEquals(myTask.executor, undefined);
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 02`, () => {
      const myTask: Task = task('my-task-02', () => {});

      assertEquals(myTask.name, 'my-task-02');
      assertEquals(myTask.needs, []);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 03`, () => {
      const myTask: Task = task('my-task-03', needs('my-pretask-031', 'my-pretask-032'));

      assertEquals(myTask.name, 'my-task-03');
      assertEquals(myTask.needs, ['my-pretask-031', 'my-pretask-032']);
      assertEquals(myTask.executor, undefined);
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 04`, () => {
      const myPreTaskOne: Task = task('my-pretask-041', needs('my-pre-pretask-0411'));
      const myPreTaskTwo: Task = task('my-pretask-042', needs('my-pre-pretask-0421'));
      const myTask: Task = task('my-task-04', needs(myPreTaskOne, myPreTaskTwo));

      assertEquals(myTask.name, 'my-task-04');
      assertEquals(myTask.needs, ['my-pretask-041', 'my-pretask-042']);
      assertEquals(myTask.executor, undefined);
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 05`, () => {
      const myPreTaskOne: Task = task('my-pretask-051', needs('my-pre-pretask-0511', 'my-pre-pretask-0512'));
      const myTask: Task = task('my-task-05', needs(myPreTaskOne, 'my-pretask-052'));

      assertEquals(myTask.name, 'my-task-05');
      assertEquals(myTask.needs, ['my-pretask-051', 'my-pretask-052']);
      assertEquals(myTask.executor, undefined);
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 06`, () => {
      const myTask: Task = task('my-task-06', needs('my-pretask-061', 'my-pretask-062'), () => {});

      assertEquals(myTask.name, 'my-task-06');
      assertEquals(myTask.needs, ['my-pretask-061', 'my-pretask-062']);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 07`, () => {
      const myPreTaskOne: Task = task('my-pretask-071', needs('my-pre-pretask-071'));
      const myPreTaskTwo: Task = task('my-pretask-072', needs('my-pre-pretask-072'));
      const myTask: Task = task('my-task-07', needs(myPreTaskOne, myPreTaskTwo), () => {});

      assertEquals(myTask.name, 'my-task-07');
      assertEquals(myTask.needs, ['my-pretask-071', 'my-pretask-072']);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 08`, () => {
      const myPreTaskOne: Task = task('my-pretask-081', needs('my-pre-pretask-0811', 'my-pre-pretask-0812'));
      const myTask: Task = task('my-task-08', needs(myPreTaskOne, 'my-pretask-082'), () => {});

      assertEquals(myTask.name, 'my-task-08');
      assertEquals(myTask.needs, ['my-pretask-081', 'my-pretask-082']);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 09`, () => {
      const myTask: Task = task('my-task-09', 'My Command');

      assertEquals(myTask.name, 'my-task-09');
      assertEquals(myTask.needs, []);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 10`, () => {
      const myTask: Task = task('my-task-10', 'My Command', { cwd: './' });

      assertEquals(myTask.name, 'my-task-10');
      assertEquals(myTask.needs, []);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 11`, () => {
      const myTask: Task = task('my-task-11', () => {}, { cwd: './' });

      assertEquals(myTask.name, 'my-task-11');
      assertEquals(myTask.needs, []);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 12`, () => {
      const myTask: Task = task('my-task-12', needs('my-pretask-121', 'my-pretask-122'), 'My Command');

      assertEquals(myTask.name, 'my-task-12');
      assertEquals(myTask.needs, ['my-pretask-121', 'my-pretask-122']);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 13`, () => {
      const myPreTaskOne: Task = task('my-pretask-131', needs('my-pre-pretask-1311'));
      const myPreTaskTwo: Task = task('my-pretask-132', needs('my-pre-pretask-1321'));
      const myTask: Task = task('my-task-13', needs(myPreTaskOne, myPreTaskTwo), 'My Command');

      assertEquals(myTask.name, 'my-task-13');
      assertEquals(myTask.needs, ['my-pretask-131', 'my-pretask-132']);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 14`, () => {
      const myPreTaskOne: Task = task('my-pretask-141', needs('my-pre-pretask-1411', 'my-pre-pretask-1412'));
      const myTask: Task = task('my-task-14', needs(myPreTaskOne, 'my-pretask-142'), 'My Command');

      assertEquals(myTask.name, 'my-task-14');
      assertEquals(myTask.needs, ['my-pretask-141', 'my-pretask-142']);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 15`, () => {
      const myTask: Task = task('my-task-15', needs('my-pretask-151', 'my-pretask-152'), () => {}, { cwd: './' });

      assertEquals(myTask.name, 'my-task-15');
      assertEquals(myTask.needs, ['my-pretask-151', 'my-pretask-152']);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 16`, () => {
      const myPreTaskOne: Task = task('my-pretask-161', needs('my-pre-pretask-1611'));
      const myPreTaskTwo: Task = task('my-pretask-162', needs('my-pre-pretask-1621'));
      const myTask: Task = task('my-task-16', needs(myPreTaskOne, myPreTaskTwo), () => {}, { cwd: './' });

      assertEquals(myTask.name, 'my-task-16');
      assertEquals(myTask.needs, ['my-pretask-161', 'my-pretask-162']);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 17`, () => {
      const myPreTaskOne: Task = task('my-pretask-171', needs('my-pre-pretask-1711', 'my-pre-pretask-1712'));
      const myTask: Task = task('my-task-17', needs(myPreTaskOne, 'my-pretask-172'), () => {}, { cwd: './' });

      assertEquals(myTask.name, 'my-task-17');
      assertEquals(myTask.needs, ['my-pretask-171', 'my-pretask-172']);
      assertEquals(typeof myTask.executor, 'function');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 18`, () => {
      const myTask: Task = task('my-task-18', needs('my-pretask-181', 'my-pretask-182'), 'My Command', { cwd: './' });

      assertEquals(myTask.name, 'my-task-18');
      assertEquals(myTask.needs, ['my-pretask-181', 'my-pretask-182']);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 19`, () => {
      const myPreTaskOne: Task = task('my-pretask-191', needs('my-pre-pretask-1911'));
      const myPreTaskTwo: Task = task('my-pretask-192', needs('my-pre-pretask-1912'));
      const myTask: Task = task('my-task-19', needs(myPreTaskOne, myPreTaskTwo), 'My Command', { cwd: './' });

      assertEquals(myTask.name, 'my-task-19');
      assertEquals(myTask.needs, ['my-pretask-191', 'my-pretask-192']);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 20`, () => {
      const myPreTaskOne: Task = task('my-pretask-201', needs('my-pre-pretask-2011', 'my-pre-pretask-2012'));
      const myTask: Task = task('my-task-20', needs(myPreTaskOne, 'my-pretask-202'), 'My Command', { cwd: './' });

      assertEquals(myTask.name, 'my-task-20');
      assertEquals(myTask.needs, ['my-pretask-201', 'my-pretask-202']);
      assertEquals(myTask.executor, 'My Command');
      assertEquals(myTask.options, { cwd: './' });
    });

    it(`Task Var 21`, () => {
      const taskParams: TTaskParams = {
        name: 'my-task-21',
      };

      const myTask: Task = task(taskParams);

      assertEquals(myTask.name, 'my-task-21');
      assertEquals(myTask.needs, []);
      assertEquals(myTask.executor, undefined);
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 22`, () => {
      const myTask: Task = task('my-task-22');

      assertEquals(myTask.name, 'my-task-22');
      assertEquals(myTask.needs, []);
      assertEquals(myTask.executor, undefined);
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 23`, () => {
      const myTask: Task = task('my-task-23', needs());

      assertEquals(myTask.name, 'my-task-23');
      assertEquals(myTask.needs, []);
      assertEquals(myTask.executor, undefined);
      assertEquals(myTask.options, undefined);
    });

    it(`Task Var 24`, () => {
      const file = new URL('file://var/test.ts');
      const codeFile: TCodeFile = { file };
      const myTask: Task = task('my-task-24', codeFile);

      assertEquals(myTask.name, 'my-task-24');
      assertEquals(myTask.needs, []);
      assertEquals(myTask.executor, codeFile);
      assertEquals(myTask.options, undefined);
    });
  });

  describe('run tasks', () => {
    afterEach(() => {
      handler.clear();
    });

    it(`run one task with a command`, async () => {
      const actual: Task = task('my-task-100', `pwsh -c echo 'First Task'`);

      assertEquals(actual.status, 'ready');
      assertEquals(handler.executed, 0);

      await actual.run();

      assertEquals(actual.status, 'success');
      assertEquals(handler.executed, 1);
    });

    it(`run one task with a function`, async () => {
      const actual: Task = task('my-task-101', () => {
        console.log('SUCCESS');
      });

      assertEquals(actual.status, 'ready');
      assertEquals(handler.executed, 0);

      await actual.run();

      assertEquals(actual.status, 'success');
      assertEquals(handler.executed, 1);
    });

    it(`run two task with a command and a function`, async () => {
      task('my-pretask-102-01', `pwsh -c echo 'My pre-task'`);

      const actual: Task = task('my-task-102', needs('my-pretask-102-01'), () => {
        console.log('SUCCESS');
      });

      assertEquals(actual.status, 'ready');
      assertEquals(handler.executed, 0);

      await actual.run();

      assertEquals(actual.status, 'success');
      assertEquals(handler.executed, 2);
    });

    it(`Should gets an output`, async () => {
      await task('my-task-103', `pwsh -c echo 'First Task'`, {
        output: (err: unknown, output?: unknown | string | object): void => {
          assertEquals(err, undefined);
          assertEquals((output as string)?.includes('First Task'), true);
        },
      }).run();
    });

    it(`Should gets an error output`, async () => {
      const myTask = task('my-task-104', `unknown-command`, {
        output: (err, output): void => {
          assertNotEquals(err, undefined);
          assertEquals(output, undefined);
        },
      });

      await myTask.run()
        .catch((err) => {
          assertNotEquals(err, undefined);
        });
    });
  });
});
