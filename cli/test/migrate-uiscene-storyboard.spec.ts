import { readFileSync } from 'fs-extra';
import { resolve } from 'path';

import { __testables } from '../src/tasks/migrate-uiscene';

const { getStoryboardBridgeSubclass, useBridgeSubclass } = __testables;

const REPO_ROOT = resolve(__dirname, '..', '..');
const SHIPPED_STORYBOARD = readFileSync(
  resolve(REPO_ROOT, 'ios-spm-template/App/App/Base.lproj/Main.storyboard'),
  'utf-8',
);
const SHIPPED_SCENE_DELEGATE = readFileSync(
  resolve(REPO_ROOT, 'ios-spm-template/App/App/SceneDelegate.swift'),
  'utf-8',
);

describe('getStoryboardBridgeSubclass', () => {
  it('returns null for the shipped storyboard', () => {
    expect(getStoryboardBridgeSubclass(SHIPPED_STORYBOARD)).toBeNull();
  });

  it('returns the custom class of the initial view controller', () => {
    const custom = SHIPPED_STORYBOARD.replace(
      'customClass="CAPBridgeViewController" customModule="Capacitor"',
      'customClass="MyViewController" customModule="App" customModuleProvider="target"',
    );
    expect(getStoryboardBridgeSubclass(custom)).toBe('MyViewController');
  });

  it('returns null when there is no initial view controller', () => {
    expect(getStoryboardBridgeSubclass('<document><viewController id="x" customClass="Other"/></document>')).toBeNull();
  });
});

describe('useBridgeSubclass', () => {
  it('swaps the root view controller in the shipped SceneDelegate', () => {
    const result = useBridgeSubclass(SHIPPED_SCENE_DELEGATE, 'MyViewController');
    expect(result).toContain('window?.rootViewController = MyViewController()');
    expect(result).not.toContain('CAPBridgeViewController()');
  });
});
