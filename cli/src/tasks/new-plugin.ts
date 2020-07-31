import { Config } from '../config';
import {
  log,
  logFatal,
  logInfo,
  logWarn,
  runCommand,
  runTask,
  writePrettyJSON,
} from '../common';
import { OS } from '../definitions';
import { emoji } from '../util/emoji';
import {
  existsAsync,
  mkdirAsync,
  readFileAsync,
  writeFileAsync,
} from '../util/fs';
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
  const answers: NewPluginAnswers = (await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Plugin npm name (kebab-case. ex: capacitor-plugin-example):',
      validate: requiredInput,
    },
    {
      type: 'input',
      name: 'domain',
      message:
        'Plugin id (domain-style syntax. ex: com.mycompany.plugins.example)',
      validate: requiredInput,
    },
    {
      type: 'input',
      name: 'className',
      message: 'Plugin class name (ex: Example)',
      validate: requiredInput,
    },
    {
      type: 'input',
      name: 'description',
      message: 'description:',
      validate: requiredInput,
    },
    {
      type: 'input',
      name: 'git',
      message: 'git repository:',
      validate: requiredInput,
    },
    {
      type: 'input',
      name: 'author',
      message: 'author:',
    },
    {
      type: 'input',
      name: 'license',
      message: 'license:',
      default: 'MIT',
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: `package.json will be created, do you want to continue?`,
    },
  ])) as NewPluginAnswers;

  console.log('\n');

  if (answers.confirm) {
    const pluginPath = removeScope(answers.name);
    const domain = answers.domain;
    const className = answers.className;
    const cliVersion = config.cli.package.version;

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
      return writePrettyJSON(
        join(pluginPath, 'package.json'),
        generatePackageJSON(answers, cliVersion),
      );
    });

    await runTask('Installing NPM dependencies', async () => {
      return runCommand(`cd "${pluginPath}" && npm install`);
    });

    if (config.cli.os === OS.Mac) {
      await runTask('Building iOS project', async () => {
        const iosPath = join(pluginPath, 'ios');
        return runCommand(`cd "${iosPath}" && pod install`);
      });
    }

    logInfo(`Your Capacitor plugin was created at ${pluginPath}`);
  } else {
    logInfo('Aborted');
  }
}

async function createTSPlugin(
  config: Config,
  pluginPath: string,
  domain: string,
  className: string,
  answers: NewPluginAnswers,
) {
  const newPluginPath = join(pluginPath, 'src');

  const originalIndex = await readFileAsync(
    join(newPluginPath, 'index.ts'),
    'utf8',
  );
  const originalDefinitions = await readFileAsync(
    join(newPluginPath, 'definitions.ts'),
    'utf8',
  );
  const originalWeb = await readFileAsync(
    join(newPluginPath, 'web.ts'),
    'utf8',
  );
  const index = originalIndex.replace(/MyPlugin/g, className);
  const definitions = originalDefinitions.replace(/MyPlugin/g, className);
  const web = originalWeb.replace(/MyPlugin/g, className);

  await writeFileAsync(join(newPluginPath, `index.ts`), index, 'utf8');
  await writeFileAsync(
    join(newPluginPath, `definitions.ts`),
    definitions,
    'utf8',
  );
  await writeFileAsync(join(newPluginPath, `web.ts`), web, 'utf8');
}

async function createIosPlugin(
  config: Config,
  pluginPath: string,
  domain: string,
  className: string,
  answers: NewPluginAnswers,
) {
  const newPluginPath = join(pluginPath, 'ios', 'Plugin');

  const originalPluginSwift = await readFileAsync(
    join(newPluginPath, 'CLASS_NAMEPlugin.swift'),
    'utf8',
  );
  const originalPluginImplementationSwift = await readFileAsync(
    join(newPluginPath, 'CLASS_NAME.swift'),
    'utf8',
  );
  const originalPluginObjc = await readFileAsync(
    join(newPluginPath, 'CLASS_NAMEPlugin.m'),
    'utf8',
  );
  const originalPluginObjcHeader = await readFileAsync(
    join(newPluginPath, 'CLASS_NAMEPlugin.h'),
    'utf8',
  );
  const originalXcodeProj = await readFileAsync(
    join(pluginPath, 'ios', 'Plugin.xcodeproj', 'project.pbxproj'),
    'utf8',
  );
  const originalPluginTestsSwift = await readFileAsync(
    join(pluginPath, 'ios', 'PluginTests', 'PluginTests.swift'),
    'utf8',
  );

  const fillTemplate = (content: string): string =>
    content
      .replace(/CLASS_NAME/g, className)
      .replace(/\/\/ swiftlint:disable:previous[^\n]+\n/g, '');

  const pluginSwift = fillTemplate(originalPluginSwift);
  const pluginImplementationSwift = fillTemplate(
    originalPluginImplementationSwift,
  );
  const pluginObjc = fillTemplate(originalPluginObjc);
  const pluginObjcHeader = fillTemplate(originalPluginObjcHeader);
  const pluginXcodeProj = fillTemplate(originalXcodeProj);
  const pluginTestsSwift = fillTemplate(originalPluginTestsSwift);

  if (!answers.git) {
    logWarn(
      'You will need to add a homepage and git repo to your generated podspec before installing or CocoaPods will complain',
    );
  }
  if (!answers.description) {
    logWarn(
      'You will need to add a summary to your generated podspec before installing or CocoaPods will complain',
    );
  }

  await writeFileAsync(
    join(pluginPath, `${fixName(answers.name)}.podspec`),
    generatePodspec(config, answers),
    'utf8',
  );
  await writeFileAsync(
    join(newPluginPath, `${className}Plugin.swift`),
    pluginSwift,
    'utf8',
  );
  await writeFileAsync(
    join(newPluginPath, `${className}.swift`),
    pluginImplementationSwift,
    'utf8',
  );
  await writeFileAsync(
    join(newPluginPath, `${className}Plugin.m`),
    pluginObjc,
    'utf8',
  );
  await writeFileAsync(
    join(newPluginPath, `${className}Plugin.h`),
    pluginObjcHeader,
    'utf8',
  );
  await writeFileAsync(
    join(pluginPath, 'ios', 'Plugin.xcodeproj', 'project.pbxproj'),
    pluginXcodeProj,
    'utf8',
  );
  await writeFileAsync(
    join(pluginPath, 'ios', 'PluginTests', 'PluginTests.swift'),
    pluginTestsSwift,
    'utf8',
  );

  // Remove the old templates
  await unlink(join(newPluginPath, 'CLASS_NAMEPlugin.swift'));
  await unlink(join(newPluginPath, 'CLASS_NAME.swift'));
  await unlink(join(newPluginPath, 'CLASS_NAMEPlugin.m'));
  await unlink(join(newPluginPath, 'CLASS_NAMEPlugin.h'));
}

function generatePodspec(config: Config, answers: NewPluginAnswers) {
  return `require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = '${fixName(answers.name)}'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target  = '${config.ios.minVersion}'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end
`;
}

async function createAndroidPlugin(
  config: Config,
  pluginPath: string,
  domain: string,
  className: string,
) {
  const domainPath = domain.split('.').join('/');

  // Android specific stuff
  const newPluginPath = join(pluginPath, 'android');
  // Update the AndroidManifest to point to our new package
  await writeFileAsync(
    join(newPluginPath, 'src/main/AndroidManifest.xml'),
    generateAndroidManifest(domain, pluginPath),
  );

  // Make the package source path to the new plugin Java file
  const newPluginJavaPath = join(
    newPluginPath,
    `src/main/java/${domainPath}/${className}Plugin.java`,
  );
  const newPluginJavaImplementationPath = join(
    newPluginPath,
    `src/main/java/${domainPath}/${className}.java`,
  );
  await mkdirs(dirname(newPluginJavaPath));

  // Read the original plugin java templates and replace package/class names
  const originalPluginJava = await readFileAsync(
    join(pluginPath, 'android/CLASS_NAMEPlugin.java'),
    'utf8',
  );
  const originalPluginJavaImplementation = await readFileAsync(
    join(pluginPath, 'android/CLASS_NAME.java'),
    'utf8',
  );

  const pluginJava = originalPluginJava
    .replace(/PACKAGE_NAME/g, domain)
    .replace(/CLASS_NAME/g, className);
  const pluginJavaImplementation = originalPluginJavaImplementation
    .replace(/PACKAGE_NAME/g, domain)
    .replace(/CLASS_NAME/g, className);

  // Write the new plugin files
  await writeFileAsync(newPluginJavaPath, pluginJava, 'utf8');
  await writeFileAsync(
    newPluginJavaImplementationPath,
    pluginJavaImplementation,
    'utf8',
  );

  // Remove the old templates
  await unlink(join(pluginPath, 'android/CLASS_NAMEPlugin.java'));
  await unlink(join(pluginPath, 'android/CLASS_NAME.java'));
}

function generateAndroidManifest(domain: string, pluginPath: string) {
  const pluginPackage = pluginPath.split('-').join('');
  return `
  <manifest xmlns:android="http://schemas.android.com/apk/res/android"
      package="${domain}.${pluginPackage}">
  </manifest>
  `;
}

function generatePackageJSON(answers: NewPluginAnswers, cliVersion: string) {
  return {
    name: answers.name,
    version: '0.0.1',
    description: answers.description,
    main: 'dist/plugin.js',
    module: 'dist/esm/index.js',
    types: 'dist/esm/index.d.ts',
    scripts: {
      lint: 'npm run prettier -- --check && npm run swiftlint -- lint',
      fmt:
        'npm run prettier -- --write && npm run swiftlint -- autocorrect --format',
      prettier: 'prettier "**/*.{css,html,ts,js,java}"',
      swiftlint: 'node-swiftlint',
      build: 'npm run clean && tsc && rollup -c rollup.config.js',
      clean: 'rimraf ./dist',
      watch: 'tsc --watch',
      prepublishOnly: 'npm run build',
    },
    author: answers.author,
    license: answers.license,
    devDependencies: {
      '@capacitor/android': `^${cliVersion}`,
      '@capacitor/core': `^${cliVersion}`,
      '@capacitor/ios': `^${cliVersion}`,
      '@ionic/prettier-config': '^1.0.0',
      '@ionic/swiftlint-config': '^1.0.0',
      '@rollup/plugin-node-resolve': '^8.1.0',
      prettier: '^2.0.5',
      'prettier-plugin-java': '^0.8.0',
      rimraf: '^3.0.0',
      rollup: '^2.21.0',
      swiftlint: '^1.0.1',
      typescript: '~3.9.7',
    },
    peerDependencies: {
      '@capacitor/core': `^${cliVersion}`,
    },
    files: ['dist/', 'ios/', 'android/', `${fixName(answers.name)}.podspec`],
    keywords: ['capacitor', 'plugin', 'native'],
    capacitor: {
      ios: {
        src: 'ios',
      },
      android: {
        src: 'android',
      },
    },
    prettier: '@ionic/prettier-config',
    swiftlint: '@ionic/swiftlint-config',
    repository: {
      type: 'git',
      url: answers.git,
    },
  };
}
