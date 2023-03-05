import { needs, task } from './mod.ts';

task('upgrade', 'deno install --allow-read --allow-run --allow-env --allow-write -f -n tano --config ./deno.json ./tano.ts');
task('fmt', 'deno fmt --check');
task('lint', 'deno lint');
task('test', 'deno test -A');
task('run', 'deno task run');
task('default', needs('upgrade'));
