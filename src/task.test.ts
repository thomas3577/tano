import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';

import { ITask, ITaskParams } from './definitions.ts';
import { Task, task } from './task.ts';

describe(task.name, () => {
  it(`Task Var 00`, () => {
    const myTask: ITask = task('my-task-00', []);

    assertEquals(myTask.name, 'my-task-00');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 01`, () => {
    const myTask: ITask = task(new Task('my-task-01'));

    assertEquals(myTask.name, 'my-task-01');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 02`, () => {
    const myTask: ITask = task('my-task-02', () => {});

    assertEquals(myTask.name, 'my-task-02');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 03`, () => {
    const myTask: ITask = task('my-task-03', ['my-pretask-031', 'my-pretask-032']);

    assertEquals(myTask.name, 'my-task-03');
    assertEquals(myTask.required, ['my-pretask-031', 'my-pretask-032']);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 04`, () => {
    const myPreTaskOne: ITask = task('my-pretask-041', ['my-pre-pretask-0411']);
    const myPreTaskTwo: ITask = task('my-pretask-042', ['my-pre-pretask-0421']);
    const myTask: ITask = task('my-task-04', [myPreTaskOne, myPreTaskTwo]);

    assertEquals(myTask.name, 'my-task-04');
    assertEquals(myTask.required, ['my-pretask-041', 'my-pretask-042']);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 05`, () => {
    const myPreTaskOne: ITask = task('my-pretask-051', ['my-pre-pretask-0511', 'my-pre-pretask-0512']);
    const myTask: ITask = task('my-task-05', [myPreTaskOne, 'my-pretask-052']);

    assertEquals(myTask.name, 'my-task-05');
    assertEquals(myTask.required, ['my-pretask-051', 'my-pretask-052']);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 06`, () => {
    const myTask: ITask = task('my-task-06', ['my-pretask-061', 'my-pretask-062'], () => {});

    assertEquals(myTask.name, 'my-task-06');
    assertEquals(myTask.required, ['my-pretask-061', 'my-pretask-062']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 07`, () => {
    const myPreTaskOne: ITask = task('my-pretask-071', ['my-pre-pretask-071']);
    const myPreTaskTwo: ITask = task('my-pretask-072', ['my-pre-pretask-072']);
    const myTask: ITask = task('my-task-07', [myPreTaskOne, myPreTaskTwo], () => {});

    assertEquals(myTask.name, 'my-task-07');
    assertEquals(myTask.required, ['my-pretask-071', 'my-pretask-072']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 08`, () => {
    const myPreTaskOne: ITask = task('my-pretask-081', ['my-pre-pretask-0811', 'my-pre-pretask-0812']);
    const myTask: ITask = task('my-task-08', [myPreTaskOne, 'my-pretask-082'], () => {});

    assertEquals(myTask.name, 'my-task-08');
    assertEquals(myTask.required, ['my-pretask-081', 'my-pretask-082']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 09`, () => {
    const myTask: ITask = task('my-task-09', 'My Command');

    assertEquals(myTask.name, 'my-task-09');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 10`, () => {
    const myTask: ITask = task('my-task-10', 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task-10');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 11`, () => {
    const myTask: ITask = task('my-task-11', () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task-11');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 12`, () => {
    const myTask: ITask = task('my-task-12', ['my-pretask-121', 'my-pretask-122'], 'My Command');

    assertEquals(myTask.name, 'my-task-12');
    assertEquals(myTask.required, ['my-pretask-121', 'my-pretask-122']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 13`, () => {
    const myPreTaskOne: ITask = task('my-pretask-131', ['my-pre-pretask-1311']);
    const myPreTaskTwo: ITask = task('my-pretask-132', ['my-pre-pretask-1321']);
    const myTask: ITask = task('my-task-13', [myPreTaskOne, myPreTaskTwo], 'My Command');

    assertEquals(myTask.name, 'my-task-13');
    assertEquals(myTask.required, ['my-pretask-131', 'my-pretask-132']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 14`, () => {
    const myPreTaskOne: ITask = task('my-pretask-141', ['my-pre-pretask-1411', 'my-pre-pretask-1412']);
    const myTask: ITask = task('my-task-14', [myPreTaskOne, 'my-pretask-142'], 'My Command');

    assertEquals(myTask.name, 'my-task-14');
    assertEquals(myTask.required, ['my-pretask-141', 'my-pretask-142']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });

  it(`Task Var 15`, () => {
    const myTask: ITask = task('my-task-15', ['my-pretask-151', 'my-pretask-152'], () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task-15');
    assertEquals(myTask.required, ['my-pretask-151', 'my-pretask-152']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 16`, () => {
    const myPreTaskOne: ITask = task('my-pretask-161', ['my-pre-pretask-1611']);
    const myPreTaskTwo: ITask = task('my-pretask-162', ['my-pre-pretask-1621']);
    const myTask: ITask = task('my-task-16', [myPreTaskOne, myPreTaskTwo], () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task-16');
    assertEquals(myTask.required, ['my-pretask-161', 'my-pretask-162']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 17`, () => {
    const myPreTaskOne: ITask = task('my-pretask-171', ['my-pre-pretask-1711', 'my-pre-pretask-1712']);
    const myTask: ITask = task('my-task-17', [myPreTaskOne, 'my-pretask-172'], () => {}, { cwd: './' });

    assertEquals(myTask.name, 'my-task-17');
    assertEquals(myTask.required, ['my-pretask-171', 'my-pretask-172']);
    assertEquals(myTask.command, undefined);
    assertEquals(typeof myTask.executor, 'function');
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 18`, () => {
    const myTask: ITask = task('my-task-18', ['my-pretask-181', 'my-pretask-182'], 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task-18');
    assertEquals(myTask.required, ['my-pretask-181', 'my-pretask-182']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 19`, () => {
    const myPreTaskOne: ITask = task('my-pretask-191', ['my-pre-pretask-1911']);
    const myPreTaskTwo: ITask = task('my-pretask-192', ['my-pre-pretask-1912']);
    const myTask: ITask = task('my-task-19', [myPreTaskOne, myPreTaskTwo], 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task-19');
    assertEquals(myTask.required, ['my-pretask-191', 'my-pretask-192']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 20`, () => {
    const myPreTaskOne: ITask = task('my-pretask-201', ['my-pre-pretask-2011', 'my-pre-pretask-2012']);
    const myTask: ITask = task('my-task-20', [myPreTaskOne, 'my-pretask-202'], 'My Command', { cwd: './' });

    assertEquals(myTask.name, 'my-task-20');
    assertEquals(myTask.required, ['my-pretask-201', 'my-pretask-202']);
    assertEquals(myTask.command, 'My Command');
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, { cwd: './' });
  });

  it(`Task Var 21`, () => {
    const taskParams: ITaskParams = {
      name: 'my-task-21',
    };

    const myTask: ITask = task(taskParams);

    assertEquals(myTask.name, 'my-task-21');
    assertEquals(myTask.required, []);
    assertEquals(myTask.command, undefined);
    assertEquals(myTask.executor, undefined);
    assertEquals(myTask.options, undefined);
  });
});
