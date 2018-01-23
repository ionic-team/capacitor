# Make sure the version numbers are properly incremented in each podspect
# and that a tag corresponding to the version was pushed to github!

# Publish CapacitorCordova first
pod trunk push CapacitorCordova.podspec --allow-warnings

# Needed to ensure we can "see" the updated version of CapacitorCordova
pod repo update

# Finally, publish Capacitor
pod trunk push Capacitor.podspec --allow-warnings

# Again, needed to make sure we see the latest Capacitor locally
pod repo update