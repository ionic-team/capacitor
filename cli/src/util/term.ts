export const isInteractive = () => {
  return Boolean(
    process.stdin.isTTY && process.stdout.isTTY && process.stderr.isTTY,
  );
};
