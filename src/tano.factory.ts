import { dirname, fromFileUrl, isAbsolute, join, toFileUrl } from '$std/path/mod.ts';

/**
 * Gets a valid import url.
 * @param {String} fileOrUrl - A path or URL to a tanofile.
 *
 * @returns A valid import url.
 */
export const getImportUrl = async (fileOrUrl: string): Promise<string> => {
  let importUrl: null | URL = null;

  try {
    importUrl = new URL(fileOrUrl);
  } catch (_: unknown) {
    const importFile: string = fileOrUrl;
    const importPath: string = isAbsolute(importFile) ? importFile : join(Deno.cwd(), importFile);

    try {
      const stat: Deno.FileInfo = await Deno.stat(importPath);
      if (!stat.isFile) {
        throw new Error(`The path ${importPath} is not a file.`);
      }
    } catch (err: unknown) {
      throw err;
    }

    importUrl = toFileUrl(importPath);
  }

  return importUrl.toString();
};

/**
 * Gets the current working directory depens on the import url.
 *
 * @param {String} importUrl - A valid import url.
 *
 * @returns {String} The CWD.
 */
export const getCwd = (importUrl: string): string => {
  if (!importUrl?.startsWith('file:')) {
    return Deno.cwd();
  }

  const importPath: string = fromFileUrl(importUrl);
  const importDirectory: string = dirname(importPath);

  return importDirectory;
};
