import { needs, task } from '../mod.ts';

task('06', `echo 'Task 06'`);

export const task07 = task('07', needs('06'), `echo 'Task 07'`);
