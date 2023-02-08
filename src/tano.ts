import { isAbsolute, join } from 'std/path/mod.ts';

try {
  const importFile: string = Deno.args[0] || 'tanofile.ts';
  const importPath: string = isAbsolute(importFile) ? join('file:', importFile) : join('file:', Deno.cwd(), importFile);

  await import(importPath);
} catch (err: unknown) {
  console.error(err);
}
