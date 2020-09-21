export const convertToUnixPath = (path: string): string => {
  return path.replace(/\\/g, '/');
};
