import { mkdirp } from 'fs-extra';
import tar from 'tar';

export async function extractTemplate(src: string, dir: string): Promise<void> {
  await mkdirp(dir);
  await tar.extract({ file: src, cwd: dir });
}
