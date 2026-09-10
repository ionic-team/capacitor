import { mkdirp, writeFileSync } from 'fs-extra';
import { join } from 'path';

import type { Config } from '../src/definitions';
import { logger } from '../src/log';
import { __testables } from '../src/tasks/migrate-uiscene';

import { mktmp } from './util';

const { hasCustomDelegateBody, scanAndWarn } = __testables;

const OPEN_URL_SIG = /func application\([^)]*\bopen url:/;
const CONTINUE_SIG = /func application\([^)]*\bcontinue userActivity:/;

const VANILLA_OPEN_URL = `
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url.
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
`;

const CUSTOM_OPEN_URL = `
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        print("received url: \\(url)")
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
`;

const VANILLA_CONTINUE = `
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
`;

const CUSTOM_CONTINUE = `
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        MyAnalytics.track(userActivity)
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
`;

describe('hasCustomDelegateBody', () => {
  it('returns false for the vanilla open-url body', () => {
    expect(hasCustomDelegateBody(VANILLA_OPEN_URL, OPEN_URL_SIG)).toBe(false);
  });

  it('returns true for an open-url body with a print statement', () => {
    expect(hasCustomDelegateBody(CUSTOM_OPEN_URL, OPEN_URL_SIG)).toBe(true);
  });

  it('returns false for the vanilla continue userActivity body', () => {
    expect(hasCustomDelegateBody(VANILLA_CONTINUE, CONTINUE_SIG)).toBe(false);
  });

  it('returns true for a continue userActivity body with extra work', () => {
    expect(hasCustomDelegateBody(CUSTOM_CONTINUE, CONTINUE_SIG)).toBe(true);
  });

  it('returns false when the method is not present', () => {
    expect(hasCustomDelegateBody('class AppDelegate {}', OPEN_URL_SIG)).toBe(false);
  });

  it('ignores line comments inside the body', () => {
    const source = `
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // This comment is fine, feel free to add processing.
        // Second comment line.
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
`;
    expect(hasCustomDelegateBody(source, OPEN_URL_SIG)).toBe(false);
  });
});

describe('scanAndWarn', () => {
  let tmpDir: any;
  let iosDir: string;
  let appDir: string;
  let warnSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;

  beforeEach(async () => {
    tmpDir = await mktmp();
    iosDir = join(tmpDir.path, 'ios');
    appDir = join(iosDir, 'App', 'App');
    await mkdirp(appDir);
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    tmpDir.cleanupCallback();
  });

  function makeConfig(): Config {
    return {
      ios: { platformDirAbs: iosDir, nativeTargetDirAbs: appDir },
    } as unknown as Config;
  }

  it('warns on UIApplication.shared.applicationState references', async () => {
    writeFileSync(
      join(appDir, 'SomeVC.swift'),
      `import UIKit\nclass Foo {\n    func check() {\n        if UIApplication.shared.applicationState == .active { print("hi") }\n    }\n}\n`,
    );

    await scanAndWarn(makeConfig());

    const messages = warnSpy.mock.calls.map((c) => c[0]);
    expect(messages.some((m) => m.includes('applicationState'))).toBe(true);
    expect(messages.some((m) => m.includes('SomeVC.swift:4'))).toBe(true);
  });

  it('warns on tmpWindow and TmpViewController references', async () => {
    writeFileSync(join(appDir, 'Legacy.swift'), `let w = tmpWindow\nlet vc: TmpViewController? = nil\n`);

    await scanAndWarn(makeConfig());

    const messages = warnSpy.mock.calls.map((c) => c[0]);
    expect(messages.some((m) => m.includes('tmpWindow'))).toBe(true);
    expect(messages.some((m) => m.includes('TmpViewController'))).toBe(true);
  });

  it('warns on custom AppDelegate handlers', async () => {
    writeFileSync(join(appDir, 'AppDelegate.swift'), CUSTOM_OPEN_URL + CUSTOM_CONTINUE);

    await scanAndWarn(makeConfig());

    const messages = warnSpy.mock.calls.map((c) => c[0]);
    expect(messages.some((m) => m.includes('custom application(_:open:) body'))).toBe(true);
    expect(messages.some((m) => m.includes('custom application(_:continue:) body'))).toBe(true);
  });

  it('is silent on a clean project', async () => {
    writeFileSync(join(appDir, 'AppDelegate.swift'), VANILLA_OPEN_URL + VANILLA_CONTINUE);
    writeFileSync(join(appDir, 'CleanCode.swift'), `class Clean {}\n`);

    await scanAndWarn(makeConfig());

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('skips Pods/, build/, and DerivedData/ directories', async () => {
    const podsDir = join(iosDir, 'App', 'Pods');
    const buildDir = join(iosDir, 'App', 'build');
    await mkdirp(podsDir);
    await mkdirp(buildDir);
    writeFileSync(join(podsDir, 'ThirdParty.swift'), `let x = UIApplication.shared.applicationState\n`);
    writeFileSync(join(buildDir, 'Generated.swift'), `class TmpViewController {}\n`);

    await scanAndWarn(makeConfig());

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
