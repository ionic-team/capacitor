set -e

LERNA_JSON=`cat lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

echo "Deploying Capacitor v$LERNA_VERSION"

export POD_VERSION=$LERNA_VERSION

# Update the version number in the podspec
sed "s/POD_VERSION/'$POD_VERSION'/g" scripts/deploy/Capacitor.podspec.template > Capacitor.podspec
sed "s/POD_VERSION/'$POD_VERSION'/g" scripts/deploy/CapacitorCordova.podspec.template > CapacitorCordova.podspec

# This is what we do instead of letting lerna git commit for us
git add lerna.json
git add Capacitor.podspec
git add CapacitorCordova.podspec
git add cli/package.json
git add core/package.json
git add electron/package.json
git add android/package.json
git commit -m "Release v$LERNA_VERSION"
git tag $LERNA_VERSION -m $LERNA_VERSION
git push --follow-tags origin master

#rm -rf capacitor-ios

# Do the actual native deploys second, because they require tags/releases in github
bash scripts/deploy/android.sh
bash scripts/deploy/pods.sh
