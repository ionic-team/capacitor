import { Config } from '../config';
import { log, logFatal, logInfo, logWarn, runCommand, runTask, writePrettyJSON } from '../common';
import { OS } from '../definitions';
import { emoji } from '../util/emoji';
import { existsAsync, mkdirAsync, readFileAsync, writeFileAsync } from '../util/fs';
import { fixName, removeScope } from '../plugin';
import { copy, mkdirs, unlink } from 'fs-extra';
import { dirname, join } from 'path';
import { isInteractive } from '../util/term';

interface NewPluginAnswers {
  name: string;
  domain: string;
  className: string;
  description: string;
  git: string;
  author: string;
  license: string;
  confirm: boolean;
}

export async function newPluginCommand(config: Config) {
  try {
    if (!isInteractive()) {
      return;
    }

    await newPlugin(config);
  } catch (e) {
    logFatal(e);
  }
}


export async function newPlugin(config: Config) {
  log(`${emoji('✏️', '*')}  Creating new Capacitor plugin`);

  const inquirer = await import('inquirer');
  const requiredInput = (input: string): boolean => {
    if (!input || input.trim() === '') {
      return false;
    }
    return true;
  };
  const answers: NewPluginAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Plugin NPM name (kebab-case):',
      validate: requiredInput
    },
    {
      type: 'input',
      name: 'domain',
      message: 'Plugin id (domain-style syntax. ex: com.example.plugin)',
      validate: requiredInput
    },
    {
      type: 'input',
      name: 'className',
      message: 'Plugin class name (ex: AwesomePlugin)',
      validate: requiredInput
    },
    {
      type: 'input',
      name: 'description',
      message: 'description:',
      validate: requiredInput
    },
    {
      type: 'input',
      name: 'git',
      message: 'git repository:',
      validate: requiredInput
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
  ]) as NewPluginAnswers;

  console.log('\n');

  if (answers.confirm) {
    const pluginPath = removeScope(answers.name);
    const domain = answers.domain;
    const className = answers.className;

    if (await existsAsync(pluginPath)) {
      logFatal(`Directory ${pluginPath} already exists. Not overwriting.`);
    }

    await mkdirAsync(pluginPath);

    await runTask('Adding plugin files', async () => {
      await copy(config.plugins.assets.templateDir, pluginPath);
      await createTSPlugin(config, pluginPath, domain, className, answers);
      await createIosPlugin(config, pluginPath, domain, className, answers);
      await createAndroidPlugin(config, pluginPath, domain, className);
    });

    await runTask('Writing package.json', () => {
      return writePrettyJSON(join(pluginPath, 'package.json'), generatePackageJSON(answers));
    });

    await runTask('Installing NPM dependencies', async () => {
      return  runCommand(`cd "${pluginPath}" && npm install`);
    });

    if (config.cli.os === OS.Mac) {
      await runTask('Building iOS project', async () => {
        const iosPath = join(pluginPath, 'ios');
        return  runCommand(`cd "${iosPath}" && pod install`);
      });
    }

    logInfo(`Your Capacitor plugin was created at ${pluginPath}`);

  } else {
    logInfo('Aborted');
  }
}

async function createTSPlugin(config: Config, pluginPath: string, domain: string, className: string, answers: NewPluginAnswers) {
  const newPluginPath = join(pluginPath, 'src');

  const originalDefinitions = await readFileAsync(join(newPluginPath, 'definitions.ts'), 'utf8');
  const originalWeb  = await readFileAsync(join(newPluginPath, 'web.ts'), 'utf8');
  let definitions = originalDefinitions.replace(/Echo/g, className);
  const web  = originalWeb.replace(/MyPlugin/g, className);

  await writeFileAsync(join(newPluginPath, `definitions.ts`), definitions, 'utf8');
  await writeFileAsync(join(newPluginPath, `web.ts`), web, 'utf8');
}

async function createIosPlugin(config: Config, pluginPath: string, domain: string, className: string, answers: NewPluginAnswers) {
  const newPluginPath = join(pluginPath, 'ios', 'Plugin');

  const originalPluginSwift = await readFileAsync(join(newPluginPath, 'Plugin.swift'), 'utf8');
  const originalPluginObjc  = await readFileAsync(join(newPluginPath, 'Plugin.m'), 'utf8');
  const pluginSwift = originalPluginSwift.replace(/CLASS_NAME/g, className);
  const pluginObjc  = originalPluginObjc.replace(/CLASS_NAME/g, className);

  if (!answers.git) {
    logWarn('You will need to add a homepage and git repo to your generated podspec before installing or CocoaPods will complain');
  }
  if (!answers.description) {
    logWarn('You will need to add a summary to your generated podspec before installing or CocoaPods will complain');
  }

  await writeFileAsync(join(pluginPath, `${fixName(answers.name)}.podspec`), generatePodspec(config, answers), 'utf8');
  await writeFileAsync(join(newPluginPath, 'Plugin.swift'), pluginSwift, 'utf8');
  await writeFileAsync(join(newPluginPath, 'Plugin.m'), pluginObjc, 'utf8');
}

function generatePodspec(config: Config, answers: NewPluginAnswers) {
  return `
  Pod::Spec.new do |s|
    s.name = '${fixName(answers.name)}'
    s.version = '0.0.1'
    s.summary = '${answers.description}'
    s.license = '${answers.license}'
    s.homepage = '${answers.git}'
    s.author = '${answers.author}'
    s.source = { :git => '${answers.git}', :tag => s.version.to_s }
    s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
    s.ios.deployment_target  = '${config.ios.minVersion}'
    s.dependency 'Capacitor'
  end`;
}

async function createAndroidPlugin(config: Config, pluginPath: string, domain: string, className: string) {
  const domainPath = domain.split('.').join('/');

  // Android specific stuff
  const newPluginPath = join(pluginPath, 'android');
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
  `;
}

function generatePackageJSON(answers: NewPluginAnswers) {
  return {
    name: answers.name,
    version: '0.0.1',
    description: answers.description,
    main: 'dist/esm/index.js',
    types: 'dist/esm/index.d.ts',
    scripts: {
      'build': 'npm run clean && tsc',
      'clean': 'rimraf ./dist',
      'watch': 'tsc --watch',
      'prepublishOnly': 'npm run build'
    },
    author: answers.author,
    license: answers.license,
    dependencies: {
      '@capacitor/core': 'latest'
    },
    devDependencies: {
      'rimraf': '^3.0.0',
      'typescript': '^3.2.4',
      '@capacitor/ios': 'latest',
      '@capacitor/android': 'latest'
    },
    files: [
      'dist/',
      'ios/',
      'android/',
      `${fixName(answers.name)}.podspec`
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
    },
    'repository': {
      'type': 'git',
      'url': answers.git
    },
    'bugs': {
      'url': `${answers.git}/issues`
    }
  };
}

