import { logError } from "../common";

// Given input variables to a command, make sure all are provided if the terminal
// is not interactive (because we won't be able to prompt the user)
export const checkInteractive = (...args: string[]) => {
  if (Boolean(process.stdin.isTTY && process.stdout.isTTY && process.stderr.isTTY)) {
    return true;
  }

  // Make sure none of the provided args are empty, otherwise print the interactive
  // warning and return false
  if (!!args.filter(arg => !!!arg).length) {
    logError('Non-interactive shell detected. Run the command with --help to see a list of arguments that must be provided.');
    return false;
  }
}