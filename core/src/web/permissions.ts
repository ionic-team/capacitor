import { WebPlugin } from './index';

import {
  PermissionsPlugin, PermissionsOptions, PermissionResult, PermissionType
} from '../core-plugin-definitions';

export class PermissionsPluginWeb extends WebPlugin implements PermissionsPlugin {
  constructor() {
    super({
      name: 'Permissions'
    });
  }

  async query(options: PermissionsOptions): Promise<PermissionResult> {
    const navigator = window.navigator as any;

    if (!navigator.permissions) {
      return Promise.reject('This browser does not support the Permissions API');
    }

    // Photos isn't supported in the web but it's equivalent to the camera permission
    // since the prompt lets you pick from an album
    const name = options.name === PermissionType.Photos ? 'camera' : options.name;

    const ret = await navigator.permissions.query({ name });

    return {
      state: ret.state
    };
  }
}

const Permissions = new PermissionsPluginWeb();

export { Permissions };
