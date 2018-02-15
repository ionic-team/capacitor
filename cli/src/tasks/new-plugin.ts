import { Config } from '../config';
import { log, logFatal, logInfo, runCommand, runTask, writePrettyJSON } from '../common';
import { emoji } from '../util/emoji';
import { existsAsync, mkdirAsync, writeFileAsync } from '../util/fs';

import { copy, move } from 'fs-extra';
import { join } from 'path';


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
      message: 'plugin name (snake-case):',
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
      message: 'plugin id (domain-style syntax. ex: com.example.plugin)',
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

    if (await existsAsync(pluginPath)) {
      logFatal(`Directory ${pluginPath} already exists. Not overwriting.`);
    }

    await mkdirAsync(pluginPath);

    await runTask('Adding plugin files', async () => {
      await copy(config.plugins.assets.templateDir, pluginPath);
      
      // Android specific stuff
      const newPluginPath = join(pluginPath, 'android/', pluginPath);
      // Move the 'plugin' folder inside $pluginPath/android/plugin to be the same name as the plugin
      const gradleProjectPath = join(pluginPath, 'android/plugin');
      await move(gradleProjectPath, newPluginPath);
      await writeFileAsync(join(newPluginPath, 'src/main/AndroidManifest.xml'), generateAndroidManifest(answers.domain, pluginPath));
    });

    await runTask('Writing package.json', () => {
      return writePrettyJSON(join(pluginPath, 'package.json'), generatePackageJSON(answers));
    });

    // await runTask('Configuring', () => {
    //   return writeFileAsync(join(pluginPath, 'package.json'), generatePackageJSON(answers));
    // });

    await runTask('Installing NPM dependencies', () => {
      return runCommand('npm install');
    });

    logInfo('DONE! capacitor plugin was created.');
    logInfo(`Get into the plugin: cd ./${pluginPath}`);

  } else {
    logInfo('Aborted');
  }
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
      'version': 'npm run build'
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

