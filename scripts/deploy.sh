set -e

LERNA_JSON=`cat lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

echo "Deploying Capacitor v$LERNA_VERSION"

# This is what we do instead of letting lerna git commit for us
git add lerna.json
git add cli/package.json
git add core/package.json
git add electron/package.json
git add android/package.json
git add ios/package.json
git commit -m "Release v$LERNA_VERSION"
git tag $LERNA_VERSION -m $LERNA_VERSION
git push --follow-tags origin master