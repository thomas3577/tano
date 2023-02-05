import { ITask } from './src/definitions.ts';
import { task } from './src/task.ts';

const myTask: ITask = task('myTask00', 'ls', { cwd: 'C:\\' });

(myTask as any).run().catch((err: unknown) => console.error(err));
