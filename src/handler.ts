import { IHandler, ITask } from './definitions.ts';

export class Handler implements IHandler {
  private readonly _createdAt: Date = new Date();
  private readonly _cache: Map<string, ITask> = new Map();
  private _startsAt: null | Date = null;
  private _endsAt: null | Date = null;

  /**
   * Timestamp when the handler was created.
   */
  public get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Timestamp when the last run starts.
   */
  public get startsAt(): null | Date {
    return this._startsAt;
  }

  /**
   * Timestamp when the last run ends.
   */
  public get endsAt(): null | Date {
    return this._endsAt;
  }

  /**
   * Gets the number of tasks that are in the cache.
   */
  public get count(): number {
    return this._cache.size;
  }

  /**
   * Adds a task to the cache.
   *
   * @param task - A task to add.
   */
  public add(task: ITask): void {
    if (this._cache.has(task.name)) {
      throw new Error(`Task with the name '${task.name}' already exists.`);
    }

    this._cache.set(task.name, task);
  }

  /**
   * Runs the Task.
   *
   * @param taskName - Name of the task.
   */
  public async run(taskName: string = 'default'): Promise<void> {
    this._endsAt = null;
    this._startsAt = new Date();

    const taskNames: string[] = this._createPlan(taskName);

    for (const tn of taskNames) {
      await this._cache.get(tn)?.run();
    }

    this._endsAt = new Date();
  }

  /**
   * Resets all tasks.
   */
  public reset(): void {
    this._cache.forEach((task: ITask) => task.reset());
  }

  /**
   * Clears the cache.
   */
  public clear(): void {
    this._cache.clear();
  }

  private _createPlan(taskName: string, taskNames: string[] = []): string[] {
    if (this._cache.has(taskName)) {
      const task: ITask = this._cache.get(taskName) as ITask;

      if (task && task.required && task.required?.length > 0) {
        task.required.forEach((tn) => this._createPlan(tn, taskNames));
      }

      taskNames.push(taskName);
    }

    return taskNames;
  }
}

export const handler: IHandler = new Handler();
