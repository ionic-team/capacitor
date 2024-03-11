#!/usr/bin/env sh
set -eo pipefail

export NATIVE_PUBLISH=true

case $1 in
     lint) 
       pod lib lint ios/CapacitorCordova.podspec --allow-warnings
       pod lib lint ios/Capacitor.podspec --allow-warnings;;

     publish) 
       pod trunk push ios/CapacitorCordova.podspec --allow-warnings
       pod trunk push ios/Capacitor.podspec --allow-warnings;;

     *) echo "'lint' or 'publish' were not provided. Exiting...";;
esac
