import { needs, task } from './mod.ts';

task('fmt', 'deno fmt --check');
task('lint', 'deno lint');
task('cache', 'deno task cache');
task('test', 'deno task test');
task('run', 'deno task run');
task('upgrade', 'deno install --unstable-kv --allow-read --allow-run --allow-env --allow-write -f -n tano --config ./deno.json ./tano.ts');
task('default', needs('fmt', 'lint', 'cache', 'test', 'run', 'upgrade'));
