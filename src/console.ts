// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * Just a mock for the console object.
 *
 * @module
 */

// deno-lint-ignore-file no-unused-vars no-explicit-any
export const consoleMock: Console = {
  assert(condition?: boolean | undefined, ...data: any[]): void {},
  clear(): void {},
  count(label?: string | undefined): void {},
  countReset(label?: string | undefined): void {},
  debug(...data: any[]): void {},
  dir(item?: any, options?: any): void {},
  dirxml(...data: any[]): void {},
  error(...data: any[]): void {},
  group(...data: any[]): void {},
  groupCollapsed(...data: any[]): void {},
  groupEnd(): void {},
  info(...data: any[]): void {},
  log(...data: any[]): void {},
  table(tabularData?: any, properties?: string[] | undefined): void {},
  time(label?: string | undefined): void {},
  timeEnd(label?: string | undefined): void {},
  timeLog(label?: string | undefined, ...data: any[]): void {},
  trace(...data: any[]): void {},
  warn(...data: any[]): void {},
  timeStamp(label?: string | undefined): void {},
  profile(label?: string | undefined): void {},
  profileEnd(label?: string | undefined): void {},
};
