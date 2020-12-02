import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { pipe } from './fn.mjs';

export const root = pipe(
  fileURLToPath,
  ...Array(3).fill(dirname),
)(import.meta.url);
