import { bold, gray, red } from 'std/fmt/colors.ts';
import { format } from 'std/fmt/duration.ts';

import { Logger, logger } from './logger.ts';
import { Handler, handler } from './handler.ts';
import { isCode, isCommand } from './helper.ts';

import type { Code, CodeFunction, CodeOptions, Command, CommandOptions, Condition, Executor, Options, TaskParams, TaskStatus } from './definitions.ts';

type TaskType = 'command' | 'code' | undefined;

const toCommand = (commandOrCode?: Executor): Command => {
  return (isCommand(commandOrCode) ? commandOrCode : undefined as unknown) as Command;
};

const toCode = (commandOrCode?: Executor): Code => {
  return (isCode(commandOrCode) ? commandOrCode : undefined as unknown) as Code;
};

/**
 * Creates a new Task.
 */
export class Task implements TaskParams {
  readonly #log: Logger = logger();
  readonly #created: Date = new Date();
  readonly #handler: Handler = handler;
  readonly #name: string;
  readonly #needs: Array<string>;
  readonly #executor: Executor;
  readonly #options: Options;
  readonly #type: TaskType = undefined;
  #status: TaskStatus = 'ready';
  #starting: null | PerformanceMark = null;
  #finished: null | PerformanceMark = null;
  #measure: null | PerformanceMeasure = null;
  #process: null | Deno.Process = null;

  /**
   * Creates a new instance ot Task.
   *
   * @param {string | TaskParams} nameOrTask - The name or an object which provides all task parameters.
   * @param {string[]=[]} needs - Defines the dependencies which should be executed before this task.
   * @param {Command | Code} executor - A command, function or JS/TS-file to execute.
   * @param {Options} options - Options, depending on whether the executor is of type Command or Code.
   */
  constructor(nameOrTask: string | TaskParams, needs: Array<string> = [], executor?: Executor, options?: Options) {
    const task: TaskParams = typeof nameOrTask === 'object' ? nameOrTask as unknown as TaskParams : {
      name: nameOrTask as string,
      needs,
      executor,
      options,
    };

    this.#name = task.name;
    this.#needs = task.needs as Array<string>;
    this.#executor = task.executor as Command;
    this.#options = task.options as Options;
    this.#handler.add(this);

    if (isCommand(executor)) {
      this.#type = 'command';
    } else if (isCode(executor)) {
      this.#type = 'code';
    }
  }

  /**
   * Unique name of the task.
   */
  get name(): string {
    return this.#name;
  }

  /**
   * Status of the task.
   */
  get status(): TaskStatus {
    return this.#status;
  }

  /**
   * Timestamp when the handler was created.
   */
  get created(): Date {
    return this.#created;
  }

  /**
   * Performance mark when the last run starts.
   */
  get starting(): null | PerformanceMark {
    return this.#starting;
  }

  /**
   * Performance mark when the last run ends.
   */
  get finished(): null | PerformanceMark {
    return this.#finished;
  }

  /**
   * Performance measure of the last run.
   */
  get measure(): null | PerformanceMeasure {
    return this.#measure;
  }

  /**
   * Task that must be executed before this task is executed.
   */
  get needs(): Array<string> {
    return this.#needs;
  }

  /**
   * The command or code that will be executed by this task if it is set.
   */
  get executor(): Executor {
    return this.#executor;
  }

  /**
   * Options, depending on whether the executor is of type Command or Code.
   */
  get options(): Options {
    return this.#options;
  }

  /**
   * Gets the current process.
   */
  get process(): null | Deno.Process {
    return this.#process;
  }

  /**
   * Executes all dependent tasks and its own.
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async run(): Promise<void> {
    await this.#handler.run(this.#name);
  }

  /**
   * Executes only this task (without the dependencies).
   *
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async runThis(): Promise<void> {
    if (this.#type === undefined) {
      return;
    }

    if (this.#status !== 'ready') {
      throw new Error(`The task '${this.#name}' has already been run.`);
    }

    const result: boolean = await this.#executeCondition(this.#options?.condition || ((): boolean => true));
    if (!result) {
      this.#log.warning('');
      this.#log.warning(`Task {name} not started. The conditions of this task were not matched.`, {
        name: `'${gray(this.#name)}'`,
      });

      return;
    }

    this.#preRun();

    await this.#run(this.#type, this.#executor, this.#options)
      .catch((err) => {
        this.#status = 'failed';

        this.#log.error(`${bold(red('Error'))} {name}: ${err}`, {
          name: `'${gray(this.#name)}'`,
        });

        throw err;
      });

    this.#postRun();
  }

  /**
   * Resets the task so that it can be executed again.
   */
  reset(): void {
    this.#starting = null;
    this.#finished = null;
    this.#process = null;
    this.#status = 'ready';
  }

  #preRun(): void {
    this.#log.info('');
    this.#log.info(`Starting {name}...`, {
      name: `'${gray(this.#name)}'`,
    });

    if (this.#options?.description) {
      this.#log.info(`Description: ${gray(this.#options.description)}`);
    }

    this.#finished = null;
    this.#starting = performance.mark(`starting_${this.#name}`, {
      startTime: Date.now(),
    });

    this.#status = 'running';
  }

  #postRun(): void {
    this.#status = 'success';

    this.#finished = performance.mark(`finished_${this.#name}`, {
      startTime: Date.now(),
    });

    this.#measure = performance.measure(this.#name, `starting_${this.#name}`, `finished_${this.#name}`);

    this.#log.info(`Finished {name} after {duration}`, {
      name: `'${gray(this.#name)}'`,
      duration: `${bold(format(this.#measure.duration, { ignoreZero: true }))}`,
    });
  }

  async #run(type: TaskType, executor: Executor, options: Options): Promise<void> {
    if (type === 'command') {
      await this.#runCommand(toCommand(executor), options);
    } else if (this.#type === 'code') {
      await this.#runCode(toCode(executor), options);
    }
  }

  async #runCommand(command: Command, options: CommandOptions): Promise<void> {
    this.#process = Deno.run({
      cmd: Array.isArray(command) ? command : command.split(' '),
      cwd: options?.cwd || Deno.cwd(),
      env: options?.env,
      stdout: options?.stdout || 'piped',
      stderr: options?.stderr || 'piped',
      stdin: options?.stdin || 'null',
    });

    const status: Deno.ProcessStatus = await this.#process.status();
    const rawOutput: Uint8Array = await this.#process.output();
    const rawError: Uint8Array = await this.#process.stderrOutput();

    if (status.code === 0) {
      await Deno.stdout.write(rawOutput);

      this.#process.close();
    } else {
      await Promise.reject(new TextDecoder().decode(rawError));

      this.#process.kill();
    }
  }

  async #runCode(code: Code, options: CodeOptions): Promise<void> {
    if (typeof code === 'function') {
      if (options?.repl) {
        const funcAsString = code.toString();
        const command: Command = ['deno', 'repl', '--eval', `(${funcAsString})(); close();`];

        return await this.#runCommand(command, options);
      }

      return await this.#executeCodeFunction(code);
    }

    const file: string = code.file instanceof URL ? code.file.toString() : code.file;
    const command: Command = ['deno', 'run', ...(options?.args || []), file];

    return await this.#runCommand(command, options);
  }

  async #executeCodeFunction(code: CodeFunction): Promise<void> {
    return code.length > 0 ? await new Promise((resolve) => code(() => resolve())) : await Promise.resolve(code(() => {}));
  }

  async #executeCondition(condition: Condition): Promise<boolean> {
    return condition.length > 0 ? await new Promise((resolve) => condition((result: boolean) => resolve(result))) : await Promise.resolve(condition(() => true));
  }
}
