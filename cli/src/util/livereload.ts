import { readJSONSync, writeJSONSync } from '@ionic/utils-fs';
import { networkInterfaces } from 'os';
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

  getIpAddress(name?: string, family?: any) {
    const interfaces: any = networkInterfaces() ?? {};

    const _normalizeFamily = (family?: any) => {
      if (family === 4) {
        return 'ipv4';
      }
      if (family === 6) {
        return 'ipv6';
      }
      return family ? family.toLowerCase() : 'ipv4';
    };
    const isLoopback = (addr: string) => {
      return (
        /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/.test(addr) ||
        /^fe80::1$/.test(addr) ||
        /^::1$/.test(addr) ||
        /^::$/.test(addr)
      );
    };
    const isPrivate = (addr: string) => {
      return (
        /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(
          addr,
        ) ||
        /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
        /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(
          addr,
        ) ||
        /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(
          addr,
        ) ||
        /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
        /^f[cd][0-9a-f]{2}:/i.test(addr) ||
        /^fe80:/i.test(addr) ||
        /^::1$/.test(addr) ||
        /^::$/.test(addr)
      );
    };
    const isPublic = (addr: string) => {
      return !isPrivate(addr);
    };
    const loopback = (family?: any) => {
      //
      // Default to `ipv4`
      //
      family = _normalizeFamily(family);

      if (family !== 'ipv4' && family !== 'ipv6') {
        throw new Error('family must be ipv4 or ipv6');
      }

      return family === 'ipv4' ? '127.0.0.1' : 'fe80::1';
    };

    //
    // Default to `ipv4`
    //
    family = _normalizeFamily(family);

    //
    // If a specific network interface has been named,
    // return the address.
    //
    if (name && name !== 'private' && name !== 'public') {
      const res = interfaces[name].filter((details: any) => {
        const itemFamily = _normalizeFamily(details.family);
        return itemFamily === family;
      });
      if (res.length === 0) {
        return undefined;
      }
      return res[0].address;
    }

    const all = Object.keys(interfaces)
      .map(nic => {
        //
        // Note: name will only be `public` or `private`
        // when this is called.
        //
        const addresses = interfaces[nic].filter((details: any) => {
          details.family = _normalizeFamily(details.family);
          if (details.family !== family || isLoopback(details.address)) {
            return false;
          }
          if (!name) {
            return true;
          }

          return name === 'public'
            ? isPrivate(details.address)
            : isPublic(details.address);
        });

        return addresses.length ? addresses[0].address : undefined;
      })
      .filter(Boolean);

    return !all.length ? loopback(family) : all[0];
  }

  async editExtConfigForLiveReload(
    config: Config,
    platformName: string,
    options: RunCommandOptions,
    rootConfigChange = false,
  ): Promise<any> {
    const platformAbsPath =
      platformName == config.ios.name
        ? config.ios.nativeTargetDirAbs
        : platformName == config.android.name
        ? config.android.assetsDirAbs
        : null;
    if (platformAbsPath == null) throw new Error('Platform not found.');
    const capConfigPath = rootConfigChange
      ? config.app.extConfigFilePath
      : join(platformAbsPath, 'capacitor.config.json');

    const configJson = { ...config.app.extConfig };
    this.configJsonToRevertTo.json = JSON.stringify(configJson, null, 2);
    this.configJsonToRevertTo.platformPath = capConfigPath;
    const url = `http://${options.host}:${options.port}`;
    configJson.server = {
      url,
    };
    return configJson;
  }

  async editCapConfigForLiveReload(
    config: Config,
    platformName: string,
    options: RunCommandOptions,
    rootConfigChange = false,
  ): Promise<void> {
    const platformAbsPath =
      platformName == config.ios.name
        ? config.ios.nativeTargetDirAbs
        : platformName == config.android.name
        ? config.android.assetsDirAbs
        : null;
    if (platformAbsPath == null) throw new Error('Platform not found.');
    const capConfigPath = rootConfigChange
      ? config.app.extConfigFilePath
      : join(platformAbsPath, 'capacitor.config.json');

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
    if (
      this.configJsonToRevertTo.json == null ||
      this.configJsonToRevertTo.platformPath == null
    )
      return;
    const capConfigPath = this.configJsonToRevertTo.platformPath;
    const configJson = this.configJsonToRevertTo.json;
    writeJSONSync(capConfigPath, JSON.parse(configJson), { spaces: '\t' });
    this.configJsonToRevertTo.json = null;
    this.configJsonToRevertTo.platformPath = null;
  }
}

export const CapLiveReloadHelper = new CapLiveReload();
