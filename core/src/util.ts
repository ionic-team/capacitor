export const convertFileSrcServerUrl = (
  webviewServerUrl: string,
  filePath: string,
): string => {
  if (typeof filePath === 'string') {
    if (filePath.startsWith('/')) {
      return webviewServerUrl + '/_capacitor_file_' + filePath;
    }
    if (filePath.startsWith('file://')) {
      return (
        webviewServerUrl + filePath.replace('file://', '/_capacitor_file_')
      );
    }
    if (filePath.startsWith('content://')) {
      return (
        webviewServerUrl + filePath.replace('content:/', '/_capacitor_content_')
      );
    }
  }
  return filePath;
};

export enum ExceptionCode {
  /**
   * API is not implemented.
   *
   * This usually means the API can't be used because it is not implemented for
   * the current platform.
   */
  Unimplemented = 'UNIMPLEMENTED',

  /**
   * API is not available.
   *
   * This means the API can't be used right now because:
   *   - it is currently missing a prerequisite, such as network connectivity
   *   - it requires a particular platform or browser version
   */
  Unavailable = 'UNAVAILABLE',
}

export class CapacitorException extends Error {
  constructor(readonly message: string, readonly code?: ExceptionCode) {
    super(message);
  }
}
