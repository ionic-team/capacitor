import { Path, join, terminal } from '@angular-devkit/core';
import { Rule, SchematicContext, SchematicsException, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { ScriptTarget, SourceFile, createSourceFile } from 'typescript';

import { insertImport, isImported } from '../utils/devkit-utils/ast-utils';
import { InsertChange } from '../utils/devkit-utils/change';

import { getWorkspace } from './../utils/config';
import { addPackageToPackageJson } from './../utils/package';
import { Schema as IonAddOptions } from './schema';

function addCapacitorToPackageJson(): Rule {
  return (host: Tree) => {
    addPackageToPackageJson(host, 'dependencies', '@capacitor/core', 'latest');
    addPackageToPackageJson(host,'devDependencies','@capacitor/cli','latest');
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

function installNodeDeps() {
  return (host: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    return host;
  };
}

function printMessage() {
  return () => {
    process.stdout.write(`
⚡️  Capacitor CLI was added to your Project ⚡️
   What's next?
   • ${terminal.blue(terminal.bold('npx cap init'))}
   • ${terminal.blue(terminal.bold('npx cap add <ios,android,electron>'))}

   If you get lost, always check out the docs
   https://capacitor.ionicframework.com
`);
  };
}

export default function ngAdd(options: IonAddOptions): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);

    if (!options.project) {
      options.project = Object.keys(workspace.projects)[0];
    }
    const project = workspace.projects[options.project];

    if (project.projectType !== 'application') {
      throw new SchematicsException(
        `Capacitor Add requires a project type of "application".`
      );
    }
    const sourcePath = join(project.root as Path, 'src');

    return chain([
      addCapacitorToPackageJson(),
      addCapPluginsToAppComponent(sourcePath),
      installNodeDeps(),
      printMessage(),
    ]);
  };
}
