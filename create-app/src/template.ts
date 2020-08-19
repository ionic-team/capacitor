import tar from 'tar';
import Mustache from 'mustache';
import { resolve } from 'path';

import { createConfigFile } from './config';
import { readFile, mkdir, writeFile } from './fs';
import { OptionValues } from './options';

const TEMPLATE_PATH = resolve(__dirname, '..', 'assets', 'app-template.tar.gz');
const PKG_PATH = resolve(__dirname, '..', 'package.json');

export const readPackageJson = async (p: string) => {
  const contents = await readFile(p, { encoding: 'utf8' });
  return JSON.parse(contents);
};

export const extractTemplate = async (
  appdir: string,
  details: OptionValues,
) => {
  await mkdir(appdir, { recursive: true });
  await tar.extract({ file: TEMPLATE_PATH, cwd: appdir });
  await createConfigFile(details);
  await Promise.all(
    ['package.json'].map(p => resolve(appdir, p)).map(p => applyTemplate(p)),
  );
};

export const applyTemplate = async (p: string) => {
  const pkg = await readPackageJson(PKG_PATH);
  const contents = await readFile(p, { encoding: 'utf8' });
  const result = Mustache.render(contents, {
    CAPACITOR_VERSION: pkg.version,
  });

  await writeFile(p, result, { encoding: 'utf8' });
};
