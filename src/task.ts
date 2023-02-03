export interface IOptionsBase {
	description: string;
}

export interface IExecutorOptions extends IOptionsBase { }

export interface ICommandOptions extends IOptionsBase {
	cwd: string;
	executor: <T>(command: string, ...args: any[]) => T | Promise<T>
}

export type Options = IExecutorOptions | ICommandOptions;

export type Executor = (...args: any[]) => void

export type CommandOrExecutorOrOptions = string | Array<string> | Executor | Options;

export type Required = string | Array<string> | Task | Array<Task> | Array<string | Task>

export type RequiredOrCommandOrExecutor = Required | Executor;

export type Task = {
	(name: string, required?: string): Promise<void>,
	(name: string, required?: Array<string>): Promise<void>,
	(name: string, required?: Task): Promise<void>,
	(name: string, required?: Array<Task>): Promise<void>,
	(name: string, required?: Array<string | Task>): Promise<void>,

	(name: string, commands?: string, options?: ICommandOptions): Promise<void>,
	(name: string, commands?: Array<string>, options?: ICommandOptions): Promise<void>,
	(name: string, executor?: Executor, options?: IExecutorOptions): Promise<void>,

	(name: string, required?: string, command?: string, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Array<string>, command?: string, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Task, command?: string, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Array<Task>, command?: string, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Array<string | Task>, command?: string, options?: ICommandOptions): Promise<void>;

	(name: string, required?: string, commands?: Array<string>, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Array<string>, commands?: Array<string>, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Task, commands?: Array<string>, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Array<Task>, commands?: Array<string>, options?: ICommandOptions): Promise<void>;
	(name: string, required?: Array<string | Task>, commands?: Array<string>, options?: ICommandOptions): Promise<void>;

	(name: string, required?: string, executor?: Executor, options?: IExecutorOptions): Promise<void>;
	(name: string, required?: Array<string>, executor?: Executor, options?: IExecutorOptions): Promise<void>;
	(name: string, required?: Task, executor?: Executor, options?: IExecutorOptions): Promise<void>;
	(name: string, required?: Array<Task>, executor?: Executor, options?: IExecutorOptions): Promise<void>;
	(name: string, required?: Array<string | Task>, executor?: Executor, options?: IExecutorOptions): Promise<void>;
};

export const task: Task = async (name: string, param1?: RequiredOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): Promise<void> => {
  return;
};
