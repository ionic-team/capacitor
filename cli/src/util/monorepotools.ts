import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

/**
 * Finds the monorepo root from the given path.
 * @param currentPath - The current path to start searching from.
 * @returns The path to the monorepo root.
 * @throws An error if the monorepo root is not found.
 */
export function findMonorepoRoot(currentPath: string): string {
  const packageJsonPath = join(currentPath, 'package.json');
  const pnpmWorkspacePath = join(currentPath, 'pnpm-workspace.yaml');
  if (
    existsSync(pnpmWorkspacePath) ||
    (existsSync(packageJsonPath) &&
      JSON.parse(readFileSync(packageJsonPath, 'utf-8')).workspaces)
  ) {
    return currentPath;
  }
  const parentPath = dirname(currentPath);
  if (parentPath === currentPath) {
    throw new Error('Monorepo root not found');
  }
  return findMonorepoRoot(parentPath);
}

/**
 * Finds the NX monorepo root from the given path.
 * @param currentPath - The current path to start searching from.
 * @returns The path to the monorepo root.
 * @throws An error if the monorepo root is not found.
 */
export function findNXMonorepoRoot(currentPath: string): string {
  const nxJsonPath = join(currentPath, 'nx.json');
  if (existsSync(nxJsonPath)) {
    return currentPath;
  }
  const parentPath = dirname(currentPath);
  if (parentPath === currentPath) {
    throw new Error('Monorepo root not found');
  }
  return findNXMonorepoRoot(parentPath);
}

/**
 * Finds the path to a package within the node_modules folder,
 * searching up the directory hierarchy until the last possible directory is reached.
 * @param packageName - The name of the package to find.
 * @param currentPath - The current path to start searching from.
 * @param lastPossibleDirectory - The last possible directory to search for the package.
 * @returns The path to the package, or null if not found.
 */
export function findPackagePath(
  packageName: string,
  currentPath: string,
  lastPossibleDirectory: string,
): string | null {
  const nodeModulesPath = join(currentPath, 'node_modules', packageName);
  if (existsSync(nodeModulesPath)) {
    return nodeModulesPath;
  }
  if (currentPath === lastPossibleDirectory) {
    return null;
  }
  const parentPath = dirname(currentPath);
  return findPackagePath(packageName, parentPath, lastPossibleDirectory);
}

/**
 * Finds the relative path to a package from the current directory,
 * using the monorepo root as the last possible directory.
 * @param packageName - The name of the package to find.
 * @param currentPath - The current path to start searching from.
 * @returns The relative path to the package, or null if not found.
 */
export function findPackageRelativePathInMonorepo(
  packageName: string,
  currentPath: string,
): string | null {
  const monorepoRoot = findMonorepoRoot(currentPath);
  const packagePath = findPackagePath(packageName, currentPath, monorepoRoot);
  if (packagePath) {
    return relative(currentPath, packagePath);
  }
  return null;
}

/**
 * Detects if the current directory is part of a monorepo (npm, yarn, pnpm).
 * @param currentPath - The current path to start searching from.
 * @returns True if the current directory is part of a monorepo, false otherwise.
 */
export function isMonorepo(currentPath: string): boolean {
  try {
    findMonorepoRoot(currentPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Detects if the current directory is part of a nx integrated monorepo.
 * @param currentPath - The current path to start searching from.
 * @returns True if the current directory is part of a monorepo, false otherwise.
 */
export function isNXMonorepo(currentPath: string): boolean {
  try {
    findNXMonorepoRoot(currentPath);
    return true;
  } catch (error) {
    return false;
  }
}
