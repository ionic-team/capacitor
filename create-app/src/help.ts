const help = `
  Usage: npm init @capacitor/app

  Options:

    --name <name> ............. Human-friendly app name
    --package-id <id> ......... Unique app ID in reverse-DNS notation
    --dir <path> .............. Path of new app's directory

    -h, --help ................ Print help, then quit
    --verbose ................. Print verbose output to stderr
`;

export const run = () => {
  process.stdout.write(help);
};
