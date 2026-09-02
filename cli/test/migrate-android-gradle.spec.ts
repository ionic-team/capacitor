import { mkdirp, readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';

import type { Config } from '../src/definitions';
import { logger } from '../src/log';
import { __testables } from '../src/tasks/migrate';

import { mktmp } from './util';

const {
  agpMigrationAssistantProperties,
  removeAGPMigrationProperties,
  removeJCenter,
  removeJCenterFromGradleFile,
  updateGradleProperties,
} = __testables;

// gradle.properties of a Capacitor 8 app after running the AGP 9 Upgrade Assistant
const ASSISTANT_MIGRATED_PROPERTIES = `# Project-wide Gradle settings.

org.gradle.jvmargs=-Xmx1536m

# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
# https://developer.android.com/topic/libraries/support-library/androidx-rn
android.useAndroidX=true
android.defaults.buildfeatures.resvalues=true
android.sdk.defaultTargetSdkToCompileSdkIfUnset=false
android.enableAppCompileTimeRClass=false
android.usesSdkInManifest.disallowed=false
android.uniquePackageNames=false
android.dependency.useConstraints=true
android.r8.strictFullModeForKeepRules=false
android.r8.optimizedResourceShrinking=false
android.builtInKotlin=false
android.newDsl=false
`;

const ROOT_BUILD_GRADLE_WITH_JCENTER = `buildscript {
    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.13.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        jcenter()
    }
}
`;

// Capacitor 8 app/build.gradle, whose only repositories block wraps a nested flatDir block
const APP_BUILD_GRADLE_WITH_FLATDIR = `apply plugin: 'com.android.application'

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
    jcenter()
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
}
`;

describe('removeAGPMigrationProperties', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('removes every property injected by the AGP 9 Upgrade Assistant', () => {
    // Arrange
    const txt = ASSISTANT_MIGRATED_PROPERTIES;

    // Act
    const result = removeAGPMigrationProperties(txt);

    // Assert
    for (const property of agpMigrationAssistantProperties) {
      expect(result).not.toContain(property);
    }
  });

  it('keeps properties a Capacitor app still needs', () => {
    // Arrange
    const txt = ASSISTANT_MIGRATED_PROPERTIES;

    // Act
    const result = removeAGPMigrationProperties(txt);

    // Assert
    expect(result).toContain('android.useAndroidX=true');
    expect(result).toContain('org.gradle.jvmargs=-Xmx1536m');
    expect(result).toContain('# Project-wide Gradle settings.');
  });

  it('removes properties written with spaces around the separator', () => {
    // Arrange
    const txt = 'android.newDsl = false\nandroid.useAndroidX=true\n';

    // Act
    const result = removeAGPMigrationProperties(txt);

    // Assert
    expect(result).toBe('android.useAndroidX=true\n');
  });

  it('leaves commented out properties alone', () => {
    // Arrange
    const txt = '#android.newDsl=false\n# android.builtInKotlin=false\n';

    // Act
    const result = removeAGPMigrationProperties(txt);

    // Assert
    expect(result).toBe(txt);
  });

  it('returns the file unchanged when no property was injected', () => {
    // Arrange
    const txt = 'org.gradle.jvmargs=-Xmx1536m\nandroid.useAndroidX=true\n';

    // Act
    const result = removeAGPMigrationProperties(txt);

    // Assert
    expect(result).toBe(txt);
  });
});

describe('removeJCenterFromGradleFile', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('removes the jcenter() line and leaves the rest of the block alone', () => {
    // Arrange
    const txt = 'buildscript {\n    repositories {\n        google()\n        jcenter()\n    }\n}\n';

    // Act
    const result = removeJCenterFromGradleFile(txt);

    // Assert
    expect(result).toBe('buildscript {\n    repositories {\n        google()\n    }\n}\n');
  });

  it('removes jcenter() from every repositories block', () => {
    // Arrange
    const txt = ROOT_BUILD_GRADLE_WITH_JCENTER;

    // Act
    const result = removeJCenterFromGradleFile(txt);

    // Assert
    expect(result).not.toContain('jcenter()');
    expect(result.match(/mavenCentral\(\)/g)).toHaveLength(1);
  });

  it('does not add mavenCentral() to a block that lacks it', () => {
    // Arrange
    const txt = 'buildscript {\n    repositories {\n        google()\n        jcenter()\n    }\n}\n';

    // Act
    const result = removeJCenterFromGradleFile(txt);

    // Assert
    expect(result).not.toContain('mavenCentral()');
  });

  it('removes a jcenter() line that carries a trailing comment', () => {
    // Arrange
    const txt = 'repositories {\n    jcenter() // legacy artifacts\n}\n';

    // Act
    const result = removeJCenterFromGradleFile(txt);

    // Assert
    expect(result).toBe('repositories {\n}\n');
  });

  it('leaves a commented out jcenter() alone', () => {
    // Arrange
    const txt =
      '// jcenter() was removed in Gradle 9\ntask clean(type: Delete) {\n    delete rootProject.buildDir\n}\n';

    // Act
    const result = removeJCenterFromGradleFile(txt);

    // Assert
    expect(result).toBe(txt);
  });

  it('returns the file unchanged when there is no jcenter()', () => {
    // Arrange
    const txt = 'allprojects {\n    repositories {\n        google()\n        mavenCentral()\n    }\n}\n';

    // Act
    const result = removeJCenterFromGradleFile(txt);

    // Assert
    expect(result).toBe(txt);
  });
});

describe('android gradle migration against a project on disk', () => {
  let tmpDir: any;
  let platformDir: string;
  let appDir: string;

  beforeEach(async () => {
    jest.spyOn(logger, 'info').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();

    tmpDir = await mktmp();
    platformDir = join(tmpDir.path, 'android');
    appDir = join(platformDir, 'app');
    await mkdirp(appDir);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tmpDir.cleanupCallback();
  });

  function makeConfig(): Config {
    return {
      android: { platformDirAbs: platformDir, appDirAbs: appDir },
    } as unknown as Config;
  }

  function read(filename: string): string {
    return readFileSync(filename, 'utf-8');
  }

  it('rewrites gradle.properties in place', async () => {
    // Arrange
    const propertiesPath = join(platformDir, 'gradle.properties');
    writeFileSync(propertiesPath, ASSISTANT_MIGRATED_PROPERTIES, 'utf-8');

    // Act
    await updateGradleProperties(propertiesPath);

    // Assert
    const result = read(propertiesPath);
    expect(result).toContain('android.useAndroidX=true');
    for (const property of agpMigrationAssistantProperties) {
      expect(result).not.toContain(property);
    }
  });

  it('removes jcenter() from the root build.gradle', async () => {
    // Arrange
    const rootPath = join(platformDir, 'build.gradle');
    writeFileSync(rootPath, ROOT_BUILD_GRADLE_WITH_JCENTER, 'utf-8');

    // Act
    await removeJCenter(makeConfig());

    // Assert
    expect(read(rootPath)).not.toContain('jcenter()');
  });

  it('leaves the app build.gradle alone', async () => {
    // Arrange
    const rootPath = join(platformDir, 'build.gradle');
    const appPath = join(appDir, 'build.gradle');
    writeFileSync(rootPath, ROOT_BUILD_GRADLE_WITH_JCENTER, 'utf-8');
    writeFileSync(appPath, APP_BUILD_GRADLE_WITH_FLATDIR, 'utf-8');

    // Act
    await removeJCenter(makeConfig());

    // Assert
    expect(read(appPath)).toBe(APP_BUILD_GRADLE_WITH_FLATDIR);
  });

  it('leaves a clean project untouched', async () => {
    // Arrange
    const rootPath = join(platformDir, 'build.gradle');
    const clean = 'allprojects {\n    repositories {\n        google()\n        mavenCentral()\n    }\n}\n';
    writeFileSync(rootPath, clean, 'utf-8');

    // Act
    await removeJCenter(makeConfig());

    // Assert
    expect(read(rootPath)).toBe(clean);
  });
});
