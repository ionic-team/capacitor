import { initBridge } from '../../native-bridge';
import type { CapacitorInstance, WindowCapacitor } from '../definitions-internal';
import { createCapacitor } from '../runtime';

describe('convertFileSrc', () => {
  let win: WindowCapacitor;
  let cap: CapacitorInstance;

  beforeEach(() => {
    win = {
      WEBVIEW_SERVER_URL: 'webviewSeverUrl',
    };
    initBridge(win);
    cap = createCapacitor(win);
  });

  it('starts with content://', () => {
    expect(cap.convertFileSrc('content://myfile')).toBe('webviewSeverUrl/_capacitor_content_/myfile');
  });

  it('starts with file://', () => {
    expect(cap.convertFileSrc('file://myfile')).toBe('webviewSeverUrl/_capacitor_file_myfile');
  });

  it('starts with /', () => {
    expect(cap.convertFileSrc('/myfile')).toBe('webviewSeverUrl/_capacitor_file_/myfile');
  });

  it('non string', () => {
    expect(cap.convertFileSrc(null)).toBe(null);
    expect(cap.convertFileSrc(undefined)).toBe(undefined);
    expect(cap.convertFileSrc(88 as any)).toBe(88);
    expect(cap.convertFileSrc('')).toBe('');
  });
});
