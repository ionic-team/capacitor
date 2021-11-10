# Capacitor build
carthage build --no-skip-current --use-xcframeworks

# CapacitorCordova build
cd ios/CapacitorCordova
xcodebuild archive -scheme Cordova -sdk iphonesimulator SKIP_INSTALL=NO -archivePath Build/iOS-Simulator
xcodebuild archive -scheme Cordova -sdk iphoneos SKIP_INSTALL=NO -archivePath Build/iOS 
xcodebuild -create-xcframework -framework Build/iOS.xcarchive/Products/Library/Frameworks/Cordova.framework -framework Build/iOS-Simulator.xcarchive/Products/Library/Frameworks/Cordova.framework -output CapacitorCordova.xcframework
cd ../..

# Zip
mkdir Carthage/Build/CapacitorCordova.xcframework
mv ios/CapacitorCordova/CapacitorCordova.xcframework/* Carthage/Build/CapacitorCordova.xcframework
zip -r Capacitor.xcframework.zip Carthage/Build
rm -rf ios/CapacitorCordova/CapacitorCordova.xcframework
