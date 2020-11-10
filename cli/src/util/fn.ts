export const tryFn = async <T extends (...args: any[]) => Promise<R>, R>(
  fn: T,
  ...args: any[]
): Promise<R | null> => {
  try {
    return await fn(...args);
  } catch {
    // ignore
  }

  return null;
};
