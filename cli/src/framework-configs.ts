import type { Config, FrameworkConfig } from './definitions';

const FRAMEWORK_CONFIGS: FrameworkConfig[] = [
  {
    name: 'Angular',
    isMatch: config =>
      hasDependency(config, '@angular/cli') &&
      !hasDependency(config, '@ionic/angular'),
    webDir: 'dist',
  },
  {
    name: 'Create React App',
    isMatch: config =>
      hasDependency(config, 'react-scripts') &&
      hasDependency(config, 'react-dev-utils') &&
      !hasDependency(config, '@ionic/react'),
    webDir: 'build',
  },
  {
    name: 'Ember',
    isMatch: config => hasDependency(config, 'ember-cli'),
    webDir: 'dist',
  },
  {
    name: 'Gatsby',
    isMatch: config => hasDependency(config, 'gatsby'),
    webDir: 'public',
  },
  {
    name: 'Ionic Angular',
    isMatch: config => hasDependency(config, '@ionic/angular'),
    webDir: 'www',
  },
  {
    name: 'Ionic React',
    isMatch: config => hasDependency(config, '@ionic/react'),
    webDir: 'build',
  },
  {
    name: 'Ionic Vue',
    isMatch: config => hasDependency(config, '@ionic/vue'),
    webDir: 'public',
  },
  {
    name: 'Next',
    isMatch: config => hasDependency(config, 'next'),
    webDir: 'public',
  },
  {
    name: 'Preact',
    isMatch: config => hasDependency(config, 'preact-cli'),
    webDir: 'build',
  },
  {
    name: 'Stencil',
    isMatch: config => hasDependency(config, '@stencil/core'),
    webDir: 'www',
  },
  {
    name: 'Svelte',
    isMatch: config =>
      hasDependency(config, 'svelte') && hasDependency(config, 'sirv-cli'),
    webDir: 'public',
  },
  {
    name: 'Vue',
    isMatch: config =>
      hasDependency(config, '@vue/cli-service') &&
      !hasDependency(config, '@ionic/vue'),
    webDir: 'dist',
  },
];

export function detectFramework(config: Config): FrameworkConfig | undefined {
  return FRAMEWORK_CONFIGS.find(f => f.isMatch(config));
}

function hasDependency(config: Config, depName: string): boolean {
  const deps = getDependencies(config);
  return deps.includes(depName);
}

function getDependencies(config: Config): string[] {
  const deps: string[] = [];
  if (config?.app?.package?.dependencies) {
    deps.push(...Object.keys(config.app.package.dependencies));
  }
  if (config?.app?.package?.devDependencies) {
    deps.push(...Object.keys(config.app.package.devDependencies));
  }
  return deps;
}
