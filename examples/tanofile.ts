import { Logger, logger, needs, task } from '../mod.ts';

import { task07 } from './tanofile.task.ts';

const log: Logger = logger();

task(
  'default',
  needs(
    task('My task 01', `pwsh -c echo 'Hello World from pwsh.'`),
    task('My task 02', () => console.log('Hello World from code at repl.'), { repl: true }),
    task('My task 03', { file: 'tanofile.code.ts' }),
    task('My task 04', async (): Promise<void> => {
      return await new Promise((resolve) => {
        setTimeout(() => {
          console.log('Hello world delayed from async Promise.');
          resolve();
        }, 200);
      });
    }),
    task('My task 05', (done) => {
      setTimeout(() => {
        console.log('Hello world delayed from callback function.');
        done();
      }, 200);
    }),
    task07,
    task('My task 08', async () => {
      const deno = await Deno.readTextFile('../deno.json');

      console.dir(deno);
    }, {
      args: ['--allow-write'],
      output: (_, result) => {
        log.info(_);
        log.info(result);
      },
    }),
    task('My task 09', async () => {
      const deno = await Deno.readTextFile('../deno.json');

      console.dir(deno);
    }, {
      args: ['--allow-write'],
      logThis: true,
    }),
  ),
  `pwsh -c echo 'The END!'`,
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

task('output-01', `pwsh -c echo 'OUTPUT'`, {
  output: (_, result) => {
    console.log('Result', result);
    log.info('Output 01');
  },
});

task('log-this-01', `pwsh -c echo 'OUTPUT'`, {
  logThis: true,
});
