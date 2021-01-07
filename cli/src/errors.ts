export abstract class BaseException<T> extends Error {
  constructor(readonly message: string, readonly code: T) {
    super(message);
  }
}

export class FatalException extends BaseException<'FATAL'> {
  constructor(readonly message: string, readonly exitCode = 1) {
    super(message, 'FATAL');
  }
}

export function fatal(message: string): never {
  throw new FatalException(message);
}

export function isFatal(e: any): e is FatalException {
  return e && e instanceof FatalException;
}
