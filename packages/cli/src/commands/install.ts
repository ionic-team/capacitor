
import { exec } from 'shelljs';
import { log } from '../utils';

export function install(args: any) {
  log('npm install');
  exec('npm install');
  log('npm install');
}
