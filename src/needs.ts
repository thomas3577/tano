import type { Needs, TaskParams } from './definitions.ts';

export const needs = (...values: Array<string | TaskParams>): Needs => ({
  values,
});
