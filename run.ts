import { ICommandOptions, IExecutorOptions, ITask, Task, task } from './src/task.ts';

const commandOptions: ICommandOptions = { cwd: './' };
const executorOptions: IExecutorOptions = {};

const task01: ITask = task(new Task('task01'));
const task02: ITask = task('task02', () => {});

const task03: ITask = task('task03', 'task02');
const task04: ITask = task('task04', ['task02', 'task03']);
const task05: ITask = task('task05', task04);
const task06: ITask = task('task06', [task01, task02, task03, task04, task05]);
const task07: ITask = task('task07', ['task01', task02, 'task03', task04, 'task05', task06]);

const task08: ITask = task('task08', 'task07', () => {});
const task09: ITask = task('task09', ['task07', 'task08'], () => {});
const task10: ITask = task('task10', task09, () => {});
const task11: ITask = task('task11', [task07, task08, task09, task10], () => {});
const task12: ITask = task('task12', [task07, 'task08', task09, 'task10', task11], () => {});

const task13: ITask = task('task13', 'My Command');
const task14: ITask = task('task14', 'My Command', commandOptions);
const task15: ITask = task('task15', () => {}, executorOptions);

const task16: ITask = task('task16', 'task15', () => {});
const task17: ITask = task('task17', ['task15', 'task16'], () => {});
const task18: ITask = task('task18', task17, () => {});
const task19: ITask = task('task19', [task12, task13, task14, task15, task16, task17, task18], () => {});
const task20: ITask = task('task20', ['task12', task13, 'task14', task15, 'task16', task17, 'task18', task19], () => {});

const task21: ITask = task('task21', 'task20', 'My Command');
const task22: ITask = task('task22', ['task20', 'task21'], 'My Command');
const task23: ITask = task('task23', task22, 'My Command');
const task24: ITask = task('task24', [task20, task21, task22, task23], 'My Command');
const task25: ITask = task('task25', [task20, 'task21', task22, 'task23', task24], 'My Command');

const task26: ITask = task('task26', 'task25', () => {}, executorOptions);
const task27: ITask = task('task27', ['task25', 'task26'], () => {}, executorOptions);
const task28: ITask = task('task28', task27, () => {}, executorOptions);
const task29: ITask = task('task28', [task25, task26, task27, task28], () => {}, executorOptions);
const task30: ITask = task('task30', [task25, 'task26', task27, 'task28', task29], () => {}, executorOptions);

const task31: ITask = task('task31', 'task30', 'My Command', commandOptions);
const task32: ITask = task('task32', ['task30', 'task31'], 'My Command', commandOptions);
const task33: ITask = task('task33', task32, 'My Command', commandOptions);
const task34: ITask = task('task34', [task30, task31, task32, task33], 'My Command', commandOptions);
const task35: ITask = task('task35', [task30, 'task31', task32, 'task33', task34], 'My Command', commandOptions);

task35.run();
