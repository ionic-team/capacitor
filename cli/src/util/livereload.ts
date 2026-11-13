import { readJSONSync, writeJSONSync } from 'fs-extra';
import { join } from 'path';

import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';

class CapLiveReload {
  configJsonToRevertTo: {
    json: string | null;
    platformPath: string | null;
  } = {
    json: null,
    platformPath: null,
  };

  constructor() {
    // nothing to do
  }

  async editCapConfigForLiveReload(config: Config, platformName: string, options: RunCommandOptions): Promise<void> {
    const platformAbsPath =
      platformName == config.ios.name
        ? config.ios.nativeTargetDirAbs
        : platformName == config.android.name
          ? config.android.assetsDirAbs
          : null;
    if (platformAbsPath == null) throw new Error('Platform not found.');
    const capConfigPath = join(platformAbsPath, 'capacitor.config.json');

    const configJson = readJSONSync(capConfigPath);
    this.configJsonToRevertTo.json = JSON.stringify(configJson, null, 2);
    this.configJsonToRevertTo.platformPath = capConfigPath;
    configJson.server = {
      ...configJson.server,
      url: options.url,
    };
    writeJSONSync(capConfigPath, configJson, { spaces: '\t' });
  }

  async revertCapConfigForLiveReload(): Promise<void> {
    if (this.configJsonToRevertTo.json == null || this.configJsonToRevertTo.platformPath == null) return;
    const capConfigPath = this.configJsonToRevertTo.platformPath;
    const configJson = this.configJsonToRevertTo.json;
    writeJSONSync(capConfigPath, JSON.parse(configJson), { spaces: '\t' });
    this.configJsonToRevertTo.json = null;
    this.configJsonToRevertTo.platformPath = null;
  }
}

export const CapLiveReloadHelper = new CapLiveReload();
