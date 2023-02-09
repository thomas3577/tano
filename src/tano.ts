import { isAbsolute, join } from 'std/path/mod.ts';
import { handler } from './handler.ts';

try {
  const importFile: string = Deno.args[0] || 'tanofile.ts';
  const importPath: string = isAbsolute(importFile) ? join('file:', importFile) : join('file:', Deno.cwd(), importFile);

  await import(importPath);

  handler.run();
} catch (err: unknown) {
  console.error(err);
}
