import { mkdirp, pathExists, readFile, remove, writeFile } from 'fs-extra';
import { join } from 'path';

import {
  __testables,
  removeLegacyCordovaPluginsConfig,
  setAndroidCleartext,
} from '../src/android/network-security-config';
import type { Config } from '../src/definitions';

import { mktmp } from './util';

const { enableCleartext, revertCleartext } = __testables;

const MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
    </application>
</manifest>
`;

const MANIFEST_WITH_REF = (name: string) =>
  MANIFEST.replace('<application', `<application android:networkSecurityConfig="@xml/${name}"`);

const APP_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- user comment -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">example.com</domain>
        <pin-set expiration="2030-01-01">
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
`;

describe('network-security-config (pure helpers)', () => {
  it('generates a minimal config when none exists, and reverting deletes it', () => {
    const xml = enableCleartext(undefined, { ref: true });
    expect(xml).toContain('<base-config cleartextTrafficPermitted="true" />');
    expect(xml).toContain('capacitor:cleartext created ref');
    expect(revertCleartext(xml)).toBeNull();
  });

  it('only changes cleartextTrafficPermitted on <base-config> of an existing config', () => {
    const xml = enableCleartext(APP_CONFIG, { ref: false });
    expect(xml).toContain('<base-config cleartextTrafficPermitted="true">');
    expect(
      xml
        .replace(/\s*<!-- capacitor:cleartext[^>]*-->/, '')
        .replace('cleartextTrafficPermitted="true"', 'cleartextTrafficPermitted="false"'),
    ).toBe(APP_CONFIG);
    // <domain-config> untouched
    expect(xml).toContain('<domain-config cleartextTrafficPermitted="false">');
  });

  it('restores the original config byte for byte on revert', () => {
    expect(revertCleartext(enableCleartext(APP_CONFIG, { ref: false }))).toBe(APP_CONFIG);
  });

  it('restores an originally-true value', () => {
    const original = APP_CONFIG.replace(
      '<base-config cleartextTrafficPermitted="false">',
      '<base-config cleartextTrafficPermitted="true">',
    );
    expect(revertCleartext(enableCleartext(original, { ref: false }))).toBe(original);
  });

  it('removes the attribute when <base-config> had none', () => {
    const original = APP_CONFIG.replace('<base-config cleartextTrafficPermitted="false">', '<base-config>');
    const enabled = enableCleartext(original, { ref: false });
    expect(enabled).toContain('<base-config cleartextTrafficPermitted="true">');
    expect(revertCleartext(enabled)).toBe(original);
  });

  it('adds <base-config> when the config has none, and removes it on revert', () => {
    const original = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain>example.com</domain>
    </domain-config>
</network-security-config>
`;
    const enabled = enableCleartext(original, { ref: false });
    expect(enabled).toContain('<base-config cleartextTrafficPermitted="true" />');
    expect(enabled).toContain('<domain-config cleartextTrafficPermitted="false">');
    expect(revertCleartext(enabled)).toBe(original);
  });

  it('handles a self-closing <network-security-config/> root', () => {
    const enabled = enableCleartext('<network-security-config />', { ref: false });
    expect(enabled).toContain('<base-config cleartextTrafficPermitted="true" />');
    expect(enabled).toContain('</network-security-config>');
  });

  it('is idempotent and keeps the first recorded original value', () => {
    const once = enableCleartext(APP_CONFIG, { ref: false });
    expect(enableCleartext(once, { ref: false })).toBe(once);
    expect(revertCleartext(once)).toBe(APP_CONFIG);
  });

  it('ignores configs it did not touch', () => {
    expect(revertCleartext(APP_CONFIG)).toBeUndefined();
  });

  it('throws on a file without a root element', () => {
    expect(() => enableCleartext('not xml', { ref: false })).toThrow();
  });
});

describe('setAndroidCleartext', () => {
  let tmp: Awaited<ReturnType<typeof mktmp>>;
  let config: Config;
  let manifestPath: string;
  let xmlDir: string;

  const nsc = (name = 'network_security_config') => join(xmlDir, `${name}.xml`);

  beforeEach(async () => {
    tmp = await mktmp();
    const platformDirAbs = join(tmp.path, 'android');
    const srcMainDirAbs = join(platformDirAbs, 'app', 'src', 'main');
    xmlDir = join(srcMainDirAbs, 'res', 'xml');
    manifestPath = join(srcMainDirAbs, 'AndroidManifest.xml');
    await mkdirp(xmlDir);
    await writeFile(manifestPath, MANIFEST);
    config = {
      android: {
        srcMainDirAbs,
        resDirAbs: join(srcMainDirAbs, 'res'),
        cordovaPluginsDirAbs: join(platformDirAbs, 'capacitor-cordova-android-plugins'),
      },
    } as unknown as Config;
  });

  afterEach(() => remove(tmp.path));

  it('Capacitor-only app: creates the config and manifest reference, and removes both on revert', async () => {
    await setAndroidCleartext(config, true);
    expect(await readFile(nsc(), 'utf-8')).toContain('cleartextTrafficPermitted="true"');
    expect(await readFile(manifestPath, 'utf-8')).toContain(
      'android:networkSecurityConfig="@xml/network_security_config"',
    );

    await setAndroidCleartext(config, false);
    expect(await pathExists(nsc())).toBe(false);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST);
  });

  it('is idempotent when enabled repeatedly', async () => {
    await setAndroidCleartext(config, true);
    const manifest = await readFile(manifestPath, 'utf-8');
    const file = await readFile(nsc(), 'utf-8');
    await setAndroidCleartext(config, true);
    expect(await readFile(manifestPath, 'utf-8')).toBe(manifest);
    expect(await readFile(nsc(), 'utf-8')).toBe(file);
  });

  it('does nothing when disabled and nothing was added', async () => {
    await setAndroidCleartext(config, false);
    expect(await pathExists(nsc())).toBe(false);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST);
  });

  it('merges into the app config with the same name and restores it on revert', async () => {
    await writeFile(manifestPath, MANIFEST_WITH_REF('network_security_config'));
    await writeFile(nsc(), APP_CONFIG);

    await setAndroidCleartext(config, true);
    expect(await readFile(nsc(), 'utf-8')).toContain('<base-config cleartextTrafficPermitted="true">');
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST_WITH_REF('network_security_config'));

    await setAndroidCleartext(config, false);
    expect(await readFile(nsc(), 'utf-8')).toBe(APP_CONFIG);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST_WITH_REF('network_security_config'));
  });

  it('merges into a differently named app config without touching the manifest', async () => {
    await writeFile(manifestPath, MANIFEST_WITH_REF('my_nsc'));
    await writeFile(nsc('my_nsc'), APP_CONFIG);

    await setAndroidCleartext(config, true);
    expect(await readFile(nsc('my_nsc'), 'utf-8')).toContain('<base-config cleartextTrafficPermitted="true">');
    expect(await pathExists(nsc())).toBe(false);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST_WITH_REF('my_nsc'));

    await setAndroidCleartext(config, false);
    expect(await readFile(nsc('my_nsc'), 'utf-8')).toBe(APP_CONFIG);
  });

  it('never deletes or un-references a pre-existing app config on revert', async () => {
    await writeFile(manifestPath, MANIFEST_WITH_REF('network_security_config'));
    await writeFile(nsc(), '<network-security-config />');
    await setAndroidCleartext(config, true);
    await setAndroidCleartext(config, false);
    expect(await pathExists(nsc())).toBe(true);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST_WITH_REF('network_security_config'));
  });

  it('adds a reference to an existing unreferenced config and removes only the reference on revert', async () => {
    await writeFile(nsc(), APP_CONFIG);
    await setAndroidCleartext(config, true);
    expect(await readFile(manifestPath, 'utf-8')).toContain(
      'android:networkSecurityConfig="@xml/network_security_config"',
    );

    await setAndroidCleartext(config, false);
    expect(await readFile(nsc(), 'utf-8')).toBe(APP_CONFIG);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST);
  });

  it('skips (without throwing) when the referenced config file does not exist', async () => {
    await writeFile(manifestPath, MANIFEST_WITH_REF('elsewhere'));
    await setAndroidCleartext(config, true);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST_WITH_REF('elsewhere'));
  });

  it('skips (without throwing) when there is no app manifest', async () => {
    await writeFile(manifestPath, MANIFEST);
    const emptyConfig = { android: { ...config.android, srcMainDirAbs: join(tmp.path, 'nope') } } as unknown as Config;
    await expect(setAndroidCleartext(emptyConfig, true)).resolves.toBeUndefined();
  });

  describe('legacy cordova plugins module config', () => {
    const legacyDir = () => join(config.android.cordovaPluginsDirAbs, 'src', 'main', 'res', 'xml');

    it('removes the file generated by older CLI versions', async () => {
      await mkdirp(legacyDir());
      await writeFile(
        join(legacyDir(), 'network_security_config.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
</network-security-config>
`,
      );
      await removeLegacyCordovaPluginsConfig(config);
      expect(await pathExists(join(legacyDir(), 'network_security_config.xml'))).toBe(false);
    });

    it('keeps a file with other content', async () => {
      await mkdirp(legacyDir());
      await writeFile(join(legacyDir(), 'network_security_config.xml'), APP_CONFIG);
      await removeLegacyCordovaPluginsConfig(config);
      expect(await pathExists(join(legacyDir(), 'network_security_config.xml'))).toBe(true);
    });
  });
});
