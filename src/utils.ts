import { Command, Executor, Options } from './definitions.ts';

export const getRequired = (param1: any): Array<string> => {
  if (Array.isArray(param1)) {
    return param1.map((item) => typeof item === 'object' ? item.name : item).filter((item) => item !== undefined);
  }

  return [];
};

export const getCommand = (param1: any, param2: any): Command => {
  if (typeof param2 === 'string') {
    return param2;
  } else if (typeof param1 === 'string') {
    return param1;
  }

  return undefined as unknown as Command;
};

export const getExecutor = (param1: any, param2: any): Executor => {
  if (typeof param1 === 'function') {
    return param1;
  } else if (typeof param2 === 'function') {
    return param2;
  }

  return undefined as unknown as Executor;
};

export const getOptions = (param2: any, param3: any): Options => {
  if (typeof param2 === 'object') {
    return param2;
  } else if (typeof param3 === 'object') {
    return param3;
  }

  return undefined as unknown as Options;
};
