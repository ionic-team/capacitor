LERNA_JSON=`cat ../lerna.json`;
export LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

export POD_VERSION=$LERNA_VERSION


# Update the version number in the podspec
sed "s/POD_VERSION/'$POD_VERSION'/g" ../scripts/deploy/Capacitor.podspec.template > Capacitor.podspec
sed "s/POD_VERSION/'$POD_VERSION'/g" ../scripts/deploy/CapacitorCordova.podspec.template > CapacitorCordova.podspec

