import { getAssetsPath, logFatal, logInfo, runCommand, runTask, writeFileAsync } from '../common';
import { cp, exit } from 'shelljs';
import { join } from 'path';
import { PACKAGE_JSON } from '../config';
import { Answers, prompt } from 'inquirer';

const PACKAGE = 'package.json';

export async function newPluginCommand() {
  try {
    await newPlugin();
    exit(0);

  } catch (e) {
    logFatal(e);
  }
}

export async function newPlugin() {
  logInfo('avocado new-plugin is about to create a new avocado plugin.');

  const answers = await prompt([
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
      message: `${PACKAGE} will be created, do you want to continue?`
    }
  ]);
  console.log('\n');

  if (answers.confirm) {
    const pluginPath = answers.name;
    await runTask('Adding plugin files', async () => {
      cp('-R', getAssetsPath('plugin-base'), pluginPath);
    });
    await runTask('Genering package.json', () => {
      return writeFileAsync(join(pluginPath, PACKAGE_JSON), generatePackageJSON(answers));
    });
    // await runTask('Configuring', () => {
    //   return writeFileAsync(join(pluginPath, 'package.json'), generatePackageJSON(answers));
    // });
    await runTask('Installing NPM dependencies', () => {
      return runCommand('npm install');
    });
    logInfo('DONE! avocado plugin was created.');
    logInfo(`Get into the plugin: cd ./${pluginPath}`);

  } else {
    logInfo('Aborted');
  }
}

function generatePackageJSON(answers: Answers) {
  return JSON.stringify({
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
      'avocado-js': 'latest'
    },
    devDependencies: {
      'typescript': '^2.6.2'
    },
    files: [
      'dist/',
      'native/'
    ],
    keywords: [
      'avocado',
      'plugin',
      'native'
    ],
    avocado: {
      ios: {
        src: 'ios',
      },
      android: {
        src: 'android'
      }
    }
  }, null, '  ');
}

