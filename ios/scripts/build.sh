#!/bin/bash

XCBEAUTIFY_COMMAND=$(which xcbeautify)
XCODEBUILD_COMMAND=$(which xcodebuild)
SCHEME="Capacitor"
WORKSPACE="Capacitor.xcworkspace"
BUILD_DIR="./build"
SIMULATOR_BUILD_DIR="${BUILD_DIR}/iOS-Simulator"
DEVICE_BUILD_DIR="${BUILD_DIR}/iOS-Device"
SIMULATOR_PLATFORM="generic/platform=iOS Simulator"
DEVICE_PLATFORM="generic/platform=iOS"
LOG_FILE="capacitor-build.log"

archive_capacitor() {
    PLATFORM=$1
    ARCHIVE_PATH=$2

    ${XCODEBUILD_COMMAND} archive \
    -scheme "${SCHEME}" \
    -workspace "${WORKSPACE}" \
    -destination "${PLATFORM}" \
    -archivePath "${ARCHIVE_PATH}" \
    SKIP_INSTALL=NO \
    SWIFT_SERIALIZE_DEBUGGING_OPTIONS=NO \
    DEBUG_INFORMATION_FORMAT="dwarf-with-dsym" \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES
}

create_xcframework() {
    PRODUCT=$1

    ${XCODEBUILD_COMMAND} -create-xcframework \
    -framework "${SIMULATOR_BUILD_DIR}.xcarchive/Products/Library/Frameworks/${PRODUCT}.framework" \
    -debug-symbols "${PWD}/${SIMULATOR_BUILD_DIR}.xcarchive/dSYMs/${PRODUCT}.framework.dSYM" \
    -framework "${DEVICE_BUILD_DIR}.xcarchive/Products/Library/Frameworks/${PRODUCT}.framework" \
    -debug-symbols "${PWD}/${DEVICE_BUILD_DIR}.xcarchive/dSYMs/${PRODUCT}.framework.dSYM" \
    -output ${PRODUCT}.xcframework | tee -a ${LOG_FILE} | ${XCBEAUTIFY_COMMAND}
}

build_capacitor() {
  case $1 in
    simulator)
    echo "Build and Archive for Simulator..." | tee -a ${LOG_FILE}
    archive_capacitor "${SIMULATOR_PLATFORM}" "${SIMULATOR_BUILD_DIR}" | tee -a ${LOG_FILE} | ${XCBEAUTIFY_COMMAND}
    ;;
    device)
    echo "Build and Archive for Device..." | tee -a ${LOG_FILE}
    archive_capacitor "${DEVICE_PLATFORM}" "${DEVICE_BUILD_DIR}" | tee -a ${LOG_FILE} | ${XCBEAUTIFY_COMMAND}
    ;;
    *)
    echo -n "Unknown Build Type"
    exit 1
    ;;
  esac
}

build_capacitor "simulator"
build_capacitor "device"

# Do we need these? if so, why?
# rm -rf ${SIMULATOR_BUILD_DIR}.xcarchive/Products/Library/Frameworks/Capacitor.framework/Frameworks
# rm -rf ${DEVICE_BUILD_DIR}.xcarchive/Products/Library/Frameworks/Capacitor.framework/Frameworks

create_xcframework "Capacitor"
create_xcframework "Cordova"
