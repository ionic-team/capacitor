import {exec} from 'shelljs';

export function build(args: any[]) {
  exec('npm run build');
}
