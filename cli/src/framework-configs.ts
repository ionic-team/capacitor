import type { Config, FrameworkConfig } from './definitions';

const FRAMEWORK_CONFIGS: FrameworkConfig[] = [
  {
    name: 'Angular',
    isMatch: config => hasDependency(config, '@angular/cli'),
    webDir: 'dist',
    priority: 3,
  },
  {
    name: 'Create React App',
    isMatch: config => hasDependency(config, 'react-scripts'),
    webDir: 'build',
    priority: 3,
  },
  {
    name: 'Ember',
    isMatch: config => hasDependency(config, 'ember-cli'),
    webDir: 'dist',
    priority: 3,
  },
  {
    name: 'Gatsby',
    isMatch: config => hasDependency(config, 'gatsby'),
    webDir: 'public',
    priority: 2,
  },
  {
    name: 'Ionic Angular',
    isMatch: config => hasDependency(config, '@ionic/angular'),
    webDir: 'www',
    priority: 1,
  },
  {
    name: 'Ionic React',
    isMatch: config => hasDependency(config, '@ionic/react'),
    webDir: 'build',
    priority: 1,
  },
  {
    name: 'Ionic Vue',
    isMatch: config => hasDependency(config, '@ionic/vue'),
    webDir: 'public',
    priority: 1,
  },
  {
    name: 'Next',
    isMatch: config => hasDependency(config, 'next'),
    webDir: 'public',
    priority: 2,
  },
  {
    name: 'Preact',
    isMatch: config => hasDependency(config, 'preact-cli'),
    webDir: 'build',
    priority: 3,
  },
  {
    name: 'Stencil',
    isMatch: config => hasDependency(config, '@stencil/core'),
    webDir: 'www',
    priority: 3,
  },
  {
    name: 'Svelte',
    isMatch: config =>
      hasDependency(config, 'svelte') && hasDependency(config, 'sirv-cli'),
    webDir: 'public',
    priority: 3,
  },
  {
    name: 'Vite',
    isMatch: config => hasDependency(config, 'vite'),
    webDir: 'dist',
    priority: 2,
  },
  {
    name: 'Vue',
    isMatch: config => hasDependency(config, '@vue/cli-service'),
    webDir: 'dist',
    priority: 3,
  },
];

export function detectFramework(config: Config): FrameworkConfig | undefined {
  const frameworks = FRAMEWORK_CONFIGS.filter(f => f.isMatch(config)).sort(
    (a, b) => {
      if (a.priority < b.priority) return -1;
      if (a.priority > b.priority) return 1;
      return 0;
    },
  );
  return frameworks[0];
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
