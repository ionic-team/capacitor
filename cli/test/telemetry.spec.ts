import { pathExists } from 'fs-extra';

import type { Config, IOSConfig } from '../src/definitions';
import { getIOSPackageManager } from '../src/telemetry';

jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
}));

const mockedPathExists = pathExists as unknown as jest.Mock;

function makeConfig(ios: Partial<IOSConfig>): Config {
  return { ios } as unknown as Config;
}

describe('getIOSPackageManager', () => {
  beforeEach(() => {
    mockedPathExists.mockReset();
  });

  it('returns "unknown" when the iOS platform directory does not exist', async () => {
    mockedPathExists.mockResolvedValueOnce(false);

    const result = await getIOSPackageManager(
      makeConfig({
        platformDirAbs: '/tmp/no-such-dir/ios',
        packageManager: Promise.resolve('SPM'),
      }),
    );

    expect(result).toBe('unknown');
    expect(mockedPathExists).toHaveBeenCalledWith('/tmp/no-such-dir/ios');
  });

  it('returns the resolved package manager when iOS is present', async () => {
    mockedPathExists.mockResolvedValueOnce(true);

    const result = await getIOSPackageManager(
      makeConfig({
        platformDirAbs: '/tmp/app/ios',
        packageManager: Promise.resolve('SPM'),
      }),
    );

    expect(result).toBe('SPM');
  });

  it('returns "unknown" when packageManager resolution throws', async () => {
    mockedPathExists.mockResolvedValueOnce(true);

    const result = await getIOSPackageManager(
      makeConfig({
        platformDirAbs: '/tmp/app/ios',
        packageManager: Promise.reject(new Error('boom')),
      }),
    );

    expect(result).toBe('unknown');
  });
});
