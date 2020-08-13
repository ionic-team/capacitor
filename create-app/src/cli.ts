export function getOptionValue(
  args: readonly string[],
  arg: string,
): string | undefined;
export function getOptionValue(
  args: readonly string[],
  arg: string,
  defaultValue: string,
): string;
export function getOptionValue(
  args: readonly string[],
  arg: string,
  defaultValue?: string,
): string | undefined {
  const i = args.indexOf(arg);

  if (i >= 0) {
    return args[i + 1];
  }

  return defaultValue;
}

export const isTTY =
  process.stdin.isTTY && process.stdout.isTTY && process.stderr.isTTY;

export const emoji = (x: string, fallback: string): string =>
  process.platform === 'win32' ? fallback : x;
