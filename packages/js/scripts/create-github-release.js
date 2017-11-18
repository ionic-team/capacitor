var path = require('path');
var execSync = require('child_process').execSync;

var GithubApi = require('github');

var changelogCommand = './node_modules/.bin/conventional-changelog -p angular';

var packageJsonPath = path.join(__dirname, '..', 'package.json');
var packageJson = require(packageJsonPath);

var github = new GithubApi({ version: '3.0.0'});

github.authenticate({ type: 'oauth', token: process.env.GH_TOKEN });

var changelogContent = execSync(changelogCommand).toString();

github.releases.createRelease({
  owner: 'driftyco',
  repo: 'ionic-app-scripts',
  target_commitish: 'master',
  tag_name: 'v' + packageJson.version,
  name: packageJson.version,
  body: changelogContent,
  prerelease: false
}, function(err, result) {
  if (err) {
    console.log('[create-github-release] An error occurred: ' + err.message);
    process.exit(1);
  }
  else {
    console.log('[create-github-release]: Process succeeded');
  }
});