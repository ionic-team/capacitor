import tar from 'tar';
import { resolve } from 'path';

import { root } from '../lib/repo.mjs';

const run = async () => {
  const template = resolve(root, 'app-template');
  const dest = resolve(root, 'create-app', 'assets', 'app-template.tar.gz');

  await tar.create({ gzip: true, file: dest, cwd: template }, ['.']);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
