export function allSerial<T>(funcs: (() => Promise<T>)[]): Promise<T[]> {
  return funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(x => result.concat(x))),
    Promise.resolve<T[]>([]),
  );
}

export type PromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => void;

export type PromiseOnFulfilled<T, TResult> =
  | ((value: T) => TResult | PromiseLike<TResult>)
  | undefined
  | null;

export type PromiseOnRejected<TResult> =
  | ((reason: any) => TResult | PromiseLike<TResult>)
  | undefined
  | null;

export class LazyPromise<T> extends Promise<T> {
  private _executor: PromiseExecutor<T>;
  private _promise?: Promise<T>;

  constructor(executor: PromiseExecutor<T>) {
    super(() => {
      /* ignore */
    });

    this._executor = executor;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: PromiseOnFulfilled<T, TResult1>,
    onrejected?: PromiseOnRejected<TResult2>,
  ): Promise<TResult1 | TResult2> {
    this._promise = this._promise || new Promise(this._executor);
    return this._promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: PromiseOnRejected<TResult>,
  ): Promise<T | TResult> {
    this._promise = this._promise || new Promise(this._executor);
    return this._promise.catch(onrejected);
  }
}

export function lazy<T>(fn: () => T | Promise<T>): LazyPromise<T> {
  return new LazyPromise<T>(async (resolve, reject) => {
    try {
      resolve(await fn());
    } catch (e) {
      reject(e);
    }
  });
}
