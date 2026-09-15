import { mkdirp, readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';

import type { Config } from '../src/definitions';
import { logger } from '../src/log';
import { migrateToEdgeToEdge, __testables } from '../src/tasks/migrate-edge-to-edge';

import { mktmp } from './util';

const { JAVA, KOTLIN, addImports, hasEdgeToEdgeEnabled, patchActivitySource } = __testables;

// MainActivity.java of an app created with Capacitor 8
const CAP8_ACTIVITY = `package com.example.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}
`;

// MainActivity.java of an app created with Capacitor 9
const CAP9_ACTIVITY = `package com.example.app;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
    }
}
`;

const ACTIVITY_WITH_ONCREATE = `package com.example.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setBackgroundDrawable(null);
    }
}
`;

const ACTIVITY_WITHOUT_ONCREATE = `package com.example.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void doNothing() {}
}
`;

const KOTLIN_ACTIVITY_WITH_ONCREATE = `package com.example.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }
}
`;

const KOTLIN_ACTIVITY_WITHOUT_BODY = `package com.example.app

import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity()
`;

describe('patchActivitySource', () => {
  it('turns a Capacitor 8 activity into the Capacitor 9 one', () => {
    // Arrange
    const source = CAP8_ACTIVITY;

    // Act
    const result = patchActivitySource(source, JAVA);

    // Assert
    expect(result).toBe(CAP9_ACTIVITY);
  });

  it('adds the enable call to an existing onCreate', () => {
    // Arrange
    const source = ACTIVITY_WITH_ONCREATE;

    // Act
    const result = patchActivitySource(source, JAVA);

    // Assert
    expect(result).toContain(
      '        super.onCreate(savedInstanceState);\n' +
        '        EdgeToEdge.enable(this);\n' +
        '        getWindow().setBackgroundDrawable(null);\n',
    );
  });

  it('adds only the missing imports, in sorted position', () => {
    // Arrange
    const source = ACTIVITY_WITH_ONCREATE;

    // Act
    const result = patchActivitySource(source, JAVA);

    // Assert
    expect(result).toContain(
      'import android.os.Bundle;\nimport androidx.activity.EdgeToEdge;\nimport com.getcapacitor.BridgeActivity;\n',
    );
  });

  it('appends the onCreate override to an activity that has other members', () => {
    // Arrange
    const source = ACTIVITY_WITHOUT_ONCREATE;

    // Act
    const result = patchActivitySource(source, JAVA);

    // Assert
    expect(result).toBe(`package com.example.app;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void doNothing() {}

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
    }
}
`);
  });

  it('adds the enable call to an existing Kotlin onCreate', () => {
    // Arrange
    const source = KOTLIN_ACTIVITY_WITH_ONCREATE;

    // Act
    const result = patchActivitySource(source, KOTLIN);

    // Assert
    expect(result).toBe(`package com.example.app

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
    }
}
`);
  });

  it('gives up on a Kotlin activity without a class body', () => {
    // Arrange
    const source = KOTLIN_ACTIVITY_WITHOUT_BODY;

    // Act
    const result = patchActivitySource(source, KOTLIN);

    // Assert
    expect(result).toBeUndefined();
  });
});

describe('hasEdgeToEdgeEnabled', () => {
  it('finds the Java call', () => {
    expect(hasEdgeToEdgeEnabled(CAP9_ACTIVITY)).toBe(true);
  });

  it('finds the Kotlin call', () => {
    expect(hasEdgeToEdgeEnabled('    enableEdgeToEdge()\n')).toBe(true);
  });

  it('does not count the Kotlin import as the call', () => {
    expect(hasEdgeToEdgeEnabled('import androidx.activity.enableEdgeToEdge\n')).toBe(false);
  });

  it('returns false for an untouched activity', () => {
    expect(hasEdgeToEdgeEnabled(CAP8_ACTIVITY)).toBe(false);
  });
});

describe('addImports', () => {
  it('leaves an import that is already there alone', () => {
    // Arrange
    const source = CAP9_ACTIVITY;

    // Act
    const result = addImports(source, JAVA.imports);

    // Assert
    expect(result).toBe(CAP9_ACTIVITY);
  });

  it('adds imports to a file that has none', () => {
    // Arrange
    const source = 'package com.example.app;\n\npublic class MainActivity {}\n';

    // Act
    const result = addImports(source, ['import android.os.Bundle;']);

    // Assert
    expect(result).toBe('package com.example.app;\nimport android.os.Bundle;\n\npublic class MainActivity {}\n');
  });
});

describe('edge-to-edge migration against a project on disk', () => {
  let tmpDir: any;
  let javaDir: string;
  let activityPath: string;

  beforeEach(async () => {
    jest.spyOn(logger, 'info').mockImplementation();
    jest.spyOn(logger, 'warn').mockImplementation();

    tmpDir = await mktmp();
    javaDir = join(tmpDir.path, 'android', 'app', 'src', 'main', 'java', 'com', 'example', 'app');
    activityPath = join(javaDir, 'MainActivity.java');
    await mkdirp(javaDir);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tmpDir.cleanupCallback();
  });

  function makeConfig(insetsHandling?: string): Config {
    return {
      android: { srcMainDirAbs: join(tmpDir.path, 'android', 'app', 'src', 'main') },
      app: { extConfig: { plugins: { SystemBars: { insetsHandling } } } },
    } as unknown as Config;
  }

  it('patches the activity extending BridgeActivity', async () => {
    // Arrange
    writeFileSync(activityPath, CAP8_ACTIVITY, 'utf-8');

    // Act
    await migrateToEdgeToEdge(makeConfig());

    // Assert
    expect(readFileSync(activityPath, 'utf-8')).toBe(CAP9_ACTIVITY);
  });

  it('leaves the activity alone when insetsHandling is disabled', async () => {
    // Arrange
    writeFileSync(activityPath, CAP8_ACTIVITY, 'utf-8');

    // Act
    await migrateToEdgeToEdge(makeConfig('disable'));

    // Assert
    expect(readFileSync(activityPath, 'utf-8')).toBe(CAP8_ACTIVITY);
  });

  it('does not enable edge-to-edge twice', async () => {
    // Arrange
    writeFileSync(activityPath, CAP8_ACTIVITY, 'utf-8');

    // Act
    await migrateToEdgeToEdge(makeConfig());
    await migrateToEdgeToEdge(makeConfig());

    // Assert
    expect(readFileSync(activityPath, 'utf-8')).toBe(CAP9_ACTIVITY);
  });

  it('warns when there is no activity extending BridgeActivity', async () => {
    // Arrange
    writeFileSync(join(javaDir, 'MyPlugin.java'), 'package com.example.app;\n', 'utf-8');

    // Act
    await migrateToEdgeToEdge(makeConfig());

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('no Activity extending BridgeActivity'));
  });

  it('warns and skips when more than one activity extends BridgeActivity', async () => {
    // Arrange
    const otherPath = join(javaDir, 'OtherActivity.java');
    writeFileSync(activityPath, CAP8_ACTIVITY, 'utf-8');
    writeFileSync(otherPath, CAP8_ACTIVITY.replace('MainActivity', 'OtherActivity'), 'utf-8');

    // Act
    await migrateToEdgeToEdge(makeConfig());

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('more than one Activity'));
    expect(readFileSync(activityPath, 'utf-8')).toBe(CAP8_ACTIVITY);
  });

  it('warns when the android platform is not there', async () => {
    // Act
    await migrateToEdgeToEdge({
      android: { srcMainDirAbs: join(tmpDir.path, 'missing') },
      app: { extConfig: {} },
    } as unknown as Config);

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('no Activity extending BridgeActivity'));
  });
});
