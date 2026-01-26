/**
 * JSON output formatter
 */

import type { ValidationResult } from '../core/types.js';
import type { Formatter } from './formatter.js';

/** JSON formatter */
export const jsonFormatter: Formatter = {
  format(result: ValidationResult): string {
    return JSON.stringify(result, null, 2);
  }
};

/** Create JSON formatter */
export function createJsonFormatter(): Formatter {
  return jsonFormatter;
}
