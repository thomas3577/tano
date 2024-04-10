import { needs, task } from './mod.ts';

task('fmt', 'deno fmt --check');
task('lint', 'deno lint');
task('cache', 'deno task cache');
task('test', 'deno task test');
task('run', 'deno task run');
task('default', needs('fmt', 'lint', 'cache', 'test', 'run'));
