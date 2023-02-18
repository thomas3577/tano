import { needs, task } from '../mod.ts';
import { task07 } from './tanofile.task.ts';

task(
  'default',
  needs(
    task('01', `echo 'Hello World from cmd.'`, { repl: true }),
    task('02', () => console.log('Hello World from code at repl.'), { repl: true }),
    task('03', { file: 'tanofile.code.ts' }, { cwd: './examples' }),
    task('04', async (): Promise<void> => {
      return await new Promise((r) => {
        setTimeout(() => {
          console.log('Hello world delayed from async Promise.');
          r();
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
      const deno = await Deno.readTextFile('./deno.json');

      console.dir(deno);
    }, {
      args: ['--allow-write'],
    }),
  ),
  `echo 'The END!'`,
);
