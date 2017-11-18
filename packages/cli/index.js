const minimist = require('minimist'),
      shelljs = require('shelljs'),
      path = require('path');

const c = (...args) => {
  console.log('\x1b[32m[avocado]\x1b[0m', ...args);
}
const e = (...args) => {
  console.error('\x1b[31m[avocado]\x1b[0m', ...args);
}

const copy = (args) => {
  const platform = args.shift();
  c('copy', platform);

  const platformFolders = shelljs.ls(platform);
  const first = platformFolders[0];
  if(!first) {
    return 1;
  }

  const dest = path.join(platform, first, 'www');
  c('cp', '-R', 'www/*', dest);
  shelljs.cp('-R', 'www/*', dest);
}

const build = (args) => {
  shelljs.exec('npm run build');
}

const compile = (args) => {
};

const open = (args) => {
  const platform = args.shift();

  const platformFolders = shelljs.ls(platform);
  const first = platformFolders[0];
  if(!first) {
    return 1;
  }

  const dest = path.join(platform, first);

  if (platform == 'ios') {
    c('ls', )
    const proj = shelljs.ls(dest).filter(f => f.indexOf('.xcodeproj') >= 0)[0];
    if (!proj) {
      e('open', 'Unable to find Xcode project');
      return 1;
    }
    const fullPath = path.join(dest, proj);
    c('open', fullPath);
    shelljs.exec(`open ${fullPath}`);
  }
}

// int main() {
const args = minimist(process.argv.slice(2));

const command = args._[0];

switch(command) {
  case 'copy': 
    return copy(args._.slice(1));
  case 'build':
    return build(args._.slice(1));
  case 'compile':
    return compile(args._.slice(1));
  case 'open':
    return open(args._.slice(1));
}
// }