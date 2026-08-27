// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

export { task, xtask } from './src/task.factory.ts';
export { needs } from './src/needs.ts';
export { handler } from './src/handler.ts';
export { Task } from './src/task.ts';
export { logger, logStream } from './src/logger.ts';
export { config, setup } from './src/config.ts';
export type { TCode, TCodeFile, TCodeFunction, TCodeOptions, TCommand, TCommandOptions, TCondition, TExecutor, TExecutorOrOptions, TGlobHashSource, TLogHandler, TLogStream, TNeeds, TNeedsOrExecutor, TOptions, TTanoConfig, TTanoConfigStrict, TTanoHandler, TTaskDefinition, TTaskParams, TTaskRunOptions, TTaskStatus } from './src/types.ts';
