import { askPlatform, logError } from "../common";
import { update } from "./update";
import { copy } from "./copy";
import { exit } from "shelljs";
import { open } from "./open";


export async function prepareCommand(platform: string) {
  const finalPlatform = await askPlatform(platform);
  try {
    await prepare(platform);
    exit(0);
  } catch (e) {
    logError(e);
    exit(-1);
  }
}

export async function prepare(platform: string) {
  await update(platform, false);
  await copy(platform);
  await open(platform);
}