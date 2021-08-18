#!/usr/bin/env bash

DIR=../android
LOG_OUTPUT=./tmp/capacitor-android.txt
CAP_VERSION=`grep '"version": ' $DIR/package.json | awk '{print $2}' | tr -d '",'`
echo Attempting to build and publish Capacitor native libraries with version $CAP_VERSION

# Make log dir if doesnt exist
mkdir -p ./tmp

# Export ENV variable used by Gradle for Versioning
export CAP_VERSION

# Build and publish
$DIR/gradlew clean build publishCapacitorPublicationToGithubPackagesRepository -b $DIR/capacitor/build.gradle -Pandroid.useAndroidX=true -Pandroid.enableJetifier=true > $LOG_OUTPUT 2>&1

echo $RESULT 

if grep --quiet "Conflict" $LOG_OUTPUT; then
    printf %"s\n\n" "Duplicate: a published capacitor exists for version $CAP_VERSION, skipping."
else
    if grep --quiet "BUILD SUCCESSFUL" $LOG_OUTPUT; then
        printf %"s\n\n" "Success: capacitor version $CAP_VERSION published."
    else
        printf %"s\n\n" "Error publishing, check $LOG_OUTPUT for more info!"
        cat $LOG_OUTPUT
        exit 1
    fi
fi
