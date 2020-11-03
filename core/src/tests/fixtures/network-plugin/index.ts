import { registerPlugin, NativePlugin } from '../../../index';

import type { NetworkPlugin } from './definitions';

const Network = registerPlugin<NetworkPlugin>('Network', {
  android: NativePlugin,
  ios: NativePlugin,
  web: () => import('./web').then(m => new m.NetworkWeb()),
});

export { Network };
