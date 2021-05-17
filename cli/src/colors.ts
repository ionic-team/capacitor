import kleur from 'kleur';

import type { Colors } from '@ionic/cli-framework-output';

export const strong = kleur.bold;
export const weak = kleur.dim;
export const input = kleur.cyan;
export const success = kleur.green;
export const failure = kleur.red;
export const ancillary = kleur.cyan;

const COLORS: Colors = {
  strong,
  weak,
  input,
  success,
  failure,
  ancillary,
  log: {
    DEBUG: kleur.magenta,
    INFO: kleur.cyan,
    WARN: kleur.yellow,
    ERROR: kleur.red,
  },
};

export default COLORS;
