import { readJSONSync, writeJSONSync } from '@ionic/utils-fs';
import { join } from "path";

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

  async editExtConfigForLiveReload(config: Config, platformName: string, options: RunCommandOptions, rootConfigChange = false): Promise<any> {
    const platformAbsPath = platformName == config.ios.name ? config.ios.nativeTargetDirAbs : (platformName == config.android.name ? config.android.assetsDirAbs : null);
    if (platformAbsPath == null) throw new Error("Platform not found.");
    const capConfigPath = rootConfigChange ? config.app.extConfigFilePath : join(platformAbsPath, 'capacitor.config.json');
    
    const configJson = {...config.app.extConfig};
    this.configJsonToRevertTo.json = JSON.stringify(configJson, null, 2);
    this.configJsonToRevertTo.platformPath = capConfigPath;
    const url = `http://${options.host}:${options.port}`;
    configJson.server = {
      url,
    };
    return configJson;
  }

  async editCapConfigForLiveReload(config: Config, platformName: string, options: RunCommandOptions, rootConfigChange = false): Promise<void> {
    const platformAbsPath = platformName == config.ios.name ? config.ios.nativeTargetDirAbs : (platformName == config.android.name ? config.android.assetsDirAbs : null);
    if (platformAbsPath == null) throw new Error("Platform not found.");
    const capConfigPath = rootConfigChange ? config.app.extConfigFilePath : join(platformAbsPath, 'capacitor.config.json');
    
    const configJson = readJSONSync(capConfigPath);
    this.configJsonToRevertTo.json = JSON.stringify(configJson, null, 2);
    this.configJsonToRevertTo.platformPath = capConfigPath;
    const url = `http://${options.host}:${options.port}`;
    configJson.server = {
      url,
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

export const CapLiveReloadHeler = new CapLiveReload();