export const consoleMock: Console = {
  // deno-lint-ignore no-unused-vars
  assert(condition?: boolean | undefined, ...data: any[]): void {},
  clear(): void {},
  // deno-lint-ignore no-unused-vars
  count(label?: string | undefined): void {},
  // deno-lint-ignore no-unused-vars
  countReset(label?: string | undefined): void {},
  // deno-lint-ignore no-unused-vars
  debug(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  dir(item?: any, options?: any): void {},
  // deno-lint-ignore no-unused-vars
  dirxml(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  error(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  group(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  groupCollapsed(...data: any[]): void {},
  groupEnd(): void {},
  // deno-lint-ignore no-unused-vars
  info(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  log(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  table(tabularData?: any, properties?: string[] | undefined): void {},
  // deno-lint-ignore no-unused-vars
  time(label?: string | undefined): void {},
  // deno-lint-ignore no-unused-vars
  timeEnd(label?: string | undefined): void {},
  // deno-lint-ignore no-unused-vars
  timeLog(label?: string | undefined, ...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  trace(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  warn(...data: any[]): void {},
  // deno-lint-ignore no-unused-vars
  timeStamp(label?: string | undefined): void {},
  // deno-lint-ignore no-unused-vars
  profile(label?: string | undefined): void {},
  // deno-lint-ignore no-unused-vars
  profileEnd(label?: string | undefined): void {},
};
