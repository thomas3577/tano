import type { INeeds, ITaskParams } from './definitions.ts';

export const needs = (...values: Array<string | ITaskParams>): INeeds => ({
  values,
});
