import { readJSON, writeJSON } from './fs.mjs';

export const setPackageJsonDependencies = async (path, packages, key = 'dependencies') => {
  const pkg = await readJSON(path);

  for (const [dep, version] of Object.entries(packages)) {
    pkg[key][dep] = version;
  }

  await writeJSON(path, pkg);
};
