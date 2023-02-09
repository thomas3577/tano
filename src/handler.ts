import { IHandler, ITask } from './definitions.ts';
import { Task } from './task.ts';

class Handler implements IHandler {
  private readonly _createdAt: null | Date = null;
  private _cache: Map<string, ITask> = new Map();

  constructor() {
    this._createdAt = new Date();
  }

  public get createdAt(): null | Date {
    return this._createdAt;
  }

  public add(task: ITask): void {
    if (this._cache.has(task.name)) {
      throw new Error(`Task with the name '${task.name}' already exists.`);
    }

    this._cache.set(task.name, task);
  }

  public run(): void {
    Array.from(this._cache.keys()).forEach((key) => {
      (this._cache.get(key) as Task).run();
    });
  }
}

export const handler: IHandler = new Handler();
