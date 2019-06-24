import { Rule, SchematicContext, SchematicsException, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getPackageManager } from '@angular/cli/utilities/package-manager';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { ScriptTarget, SourceFile, createSourceFile } from 'typescript';

import { insertImport, isImported } from '../utils/devkit-utils/ast-utils';
import { InsertChange } from '../utils/devkit-utils/change';

import { addPackageToPackageJson } from './../utils/package';
import { Schema as IonAddOptions } from './schema';

function addCapacitorToPackageJson(): Rule {
  return (host: Tree) => {
    addPackageToPackageJson(host, 'dependencies', '@capacitor/core', 'latest');
    addPackageToPackageJson(host, 'devDependencies', '@capacitor/cli', 'latest');
    return host;
  };
}

function getTsSourceFile(host: Tree, path: string): SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not read file (${path}).`);
  }
  const content = buffer.toString();
  const source = createSourceFile(
    path,
    content,
    ScriptTarget.Latest,
    true
  );

  return source;
}

function addCapPluginsToAppComponent(projectSourceRoot: string): Rule {
  return (host: Tree) => {
    const modulePath = `${projectSourceRoot}/app/app.component.ts`;
    const moduleSource = getTsSourceFile(host, modulePath);
    const importModule = 'Plugins';
    const importPath = '@capacitor/core';
    if (!isImported(moduleSource, importModule, importPath)) {
      const change = insertImport(
        moduleSource,
        modulePath,
        importModule,
        importPath,
        false
      );
      if (change) {
        const recorder = host.beginUpdate(modulePath);
        recorder.insertLeft(
          (change as InsertChange).pos,
          (change as InsertChange).toAdd
        );
        host.commitUpdate(recorder);
      }
    }
    return host;
  };
}

function capInit(projectName: string, npmTool: string, webDir: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    const packageInstall = context.addTask(new NodePackageInstallTask());
    context.addTask(new RunSchematicTask('cap-init', { command: 'npx', args: ['cap', 'init', projectName, '--npm-client', npmTool, '--web-dir', webDir] }), [packageInstall]);
    return host;
  };
}

export default function ngAdd(options: IonAddOptions): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);

    if (!options.project) {
      options.project = workspace.extensions.defaultProject as string;
    }

    const projectTree = workspace.projects.get(options.project);

    if (projectTree.extensions['projectType'] !== 'application') {
      throw new SchematicsException(`Capacitor Add requires a project type of "application".`);
    }

    const packageMgm = getPackageManager(projectTree.root);
    const distTarget = projectTree.targets.get('build').options['outputPath'] as string;
    const sourcePath = projectTree.sourceRoot;

    return chain([
      addCapacitorToPackageJson(),
      addCapPluginsToAppComponent(sourcePath),
      capInit(options.project, packageMgm, distTarget),
    ]);
  };
}
