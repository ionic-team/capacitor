#!/usr/bin/env bash

echo "Deploying android v$LERNA_VERSION"

cd android

export BINTRAY_PKG_VERSION=$LERNA_VERSION

./gradlew clean build -b capacitor/build.gradle  -Pandroid.useAndroidX=true -Pandroid.enableJetifier=true bintrayUpload -PbintrayUser=$BINTRAY_USER -PbintrayKey=$BINTRAY_KEY -PdryRun=false