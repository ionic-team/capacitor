set -e

# Verify pods are good
pod lib lint --allow-warnings

# Do the gradle
cd android
./gradlew clean build -b capacitor/build.gradle