var execSync = require('child_process').execSync;

function main() {
  try {
    execSync('git add ./CHANGELOG.md');
    execSync('git commit -m "chore(changelog): update changelog for release"');
  } catch (ex) {
    console.log('Failed to complete commiting changelog - ', ex.message);
    process.exit(1);
  }
}