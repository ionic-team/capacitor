import { rm } from "shelljs";
import { log } from "../common";

export function clean() {
  rm('-rf', 'ios');
  log('removing /ios DONE.');
  rm('-rf', 'android');
  log('removing /android DONE.');
}
