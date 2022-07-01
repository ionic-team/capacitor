import { resolve } from 'path';
import semver from 'semver';

import { execute } from './lib/cli.mjs';
import { ls } from './lib/lerna.mjs';
import { setPackageJsonDependencies } from './lib/version.mjs';

/*
execute(async () => {
  const CORE_DEPENDENTS = ['@capacitor/android', '@capacitor/ios'];
  const pkgs = await ls();

  const corePkg = pkgs.find(p => p.name === '@capacitor/core');
  const { major, minor, prerelease } = semver.parse(corePkg.version);

  const range = `^${major}.${minor}.0${
    prerelease.length > 0 ? `-${prerelease.join('.')}` : ''
  }`;

  for (const pkg of pkgs.filter(p => CORE_DEPENDENTS.includes(p.name))) {
    const p = resolve(pkg.location, 'package.json');

    await setPackageJsonDependencies(
      p,
      { '@capacitor/core': range },
      'peerDependencies',
    );
  }
});
//*/
