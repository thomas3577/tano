import { task } from './src/task.ts';

await task('task1', () => {});

await task('task2', ['task1'], () => {});
