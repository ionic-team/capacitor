import { pathExists, readFile } from 'fs-extra';

import type { Config } from '../src/definitions';
import { doctorAndroid } from '../src/android/doctor';
import { readdirp } from '../src/util/fs';
import { readXML } from '../src/util/xml';

jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
  readFile: jest.fn(),
}));

jest.mock('../src/util/fs', () => ({
  readdirp: jest.fn(),
}));

jest.mock('../src/util/xml', () => ({
  readXML: jest.fn(),
}));

const mockedPathExists = pathExists as unknown as jest.Mock;
const mockedReadFile = readFile as unknown as jest.Mock;
const mockedReaddirp = readdirp as unknown as jest.Mock;
const mockedReadXML = readXML as unknown as jest.Mock;

const SRC_MAIN = '/app/android/app/src/main';
const JAVA_DIR = `${SRC_MAIN}/java`;
const KOTLIN_DIR = `${SRC_MAIN}/kotlin`;

type Layout = 'java' | 'kotlin' | 'both' | 'none' | 'kotlinEmpty';

interface WalkerStub {
  path: string;
  stats: { isDirectory: () => boolean };
}

const javaActivity: WalkerStub = {
  path: `${JAVA_DIR}/com/example/app/MainActivity.java`,
  stats: { isDirectory: () => false },
};

const kotlinActivity: WalkerStub = {
  path: `${KOTLIN_DIR}/com/example/app/MainActivity.kt`,
  stats: { isDirectory: () => false },
};

const FILES: Record<Layout, Record<string, WalkerStub[]>> = {
  java: { [JAVA_DIR]: [javaActivity] },
  kotlin: { [KOTLIN_DIR]: [kotlinActivity] },
  both: { [JAVA_DIR]: [javaActivity], [KOTLIN_DIR]: [kotlinActivity] },
  none: {},
  kotlinEmpty: { [KOTLIN_DIR]: [] },
};

const MANIFEST = {
  manifest: {
    application: [
      {
        activity: [
          {
            $: { 'android:name': 'com.example.app.MainActivity' },
            'intent-filter': [
              {
                action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
                category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
              },
            ],
          },
        ],
      },
    ],
  },
};

function makeConfig(): Config {
  return {
    android: {
      appDir: 'app',
      platformDir: 'android',
      srcMainDir: `${SRC_MAIN}`,
      assetsDir: `${SRC_MAIN}/assets`,
      webDir: `${SRC_MAIN}/assets/public`,
      appDirAbs: '/app/android/app',
      platformDirAbs: '/app/android',
      srcMainDirAbs: SRC_MAIN,
      assetsDirAbs: `${SRC_MAIN}/assets`,
      webDirAbs: `${SRC_MAIN}/assets/public`,
    },
  } as unknown as Config;
}

describe('doctorAndroid checkPackage', () => {
  let layout: Layout;

  beforeEach(() => {
    layout = 'kotlin';
    mockedPathExists.mockReset();
    mockedReadFile.mockReset();
    mockedReaddirp.mockReset();
    mockedReadXML.mockReset();

    mockedPathExists.mockImplementation((p: string) => {
      if (p === JAVA_DIR) {
        return layout === 'java' || layout === 'both';
      }
      if (p === KOTLIN_DIR) {
        return layout === 'kotlin' || layout === 'both' || layout === 'kotlinEmpty';
      }
      return true;
    });

    mockedReadFile.mockResolvedValue(
      "android { defaultConfig { applicationId 'com.example.app' } }",
    );

    mockedReaddirp.mockImplementation(
      async (dir: string, { filter }: { filter: (entry: WalkerStub) => boolean }) =>
        (FILES[layout][dir] ?? []).filter(filter).map((entry) => entry.path),
    );

    mockedReadXML.mockResolvedValue(MANIFEST);
  });

  it('passes for a Kotlin-only project (src/main/kotlin)', async () => {
    layout = 'kotlin';

    await expect(doctorAndroid(makeConfig())).resolves.toBeUndefined();
    expect(mockedPathExists).toHaveBeenCalledWith(KOTLIN_DIR);
    expect(mockedReaddirp).toHaveBeenCalledWith(KOTLIN_DIR, expect.anything());
    expect(mockedReaddirp).not.toHaveBeenCalledWith(JAVA_DIR, expect.anything());
  });

  it('passes for a classic Java project (no regression)', async () => {
    layout = 'java';

    await expect(doctorAndroid(makeConfig())).resolves.toBeUndefined();
    expect(mockedReaddirp).toHaveBeenCalledWith(JAVA_DIR, expect.anything());
    expect(mockedReaddirp).not.toHaveBeenCalledWith(KOTLIN_DIR, expect.anything());
  });

  it('passes when both java and kotlin source dirs exist', async () => {
    layout = 'both';

    await expect(doctorAndroid(makeConfig())).resolves.toBeUndefined();
    expect(mockedReaddirp).toHaveBeenCalledWith(JAVA_DIR, expect.anything());
    expect(mockedReaddirp).toHaveBeenCalledWith(KOTLIN_DIR, expect.anything());
  });

  it('reports the missing source dirs when neither java nor kotlin exists', async () => {
    layout = 'none';

    await expect(doctorAndroid(makeConfig())).rejects.toThrow(
      `directory is missing in ${SRC_MAIN}`,
    );
  });

  it('reports the missing main activity when the kotlin dir has no matching file', async () => {
    layout = 'kotlinEmpty';

    await expect(doctorAndroid(makeConfig())).rejects.toThrow(
      'Main activity file (MainActivity) is missing',
    );
  });
});