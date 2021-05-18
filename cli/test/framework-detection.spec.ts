import { resolve } from 'path';

import { detectFramework } from '../../cli/src/framework-configs';

import type { Config } from '../src/definitions';

describe('framework detection', () => {
  let config: Config;

  beforeEach(() => {
    config = {
      cli: null as any,
      app: {
        rootDir: resolve('/'),
        appId: 'appId',
        appName: 'appName',
        webDir: '',
        webDirAbs: '',
        package: {
          name: 'package-name',
          version: '0.0.0',
        },
        extConfigType: 'json',
        extConfigName: '',
        extConfigFilePath: '',
        extConfig: null as any,
        bundledWebRuntime: true,
      },
      android: null as any,
      ios: null as any,
      web: null as any,
    };
  });

  it('Angular', () => {
    addDep(config, '@angular/cli');
    const f = detectFramework(config);
    expect(f?.name).toBe('Angular');
    expect(f?.webDir).toBe('dist');
  });

  it('Create React App', () => {
    addDep(config, 'react-scripts');
    addDep(config, 'react-dev-utils');
    const f = detectFramework(config);
    expect(f?.name).toBe('Create React App');
    expect(f?.webDir).toBe('build');
  });

  it('Ember', () => {
    addDep(config, 'ember-cli');
    const f = detectFramework(config);
    expect(f?.name).toBe('Ember');
    expect(f?.webDir).toBe('dist');
  });

  it('Gatsby', () => {
    addDep(config, 'gatsby');
    const f = detectFramework(config);
    expect(f?.name).toBe('Gatsby');
    expect(f?.webDir).toBe('public');
  });

  it('Ionic Angular', () => {
    addDep(config, '@ionic/angular');
    const f = detectFramework(config);
    expect(f?.name).toBe('Ionic Angular');
    expect(f?.webDir).toBe('www');
  });

  it('Ionic Angular and not just Angular', () => {
    addDep(config, '@angular/cli');
    addDep(config, '@ionic/angular');
    const f = detectFramework(config);
    expect(f?.name).toBe('Ionic Angular');
    expect(f?.webDir).toBe('www');
  });

  it('Ionic React', () => {
    addDep(config, '@ionic/react');
    const f = detectFramework(config);
    expect(f?.name).toBe('Ionic React');
    expect(f?.webDir).toBe('build');
  });

  it('Ionic React over Create React App', () => {
    addDep(config, '@ionic/react');
    addDep(config, 'react-scripts');
    addDep(config, 'react-dev-utils');
    const f = detectFramework(config);
    expect(f?.name).toBe('Ionic React');
    expect(f?.webDir).toBe('build');
  });

  it('Ionic Vue', () => {
    addDep(config, '@ionic/vue');
    const f = detectFramework(config);
    expect(f?.name).toBe('Ionic Vue');
    expect(f?.webDir).toBe('public');
  });

  it('Ionic Vue and not just Vue', () => {
    addDep(config, '@ionic/vue');
    addDep(config, '@vue/cli-service');
    const f = detectFramework(config);
    expect(f?.name).toBe('Ionic Vue');
    expect(f?.webDir).toBe('public');
  });

  it('Next', () => {
    addDep(config, 'next');
    const f = detectFramework(config);
    expect(f?.name).toBe('Next');
    expect(f?.webDir).toBe('public');
  });

  it('Preact', () => {
    addDep(config, 'preact-cli');
    const f = detectFramework(config);
    expect(f?.name).toBe('Preact');
    expect(f?.webDir).toBe('build');
  });

  it('Stencil', () => {
    addDep(config, '@stencil/core');
    const f = detectFramework(config);
    expect(f?.name).toBe('Stencil');
    expect(f?.webDir).toBe('www');
  });

  it('Svelte', () => {
    addDep(config, 'svelte');
    addDep(config, 'sirv-cli');
    const f = detectFramework(config);
    expect(f?.name).toBe('Svelte');
    expect(f?.webDir).toBe('public');
  });

  it('not Svelte w/out sirv-cli', () => {
    addDep(config, 'svelte');
    const f = detectFramework(config);
    expect(f).toBeUndefined();
  });

  it('Vue', () => {
    addDep(config, '@vue/cli-service');
    const f = detectFramework(config);
    expect(f?.name).toBe('Vue');
    expect(f?.webDir).toBe('dist');
  });

  it('nothing detected', () => {
    const f = detectFramework(config);
    expect(f).toBeUndefined();
  });
});

function addDep(config: Config, depName: string) {
  (config.app.package as any).dependencies =
    config.app.package.dependencies || {};
  (config.app.package.dependencies as any)[depName] = '0.0.0';
}
