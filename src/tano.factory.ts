import { isAbsolute, join } from 'std/path/mod.ts';

export const getImportUrl = (fileOrUrl: string): string => {
  let importUrl: null | string = null;

  try {
    importUrl = new URL(fileOrUrl).toString();
  } catch (_: unknown) {
    const importFile: string = fileOrUrl;
    const importPath: string = isAbsolute(importFile) ? importFile : join(Deno.cwd(), importFile);

    importUrl = join('file:', importPath);
  }

  return importUrl;
};
