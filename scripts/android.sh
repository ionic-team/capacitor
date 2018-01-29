cd android

./gradlew clean build -b capacitor/build.gradle bintrayUpload -PbintrayUser=$BINTRAY_USER -PbintrayKey=$BINTRAY_KEY -PdryRun=false