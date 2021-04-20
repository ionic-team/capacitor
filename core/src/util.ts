import type { WindowCapacitor } from './definitions-internal';

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

export const getPlatformId = (
  win: WindowCapacitor,
): 'android' | 'ios' | 'web' => {
  if (win?.androidBridge) {
    return 'android';
  } else if (win?.webkit?.messageHandlers?.bridge) {
    return 'ios';
  } else {
    return 'web';
  }
};
