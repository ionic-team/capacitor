import * as cp from './subprocess.mjs';
import { root } from './repo.mjs';

const cwd = root;

const execGit = async (command, options) => await cp.exec(`git ${command}`, { cwd, ...options });

export const lsfiles = async (p, options) => (await execGit(`ls-files "${p}"`, options)).stdout.trim().split('\n');
