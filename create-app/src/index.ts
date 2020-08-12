// import prompts from 'prompts';
import tar from 'tar';
import { resolve } from 'path';

const run = async () => {
  const template = resolve(__dirname, '..', 'assets', 'app-template.tar.gz');
  const appdir = resolve(process.cwd(), 'my-app');

  await tar.extract({ file: template, cwd: appdir });
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
