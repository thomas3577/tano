import { Task, task } from './src/task.ts';

const task1: Task = task('task1', () => {});
const task2: Task = task('task2', ['task1'], () => {});
const task3: Task = task('task3', [task2], () => {});
