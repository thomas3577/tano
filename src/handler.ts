import { IHandler, ITask } from './definitions.ts';

export class Handler implements IHandler {
  private readonly _createdAt: Date = new Date();
  private readonly _cache: Map<string, ITask> = new Map();

  public get createdAt(): null | Date {
    return this._createdAt;
  }

  public add(task: ITask): void {
    if (this._cache.has(task.name)) {
      throw new Error(`Task with the name '${task.name}' already exists.`);
    }

    this._cache.set(task.name, task);
  }

  public async run(): Promise<void> {
    for (const task of this._cache.values()) {
      await task.run();
    }
  }
}

export const handler: IHandler = new Handler();
