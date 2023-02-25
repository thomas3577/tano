import { needs, task } from '../mod.ts';
import { task07 } from './tanofile.task.ts';

task(
  'default',
  needs(
    task('01', `echo 'Hello World from cmd.'`, { repl: true }),
    task('02', () => console.log('Hello World from code at repl.'), { repl: true }),
    task('03', { file: 'tanofile.code.ts' }),
    task('04', async (): Promise<void> => {
      return await new Promise((resolve) => {
        setTimeout(() => {
          console.log('Hello world delayed from async Promise.');
          resolve();
        }, 200);
      });
    }),
    task('05', (done) => {
      setTimeout(() => {
        console.log('Hello world delayed from callback function.');
        done();
      }, 200);
    }),
    task07,
    task('08', async () => {
      const deno = await Deno.readTextFile('../deno.json');

      console.dir(deno);
    }, {
      args: ['--allow-write'],
    }),
  ),
  `echo 'The END!'`,
);

task('unhappy-task-01', (done) => {
  setTimeout(() => {
    done(new Error('Shit!'));
  }, 250);
});

task('unhappy-task-02', async () => {
  await Promise.reject('Shit!');
});

task('conditions-01', async () => {
  await Promise.resolve('Yes!');
}, {
  condition: 1 + 2 === 4,
});

task('conditions-02', () => {}, {
  condition: () => {
    return false;
  },
});

task('conditions-03', () => {}, {
  condition: (done) => {
    setTimeout(() => {
      done(false);
    }, 250);
  },
});

task('conditions-04', async () => {
  await Promise.resolve('Yes!');
}, {
  condition: 1 + 2 === 3,
});

task('conditions-05', () => {}, {
  condition: () => {
    return true;
  },
});

task('conditions-06', () => {}, {
  condition: (done) => {
    setTimeout(() => {
      done(true);
    }, 250);
  },
});

task(
  'few',
  needs(
    ...Array.from(Array(100).keys()).map((key) =>
      task(`${key}`, (done) => {
        setTimeout(() => {
          console.log(`Task ${key}`);
          done();
        }, 5);
      }, { repl: true })
    ),
  ),
);
