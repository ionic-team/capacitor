#!/usr/bin/env bash

echo "Deploying android v$LERNA_VERSION"

cd android/capacitor

./gradlew clean build bintrayUpload -PbintrayUser=$BINTRAY_USER -PbintrayKey=$BINTRAY_KEY -PcapacitorVersion=$LERNA_VERSION -PdryRun=false