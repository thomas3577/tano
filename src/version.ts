// Copyright 2018-2025 the tano authors. All rights reserved. MIT license.

/**
 * This Module is used to get the version of the tano app.
 *
 * @module
 */

import deno from '../deno.json' with { type: 'json' };

/**
 * Version of tano
 */
export const VERSION: string = deno.version;
