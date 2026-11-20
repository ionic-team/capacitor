import { readFileSync } from 'fs-extra';
import { resolve } from 'path';

import { __testables } from '../src/tasks/migrate-swiftui';

const { getStoryboardBridgeSubclass, useBridgeSubclass } = __testables;

// The 8.x template's Main.storyboard, which cap migrate removes.
const STOCK_STORYBOARD = readFileSync(resolve(__dirname, 'fixtures/pre-swiftui-main.storyboard'), 'utf-8');
const TEMPLATE_CAPACITOR_VIEW = readFileSync(
  resolve(__dirname, '../../ios-spm-template/App/App/CapacitorView.swift'),
  'utf-8',
);

describe('getStoryboardBridgeSubclass', () => {
  it('returns null for the stock 8.x storyboard', () => {
    expect(getStoryboardBridgeSubclass(STOCK_STORYBOARD)).toBeNull();
  });

  it('returns the custom class of the initial view controller', () => {
    const custom = STOCK_STORYBOARD.replace(
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
  it('makes the template CapacitorView create and type the subclass', () => {
    const result = useBridgeSubclass(TEMPLATE_CAPACITOR_VIEW, 'MyViewController');
    expect(result).toContain('-> MyViewController {');
    expect(result).toContain('        MyViewController()');
    expect(result).toContain('_ vc: MyViewController,');
    expect(result).not.toContain('CAPBridgeViewController');
  });
});
