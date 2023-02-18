import { isAbsolute, join } from 'std/path/mod.ts';

export const getImportUrl = async (fileOrUrl: string): Promise<string> => {
  let importUrl: null | string = '';

  try {
    importUrl = new URL(fileOrUrl).toString();
  } catch (_: unknown) {
    const importFile: string = fileOrUrl;
    const importPath: string = isAbsolute(importFile) ? importFile : join(Deno.cwd(), importFile);

    try {
      const stat = await Deno.stat(importPath);
      if (!stat.isFile) {
        throw new Error(`The path ${importPath} is not a file.`);
      }
    } catch (err: unknown) {
      throw err;
    }

    importUrl = join('file:', importPath);
  }

  return importUrl;
};
