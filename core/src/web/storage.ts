import { WebPlugin } from './index';

import {
  StoragePlugin
} from '../core-plugin-definitions';


export class StoragePluginWeb extends WebPlugin implements StoragePlugin {
  KEY_PREFIX = '_cap_';

  constructor() {
    super({
      name: 'Storage',
      platforms: ['web']
    });
  }

  get(options: { key: string }): Promise<{value: string}> {
    return new Promise((resolve, _reject) => {
      resolve({
        value: window.localStorage.getItem(this.makeKey(options.key))
      });
    });
  }

  set(options: { key: string, value: string }): Promise<void> {
    return new Promise((resolve, _reject) => {
      window.localStorage.setItem(this.makeKey(options.key), options.value);
      resolve();
    });
  }

  remove(options: { key: string }): Promise<void> {
    return new Promise((resolve, _reject) => {
      window.localStorage.removeItem(this.makeKey(options.key));
      resolve();
    });
  }

  keys(): Promise<{ keys: string[] }> {
    return new Promise((resolve, _reject) => {
      resolve({
        keys: Object.keys(localStorage).filter(k => this.isKey(k)).map(k => this.getKey(k))
      });
    });
  }

  clear(): Promise<void> {
    return new Promise((resolve, _reject) => {
      Object.keys(localStorage)
        .filter(k => this.isKey(k))
        .forEach(k => window.localStorage.removeItem(k));
      resolve();
    });
  }

  makeKey(key: string) {
    return this.KEY_PREFIX + key;
  }

  isKey(key: string) {
    return key.indexOf(this.KEY_PREFIX) === 0;
  }

  getKey(key: string) {
    return key.substr(this.KEY_PREFIX.length);
  }
}

const Storage = new StoragePluginWeb();

export { Storage };
