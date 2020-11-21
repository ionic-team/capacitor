#!/bin/sh

PWD=$(pwd)
WEB_ASSET_DIR="$PWD/public"

if [ ! -d $WEB_ASSET_DIR ]; then
  echo "Warning: '$WEB_ASSET_DIR' does not exist. Did you forget to copy a web-build?"
fi

# Expand this script for more restrictive safety checks, e.g. "capsafe" from https://github.com/fkirc/capacitor-build-safety
