/**
 * This Module is used to get the version of the tano app.
 * @module
 */

import { version } from '../deno.json' with { type: 'json' };

export const VERSION = version;
