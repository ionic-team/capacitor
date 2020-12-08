import { resolve } from 'path';
import tar from 'tar';

import { execute } from './lib/cli.mjs';
import { lsfiles } from './lib/git.mjs';
import { root } from './lib/repo.mjs';

execute(async () => {
  const templates = [
    'android-template',
    'ios-template',
    'capacitor-cordova-android-plugins',
    'capacitor-cordova-ios-plugins',
  ];

  for (const template of templates) {
    const dest = resolve(root, 'cli', 'assets', template + '.tar.gz');
    const templatePath = resolve(root, template);

    const files = await lsfiles(templatePath, { cwd: templatePath });

    await tar.create({ gzip: true, file: dest, cwd: templatePath }, files);

    console.log(`Packed ${dest}!`);
  }
});
