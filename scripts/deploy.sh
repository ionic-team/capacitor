if [ ! -z $BINTRAY_USER]; then
  echo "Must define BINTRAY_USER and BINTRAY_KEY env var before deploying. See https://github.com/ionic-team/capacitor/blob/master/.github/CONTRIBUTING.md"
fi

LERNA_JSON=`cat lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

if [ ! -z $STARTER_PATH]; then
  STARTER_PATH=../capacitor-starter
fi

echo "Deploying Capacitor v$LERNA_VERSION"

#git tag $LERNA_VERSION
#git push --tags
bash scripts/deploy/pods.sh
bash scripts/deploy/android.sh
bash scripts/deploy/starter.sh ../capacitor-starter