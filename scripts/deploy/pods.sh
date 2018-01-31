export POD_VERSION=$LERNA_VERSION

echo "Deploying iOS Pods v$POD_VERSION"

sed "s/POD_VERSION/'$POD_VERSION'/g" scripts/deploy/Capacitor.podspec.template > Capacitor.podspec
sed "s/POD_VERSION/'$POD_VERSION'/g" scripts/deploy/CapacitorCordova.podspec.template > CapacitorCordova.podspec

# Publish CapacitorCordova first
pod trunk push CapacitorCordova.podspec --allow-warnings

# Needed to ensure we can "see" the updated version of CapacitorCordova
pod repo update

# Finally, publish Capacitor
pod trunk push Capacitor.podspec --allow-warnings

# Again, needed to make sure we see the latest Capacitor locally
pod repo update