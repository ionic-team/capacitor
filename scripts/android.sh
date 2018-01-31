#!/usr/bin/env bash

LERNA_JSON=`cat lerna.json`;
LERNA_VERSION="$(node -pe "JSON.parse(\`$LERNA_JSON\`)['version']")"

echo "Deploying android v$LERNA_VERSION"

cd android

export BINTRAY_PKG_VERSION=$LERNA_VERSION

./gradlew clean build -b capacitor/build.gradle bintrayUpload -PbintrayUser=$BINTRAY_USER -PbintrayKey=$BINTRAY_KEY -PdryRun=false