if [ ! -z $BINTRAY_USER]; then
  echo "Must define BINTRAY_USER and BINTRAY_KEY env var before deploying. See https://github.com/ionic-team/capacitor/blob/master/.github/CONTRIBUTING.md"
fi

LERNA_JSON=`cat lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

if [ ! -z $STARTER_PATH]; then
  STARTER_PATH=../capacitor-starter
fi

echo "Deploying Capacitor v$LERNA_VERSION"

bash scripts/deploy/pods.sh
bash scripts/deploy/android.sh
bash scripts/deploy/starter.sh ../capacitor-starter

# This is what we do instead of letting lerna git commit for us
git add lerna.json
git add Capacitor.podspec
git add CapacitorCordova.podspec
git add cli/package.json
git add core/package.json
git tag $LERNA_VERSION
git push --tags
git commit -m "Release v$LERNA_VERSION"
git push origin master