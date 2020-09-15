export function allSerial<T>(funcs: (() => Promise<T>)[]): Promise<T[]> {
  return funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(x => result.concat(x))),
    Promise.resolve<T[]>([]),
  );
}
