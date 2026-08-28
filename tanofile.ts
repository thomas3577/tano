// Copyright 2018-2026 the tano authors. All rights reserved. MIT license.

import { needs, task } from './mod.ts';

task('fmt', 'deno fmt --check', { description: 'Verifies the formatting' });
task('lint', 'deno lint', { description: 'Runs the linter' });
task('check', 'deno check', { description: 'Type checks the project' });
task('test', 'deno task test', { description: 'Runs the tests' });
task('run', 'deno task run', { description: 'Runs the examples' });
task('default', needs('fmt', 'lint', 'check', 'test', 'run'));
