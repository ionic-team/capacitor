import type { CapacitorInstance, GlobalInstance } from '../definitions';
import { createCapacitor } from '../runtime';

describe('convertFileSrc', () => {
  let instance: CapacitorInstance;
  const gbl: GlobalInstance = {
    WEBVIEW_SERVER_URL: 'webSeverUrl',
  };

  beforeEach(() => {
    instance = createCapacitor(gbl);
  });

  it('starts with content://', () => {
    expect(instance.convertFileSrc('content://myfile')).toBe(
      'webSeverUrl/_capacitor_content_/myfile',
    );
  });

  it('starts with file://', () => {
    expect(instance.convertFileSrc('file://myfile')).toBe(
      'webSeverUrl/_capacitor_file_myfile',
    );
  });

  it('starts with /', () => {
    expect(instance.convertFileSrc('/myfile')).toBe(
      'webSeverUrl/_capacitor_file_/myfile',
    );
  });

  it('non string', () => {
    expect(instance.convertFileSrc(null)).toBe(null);
    expect(instance.convertFileSrc(undefined)).toBe(undefined);
    expect(instance.convertFileSrc(88 as any)).toBe(88);
    expect(instance.convertFileSrc('')).toBe('');
  });
});
