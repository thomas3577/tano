// Copyright 2018-2024 the tano authors. All rights reserved. MIT license.

export { task, xtask } from './src/task.factory.ts';
export { needs } from './src/needs.ts';
export { handler } from './src/handler.ts';
export { Task } from './src/task.ts';
export { logger, logStream } from './src/logger.ts';
export { setup } from './src/tano.config.ts';
export type { Code, CodeFile, CodeFunction, CodeOptions, Command, CommandOptions, Condition, GlobHashSource, LogHandler, LogStream, Needs, TanoConfig, TanoHandler, TaskParams, TaskStatus } from './src/types.ts';
