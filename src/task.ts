import { Command, CommandOrExecutorOrOptions, Executor, ITask, Options, RequiredOrCommandOrExecutor, TaskDefinition } from './definitions.ts';
import { getCommand, getExecutor, getOptions, getRequired } from './utils.ts';

export class Task implements ITask {
  private readonly _name: string;
  private readonly _required: Array<string>;
  private readonly _command: Command;
  private readonly _executor: Executor;
  private readonly _options: Options;

  constructor(nameOrTask: string | ITask, required: Array<string> = [], command?: Command, executor?: Executor, options?: Options) {
    if (typeof nameOrTask === 'object') {
      const task: ITask = nameOrTask as ITask;
      this._name = task.name;
      this._required = task.required as Array<string>;
      this._command = task.command as Command;
      this._executor = task.executor as Executor;
      this._options = task.options as Options;
    } else if (typeof nameOrTask === 'string') {
      this._name = nameOrTask;
      this._required = required as Array<string>;
      this._command = command as Command;
      this._executor = executor as Executor;
      this._options = options as Options;
    } else {
      throw new Error(`Wrong type of first argument.`);
    }
  }

  public get name(): string {
    return this._name;
  }

  public get required(): Array<string> {
    return this._required;
  }

  public get command(): Command {
    return this._command;
  }

  public get executor(): Executor {
    return this._executor;
  }

  public get options(): Options {
    return this._options;
  }

  public run(..._args: any[]): void {
    throw new Error('Method not implemented.');
  }
}

export const task: TaskDefinition = (name: string | ITask, param1?: RequiredOrCommandOrExecutor, param2?: CommandOrExecutorOrOptions, param3?: Options): ITask => {
  const required: Array<string> = getRequired(param1);
  const command: Command = getCommand(param1, param2);
  const executor: Executor = getExecutor(param1, param2);
  const options: Options = getOptions(param2, param3);
  const instance: ITask = new Task(name, required, command, executor, options);

  return instance;
};
