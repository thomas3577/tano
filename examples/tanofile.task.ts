import { needs, task } from '../mod.ts';
import type { Task } from '../mod.ts';

task('My task 06', `pwsh -c echo 'Task 06'`);

export const task07: Task = task('My task 07', needs('My task 06'), `pwsh -c echo 'Task 07'`);
