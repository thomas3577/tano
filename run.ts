import { ICommandOptions, IExecutorOptions, Task, task } from './src/task.ts';

const commandOptions: ICommandOptions = { cwd: './' };
const executorOptions: IExecutorOptions = {};

const task01: Task = task('task01', () => {});

const task02: Task = task('task02', 'task01');
const task03: Task = task('task03', ['task01', 'task02']);
const task04: Task = task('task04', task03);
const task05: Task = task('task05', [task01, task02, task03, task04]);
const task06: Task = task('task05', ['task01', task02, 'task03', task04]);

const task07: Task = task('task07', 'task06', () => {});
const task08: Task = task('task08', ['task06', 'task07'], () => {});
const task09: Task = task('task09', task08, () => {});
const task10: Task = task('task10', [task05, task06, task07, task08, task09], () => {});
const task11: Task = task('task11', ['task05', task06, 'task07', task08, 'task09'], () => {});

const task12: Task = task('task12', 'My Command');
const task13: Task = task('task13', 'My Command', commandOptions);
const task14: Task = task('task14', () => {}, executorOptions);

const task15: Task = task('task15', 'task14', () => {});
const task16: Task = task('task16', ['task14', 'task15'], () => {});
const task17: Task = task('task17', task16, () => {});
const task18: Task = task('task18', [task10, task11, task12, task13, task14, task15, task16, task17], () => {});
const task19: Task = task('task19', [task10, 'task11', task12, 'task13', task14, 'task15', task16, 'task17', task18], () => {});

const task20: Task = task('task20', 'task19', 'My Command');
const task21: Task = task('task21', ['task19', 'task20'], 'My Command');
const task22: Task = task('task22', task19, 'My Command');
const task23: Task = task('task23', [task19, task20, task21, task22], 'My Command');
const task24: Task = task('task24', [task19, 'task20', task21, 'task22', task23], 'My Command');

const task25: Task = task('task25', 'task24', () => {}, executorOptions);
const task26: Task = task('task26', ['task24', 'task25'], () => {}, executorOptions);
const task27: Task = task('task27', task26, () => {}, executorOptions);
const task28: Task = task('task28', [task24, task25, task26, task27], () => {}, executorOptions);
const task29: Task = task('task29', [task24, 'task25', task26, 'task27', task28], () => {}, executorOptions);

const task30: Task = task('task30', 'task29', 'My Command', commandOptions);
const task31: Task = task('task31', ['task29', 'task30'], 'My Command', commandOptions);
const task32: Task = task('task32', task29, 'My Command', commandOptions);
const task33: Task = task('task33', [task29, task30, task31, task32], 'My Command', commandOptions);
const task34: Task = task('task34', [task29, 'task30', task31, 'task32', task33], 'My Command', commandOptions);

task34.run();
