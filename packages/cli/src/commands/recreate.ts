import { update } from "./update";
import { clean } from "./clean";
import { copy } from "./copy";
import { askMode } from "../common";
import { exit } from "shelljs";

export async function recreateCommand(mode: string) {
  const finalMode = await askMode(mode);
  recreate(finalMode);
}

export async function recreate(mode: string) {
  clean();
  await update(mode, false)
  await copy(mode);
  exit(0);
}