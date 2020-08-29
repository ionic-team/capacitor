import { Colors } from '@ionic/cli-framework-output';
import kleur from 'kleur';

export const COLORS: Colors = {
  strong: kleur.bold,
  weak: kleur.dim,
  input: kleur.cyan,
  success: kleur.green,
  failure: kleur.red,
  ancillary: kleur.cyan,
  log: {
    DEBUG: kleur.magenta,
    INFO: kleur.white,
    WARN: kleur.yellow,
    ERROR: kleur.red,
  },
};
