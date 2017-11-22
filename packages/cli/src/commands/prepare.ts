import { askPlatform, logFatal } from "../common";
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
    logFatal(e);
  }
}

export async function prepare(platform: string) {
  await update(platform, false);
  await copy(platform);
  await open(platform);
}