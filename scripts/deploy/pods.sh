set -e

echo "Deploying iOS Pods v$POD_VERSION"

# Publish CapacitorCordova first
pod trunk push CapacitorCordova.podspec --allow-warnings

# Needed to ensure we can "see" the updated version of CapacitorCordova
pod repo update

# Finally, publish Capacitor
pod trunk push Capacitor.podspec --allow-warnings

# Again, needed to make sure we see the latest Capacitor locally
pod repo update