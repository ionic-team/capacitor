import { Plugins } from '../../index';

import { Network } from './network-plugin';

async function testApp() {
  const networkStatus = await Network.getStatus();
  console.log('imported reference', networkStatus);

  const networkV2Status = await Plugins.Network.getStatus();
  console.log('plugin registry reference', networkV2Status);

  const legacyStatus = await Plugins.Legacy.getStatus();
  console.log('legacy plugin registry reference', legacyStatus);
}

testApp();
