# Command line interface

## Arguments

| name             | value    | default       | description                                                      |
| ---------------- | -------- | ------------- | ---------------------------------------------------------------- |
| --file           | `string` | `tanofile.ts` | Here you can define your tasks.                                  |
| --task           | `string` | `default`     | Defines which task should be executed.                           |
| --log-level      | `string` | `INFO`        | More [here](https://deno.land/std@0.151.0/log/levels.ts?source). |
| --quiet          |          |               | Turns off the logs.                                              |
| --abort-on-error |          |               | Cancel after the first error.                                    |
