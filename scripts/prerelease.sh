set -e

[ -z "$ANDROID_HOME" ] && echo "ANDROID_HOME is not set. Please set it before running this script." && exit 1;

if [ -z $BINTRAY_USER ]; then
  echo "Must define BINTRAY_USER and BINTRAY_KEY env var before deploying. See https://github.com/ionic-team/capacitor/blob/master/.github/CONTRIBUTING.md"
  exit 1
fi

# Verify pods are good
pod lib lint --allow-warnings Capacitor.podspec
pod lib lint --allow-warnings CapacitorCordova.podspec

# Do the gradle
cd android
./gradlew clean build -b capacitor/build.gradle -Pandroid.useAndroidX=true -Pandroid.enableJetifier=true

