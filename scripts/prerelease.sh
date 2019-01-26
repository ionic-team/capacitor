set -e

[ -z "$ANDROID_HOME" ] && echo "ANDROID_HOME is not set. Please set it before running this script." && exit 1;

# Verify pods are good
pod spec lint --allow-warnings Capacitor.podspec
pod spec lint --allow-warnings CapacitorCordova.podspec

# Do the gradle
cd android
./gradlew clean build -b capacitor/build.gradle
