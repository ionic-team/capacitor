import { getPlugins, Plugin, PluginType } from '../utils/plugin';
import { createXcodeProject, updateIOSPlugins } from '../utils/ios';
import { log, logError, checkEnvironment, runCommand, askMode } from '../utils/common';
import { exit } from 'shelljs';


export async function update(mode: string) {
  const finalMode = await askMode(mode);

  // try {
  //   await runCommand('npm install');
  // } catch (e) {
  //   logError('Looks like npm install failed, make sure package.json is valid and points to valid dependencies.');
  //   logError(e);
  //   exit(-1);
  // }

  try {
    if (finalMode === 'ios') {
      await updateIOS()
    } else if (finalMode === 'android') {
      await updateAndroid();
    } else {
      throw `Platform ${finalMode} is not valid. Try with iOS or android`;
    }
  } catch (e) {
    logError(e);
    exit(-1);
  }
}

async function updateIOS() {
  log('updating plugins for platform: iOS');
  const plugins = await getPlugins();
  checkEnvironment();
  await createXcodeProject('');
  await updateIOSPlugins(plugins);
  log('DONE! Native modules are updated 🎉');
  log('Opening your xcode workspace, hold on a sec...');

  const opn = require('opn');
  opn('AvocadoApp/AvocadoApp.xcworkspace');
  exit(0);
}

async function updateAndroid() {
  log('updating plugins for platform: androd');
}


