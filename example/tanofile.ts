import { needs, task } from './mod.ts';

task(
  'default',
  needs(
    task('01', () => console.log('This was great!'), { repl: true }),
    task('02', { file: 'tanofile.code.ts' }),
  ),
  `echo 'The END!'`,
);
