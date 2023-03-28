#!/usr/bin/env bash

DIR=../android
LOG_OUTPUT=./tmp/capacitor-android.txt
CAP_VERSION=`grep '"version": ' $DIR/package.json | awk '{print $2}' | tr -d '",'`
echo Attempting to build and publish Capacitor native libraries with version $CAP_VERSION

# Make log dir if doesnt exist
mkdir -p ./tmp

# Export ENV variable used by Gradle for Versioning
export CAP_VERSION
export CAP_PUBLISH=true

# Get latest com.capacitorjs:core XML version info
CAPACITOR_PUBLISHED_URL="https://repo1.maven.org/maven2/com/capacitorjs/core/maven-metadata.xml"
CAPACITOR_PUBLISHED_DATA=$(curl -s $CAPACITOR_PUBLISHED_URL)
CAPACITOR_PUBLISHED_VERSION="$(perl -ne 'print and last if s/.*<latest>(.*)<\/latest>.*/\1/;' <<< $CAPACITOR_PUBLISHED_DATA)"

# Check if we need to publish a new native version of the Capacitor Android library
if [[ $CAP_VERSION == $CAPACITOR_PUBLISHED_VERSION ]]; then
    printf %"s\n" "Native Capacitor Android library version $CAPACITOR_PUBLISHED_VERSION is already published on MavenCentral, skipping."
else
    printf %"s\n" "Publishing $CAP_VERSION to MavenCentral production..."

    # Build and publish
    $DIR/gradlew clean build publishReleasePublicationToSonatypeRepository closeAndReleaseSonatypeStagingRepository --max-workers 1 -b $DIR/capacitor/build.gradle -Pandroid.useAndroidX=true > $LOG_OUTPUT 2>&1

    echo $RESULT

    if grep --quiet "BUILD SUCCESSFUL" $LOG_OUTPUT; then
        printf %"s\n" "Success: Capacitor Android Library published to MavenCentral."
    else
        printf %"s\n" "Error publishing, check $LOG_OUTPUT for more info! Manual publication review may be necessary at the Sonatype Repository Manager https://s01.oss.sonatype.org/"
        cat $LOG_OUTPUT
        exit 1
    fi
fi