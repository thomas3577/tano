import { join } from 'std/path/mod.ts';

try {
  const importFile: string = Deno.env.get('TANO_FILE') || 'tanofile.ts';
  const importPath: string = join('file:', Deno.cwd(), importFile);

  await import(importPath);
} catch (err) {
  console.error(err);
}
