import { Config } from '../config';
import { join } from 'path';
import { logFatal, logInfo, runCommand, runTask, writePrettyJSON } from '../common';


export async function newPluginCommand(config: Config) {
  try {
    await newPlugin(config);

  } catch (e) {
    logFatal(e);
  }
}


export async function newPlugin(config: Config) {
  logInfo('capacitor new-plugin is about to create a new capacitor plugin.');

  config;

  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'plugin name (snake-case):'
    }, {
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
    await runTask('Adding plugin files', async () => {
      // cp('-R', getAssetsPath('plugin-base'), pluginPath);
    });

    await runTask('Genering package.json', () => {
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
      'native/'
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

