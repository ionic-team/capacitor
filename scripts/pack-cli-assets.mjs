import { resolve } from 'path';
import tar from 'tar';

import { execute } from './lib/cli.mjs';
import { mkdir } from './lib/fs.mjs';
import { lsfiles } from './lib/git.mjs';
import { root } from './lib/repo.mjs';

execute(async () => {
  const assetsDir = resolve(root, 'cli', 'assets');

  const templates = [
    'android-template',
    'ios-pods-template',
    'ios-spm-template',
    'capacitor-cordova-android-plugins',
    'capacitor-cordova-ios-plugins',
  ];

  await mkdir(assetsDir, { recursive: true });

  for (const template of templates) {
    const dest = resolve(assetsDir, template + '.tar.gz');
    const templatePath = resolve(root, template);

    const files = await lsfiles(templatePath, { cwd: templatePath });

    await tar.create({ gzip: true, file: dest, cwd: templatePath }, files);

    console.log(`Packed ${dest}!`);
  }
});
