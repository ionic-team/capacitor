LERNA_JSON=`cat lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

mkdir capacitor-ios
cp -r ios capacitor-ios/ios/
cp Capacitor.podspec capacitor-ios/
cp CapacitorCordova.podspec capacitor-ios/
sed "s/LERNA_VERSION/$LERNA_VERSION/g" scripts/deploy/package.json.template > capacitor-ios/package.json

