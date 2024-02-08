import { mkdirp, cpSync, lstatSync } from '@ionic/utils-fs';
import { join } from 'node:path';
import tar from 'tar';

export async function extractTemplate(src: string, dir: string): Promise<void> {
  await mkdirp(dir);
  if (!lstatSync(src).isDirectory()) {
    await tar.extract({
      file: src,
      cwd: dir,
      filter: (path, entry) => {
        if (path.startsWith('./template/')) {
          (entry.path as unknown as string) = (
            entry.path as unknown as string
          ).replace('./template/', './');
          return true;
        }
        return false;
      },
    });
  } else {
    cpSync(join(src, 'template'), dir, {
      recursive: true,
    });
  }
}
