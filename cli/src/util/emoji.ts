// Emoji falback, right now just uses fallback on windows,
// but could expand to be more sophisticated to allow emoji
// on Hyper term on windows, for example.
export const emoji = (x: string, fallback: string): string => {
  if (process.platform === 'win32') {
    return fallback;
  }
  return x;
};
