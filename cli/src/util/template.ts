import { mkdirp } from 'fs-extra';
import { extract } from 'tar';

export async function extractTemplate(src: string, dir: string): Promise<void> {
  await mkdirp(dir);
  await extract({ file: src, cwd: dir });
}
