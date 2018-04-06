import { Config } from '../config';
import { log, logFatal, logInfo, runCommand, runTask, writePrettyJSON } from '../common';
import { emoji } from '../util/emoji';
import { existsAsync, mkdirAsync, writeFileAsync, readFileAsync } from '../util/fs';

import { copy, move, mkdirs, unlink } from 'fs-extra';
import { dirname, join } from 'path';
import { mkdir, writeFile } from 'fs';


export async function newPluginCommand(config: Config) {
  try {
    await newPlugin(config);
  } catch (e) {
    logFatal(e);
  }
}


export async function newPlugin(config: Config) {
  log(`${emoji('✏️', '*')}  Creating new Capacitor plugin`);

  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Plugin NPM name (snake-case):',
      validate: function(input) {
        if (!input || input.trim() === '') {
          return false;
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'domain',
      message: 'Plugin id (domain-style syntax. ex: com.example.plugin)',
      validate: function(input) {
        if (!input || input.trim() === '') {
          return false;
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'className',
      message: 'Plugin class name (ex: AwesomePlugin)',
      validate: function(input) {
        if (!input || input.trim() === '') {
          return false;
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'description:'
    },
    {
      type: 'input',
      name: 'git',
      message: 'git repository:'
    },
    {
      type: 'input',
      name: 'author',
      message: 'author:'
    },
    {
      type: 'input',
      name: 'license',
      message: 'license:',
      default: 'MIT'
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: `package.json will be created, do you want to continue?`
    }
  ]);

  console.log('\n');

  if (answers.confirm) {
    const pluginPath = answers.name;
    const domain = answers.domain;
    const className = answers.className;

    if (await existsAsync(pluginPath)) {
      logFatal(`Directory ${pluginPath} already exists. Not overwriting.`);
    }

    await mkdirAsync(pluginPath);

    await runTask('Adding plugin files', async () => {
      await copy(config.plugins.assets.templateDir, pluginPath);

      await createIosPlugin(config, pluginPath, domain, className, answers);
      await createAndroidPlugin(config, pluginPath, domain, className);
    });

    await runTask('Writing package.json', () => {
      return writePrettyJSON(join(pluginPath, 'package.json'), generatePackageJSON(answers));
    });

    await runTask('Installing NPM dependencies', async () => {
      await runCommand(`cd "${pluginPath}"`);
      return runCommand('npm install');
    });

    logInfo(`Your Capacitor plugin was created at ${pluginPath}`);

  } else {
    logInfo('Aborted');
  }
}

async function createIosPlugin(config: Config, pluginPath: string, domain: string, className: string, answers: any) {
  const newPluginPath = join(pluginPath, 'ios/Plugin');

  const originalPluginSwift = await readFileAsync(join(newPluginPath, 'Plugin/Plugin.swift'), 'utf8');
  const originalPluginObjc  = await readFileAsync(join(newPluginPath, 'Plugin/Plugin.m'), 'utf8');
  const pluginSwift = originalPluginSwift.replace(/CLASS_NAME/g, className);
  const pluginObjc  = originalPluginObjc.replace(/CLASS_NAME/g, className);

  await writeFileAsync(join(pluginPath, `${answers.className}.podspec`), generatePodspec(config, answers), 'utf8');
  await writeFileAsync(join(newPluginPath, `Plugin/Plugin.swift`), pluginSwift, 'utf8');
  await writeFileAsync(join(newPluginPath, `Plugin/Plugin.m`), pluginObjc, 'utf8');
}

function generatePodspec(config: Config, answers: any) {
  return `
  Pod::Spec.new do |s|
    s.name = '${answers.className}'
    s.version = '0.0.1'
    s.summary = '${answers.description}'
    s.license = '${answers.license}'
    s.homepage = '${answers.git}'
    s.author = '${answers.author}'
    s.source = { :git => '${answers.git}', :tag => s.version.to_s }
    s.source_files = 'ios/Plugin/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
    s.ios.deployment_target  = '${config.ios.minVersion}'
    s.dependency 'Capacitor'
  end`;
}

async function createAndroidPlugin(config: Config, pluginPath: string, domain: string, className: string) {
  const domainPath = domain.split('.').join('/');

  // Android specific stuff
  const newPluginPath = join(pluginPath, 'android/', pluginPath);
  // Move the 'plugin' folder inside $pluginPath/android/plugin to be the same name as the plugin
  const gradleProjectPath = join(pluginPath, 'android/plugin');
  await move(gradleProjectPath, newPluginPath);
  // Update the AndroidManifest to point to our new package
  await writeFileAsync(join(newPluginPath, 'src/main/AndroidManifest.xml'), generateAndroidManifest(domain, pluginPath));

  // Make the package source path to the new plugin Java file
  const newPluginJavaPath = join(newPluginPath, `src/main/java/${domainPath}/${className}.java`);
  await mkdirs(dirname(newPluginJavaPath));

  // Read the original plugin java template and replace package/class names
  const originalPluginJava = await readFileAsync(join(pluginPath, 'android/Plugin.java'), 'utf8');
  const pluginJava = originalPluginJava.replace(/PACKAGE_NAME/g, domain).replace(/CLASS_NAME/g, className);

  // Write the new plugin file
  await writeFileAsync(newPluginJavaPath, pluginJava, 'utf8');

  // Remove the old template
  await unlink(join(pluginPath, 'android/Plugin.java'));
}

function generateAndroidManifest(domain: string, pluginPath: string) {
const pluginPackage = pluginPath.split('-').join('');
  return `
  <manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${domain}.${pluginPackage}">
</manifest>
`
}

function generatePackageJSON(answers: any) {
  return {
    name: answers.name,
    version: '0.0.1',
    description: answers.description,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      'build': 'npm run clean && tsc',
      'clean': 'rm -rf ./dist',
      'watch': 'tsc --watch',
      'prepublishOnly': 'npm run build'
    },
    author: answers.author,
    license: answers.license,
    dependencies: {
      '@capacitor/core': 'latest'
    },
    devDependencies: {
      'typescript': '^2.6.2'
    },
    files: [
      'dist/',
      'ios/',
      'android/'
    ],
    keywords: [
      'capacitor',
      'plugin',
      'native'
    ],
    capacitor: {
      ios: {
        src: 'ios',
      },
      android: {
        src: 'android'
      }
    }
  };
}

