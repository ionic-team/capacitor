import { mkdirp, cpSync, lstatSync } from '@ionic/utils-fs';
import tar from 'tar';

export async function extractTemplate(src: string, dir: string): Promise<void> {
  await mkdirp(dir);
  if (!lstatSync(src).isDirectory()) {
    await tar.extract({ file: src, cwd: dir });
  } else {
    cpSync(src, dir, {
      recursive: true,
    });
  }
}
