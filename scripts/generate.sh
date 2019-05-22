set -e

LERNA_JSON=`cat lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

rm -rf capacitor-ios
mkdir capacitor-ios
cp -r ios capacitor-ios/ios/

sed "s/LERNA_VERSION/$LERNA_VERSION/g" scripts/deploy/package.json.template > capacitor-ios/package.json