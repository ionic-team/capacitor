set -e

# Verify pods are good
pod spec lint --allow-warnings Capacitor.podspec
pod spec lint --allow-warnings CapacitorCordova.podspec

# Do the gradle
cd android/capacitor
./gradlew clean build