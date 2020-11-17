import { copy, move, pathExists } from '@ionic/utils-fs';
import { join } from 'path';

export async function copyTemplate(src: string, dst: string): Promise<void> {
  await copy(src, dst);
  await renameGitignore(dst);
}

async function renameGitignore(dst: string): Promise<void> {
  // npm renames .gitignore to something else, so our templates
  // have .gitignore as gitignore, we need to rename it here.
  const gitignorePath = join(dst, 'gitignore');
  if (await pathExists(gitignorePath)) {
    await move(gitignorePath, join(dst, '.gitignore'));
  }
}
