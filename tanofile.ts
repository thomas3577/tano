import { needs, task } from './mod.ts';

task('upgrade', 'deno install --allow-read --allow-run --allow-env --allow-write -f -n tano --config ./deno.json ./tano.ts');
task('fmt', 'deno fmt');
task('lint', 'deno lint');
task('test', 'deno test -A');
task('run', 'deno task run');
task('lock', 'deno cache --lock=deno.lock --lock-write tano.ts');
task('default', needs('fmt', 'lint', 'test', 'run', 'upgrade'));
