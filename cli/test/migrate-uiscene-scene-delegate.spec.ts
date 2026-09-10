import { readFileSync } from 'fs-extra';
import { resolve } from 'path';

import { __testables } from '../src/tasks/migrate-uiscene';

const { extractConfigurationForConnecting, insertBeforeAppDelegateClassEnd } = __testables;

const REPO_ROOT = resolve(__dirname, '..', '..');
const SHIPPED_APP_DELEGATE_SPM = resolve(REPO_ROOT, 'ios-spm-template/App/App/AppDelegate.swift');
const SHIPPED_APP_DELEGATE_PODS = resolve(REPO_ROOT, 'ios-pods-template/App/App/AppDelegate.swift');

describe('extractConfigurationForConnecting', () => {
  it('slices the method out of the shipped SPM AppDelegate', () => {
    const shipped = readFileSync(SHIPPED_APP_DELEGATE_SPM, 'utf-8');
    const snippet = extractConfigurationForConnecting(shipped);
    expect(snippet).not.toBeNull();
    expect(snippet).toContain('configurationForConnecting connectingSceneSession: UISceneSession');
    expect(snippet).toContain('UISceneConfiguration(name: "Default Configuration"');
    expect(snippet).toContain('config.delegateClass = SceneDelegate.self');
    expect(snippet!.startsWith('\n')).toBe(true);
    expect(snippet!.endsWith('\n')).toBe(true);
  });

  it('slices the method out of the shipped Pods AppDelegate', () => {
    const shipped = readFileSync(SHIPPED_APP_DELEGATE_PODS, 'utf-8');
    const snippet = extractConfigurationForConnecting(shipped);
    expect(snippet).not.toBeNull();
    expect(snippet).toContain('configurationForConnecting connectingSceneSession: UISceneSession');
    expect(snippet).toContain('config.delegateClass = SceneDelegate.self');
  });

  it('returns null when the method signature is absent', () => {
    const source = `import UIKit\n\nclass AppDelegate: UIResponder, UIApplicationDelegate {\n    var window: UIWindow?\n}\n`;
    expect(extractConfigurationForConnecting(source)).toBeNull();
  });
});

describe('insertBeforeAppDelegateClassEnd', () => {
  it('turns a pre-UIScene AppDelegate into the shipped SPM AppDelegate', () => {
    const shipped = readFileSync(SHIPPED_APP_DELEGATE_SPM, 'utf-8');
    const snippet = extractConfigurationForConnecting(shipped);
    expect(snippet).not.toBeNull();
    const pre = stripConfigurationForConnecting(shipped);

    const patched = insertBeforeAppDelegateClassEnd(pre, snippet!);

    expect(patched).toBe(shipped);
  });

  it('returns null when no AppDelegate class is present', () => {
    const source = `import UIKit\n\nstruct Something {}\n`;
    expect(insertBeforeAppDelegateClassEnd(source, '\n    func x() {}\n')).toBeNull();
  });

  it('returns null when class braces are unbalanced', () => {
    const source = `class AppDelegate: UIResponder {\n    func foo() {\n`;
    expect(insertBeforeAppDelegateClassEnd(source, '\n    func x() {}\n')).toBeNull();
  });

  it('inserts inside the class, before its closing brace, even with a trailing extension', () => {
    const source = [
      'class AppDelegate: UIResponder, UIApplicationDelegate {',
      '    func a() {}',
      '}',
      '',
      'extension AppDelegate {',
      '    func b() {}',
      '}',
      '',
    ].join('\n');

    const patched = insertBeforeAppDelegateClassEnd(source, '\n    func injected() {}\n');

    expect(patched).toBe(
      [
        'class AppDelegate: UIResponder, UIApplicationDelegate {',
        '    func a() {}',
        '',
        '    func injected() {}',
        '}',
        '',
        'extension AppDelegate {',
        '    func b() {}',
        '}',
        '',
      ].join('\n'),
    );
  });
});

function stripConfigurationForConnecting(source: string): string {
  // Remove the configurationForConnecting method + its leading blank line from the shipped template,
  // yielding an 8.4-shaped AppDelegate for use as a fixture.
  return source.replace(
    /\n\n {4}func application\(_ application: UIApplication,\n {21}configurationForConnecting[\s\S]*?\n {4}\}\n\}/,
    '\n}',
  );
}
