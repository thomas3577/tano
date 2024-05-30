/**
 * This Module is used to get the version of the tano app.
 * @module
 */

import deno from '../deno.json' with { type: 'json' };

/**
 * Version of tano
 */
export const VERSION: string = deno.version;
