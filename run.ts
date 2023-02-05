import { ICommandOptions, IExecutorOptions, ITask, Task, task } from './src/task.ts';

const commandOptions: ICommandOptions = { cwd: './' };
const executorOptions: IExecutorOptions = {};

const task01: ITask = task(new Task('task01'));
const task02: ITask = task('task02', () => {});

const task03: ITask = task('task03', ['task02', 'task03']);
const task04: ITask = task('task04', [task01, task02, task03]);
const task05: ITask = task('task05', ['task01', task02, 'task03', task04]);

const task06: ITask = task('task06', ['task04', 'task05'], () => {});
const task07: ITask = task('task07', [task04, task05, task06], () => {});
const task08: ITask = task('task08', ['task04', task05, 'task06', task07], () => {});

const task09: ITask = task('task09', 'My Command');
const task10: ITask = task('task10', 'My Command', commandOptions);
const task11: ITask = task('task11', () => {}, executorOptions);

const task12: ITask = task('task12', ['task08', 'task09'], () => {});
const task13: ITask = task('task13', [task08, task09, task10, task11, task12], () => {});
const task14: ITask = task('task14', ['task08', task09, 'task10', task11, 'task12', task13], () => {});

const task15: ITask = task('task15', ['task13', 'task14'], 'My Command');
const task16: ITask = task('task16', [task13, task14, task15], 'My Command');
const task17: ITask = task('task17', ['task13', task14, 'task15', task16], 'My Command');

const task18: ITask = task('task18', ['task16', 'task17'], () => {}, executorOptions);
const task19: ITask = task('task19', [task16, task17, task18], () => {}, executorOptions);
const task20: ITask = task('task20', ['task16', task17, 'task18', task19], () => {}, executorOptions);

const task21: ITask = task('task21', ['task19', 'task20'], 'My Command', commandOptions);
const task22: ITask = task('task22', [task19, task20, task21], 'My Command', commandOptions);
const task23: ITask = task('task23', ['task19', task20, 'task21', task22], 'My Command', commandOptions);

task23.run();
