export const identity = v => v;
export const pipe =
  (...fns) =>
  v =>
    fns.reduce((r, fn) => fn(r), v);
