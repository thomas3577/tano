import type { Needs, TaskParams } from './types.ts';

export const needs = (...values: Array<string | TaskParams>): Needs => ({
  values,
});
