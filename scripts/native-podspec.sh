#!/usr/bin/sh
set -eo pipefail

patch -u ios/Capacitor.podspec -i ios/Capacitor.podspec.patch
patch -u ios/CapacitorCordova.podspec -i ios/CapacitorCordova.podspec.patch

case $1 in
     lint) 
       pod spec lint ios/CapacitorCordova.podspec --allow-warnings
       pod spec lint ios/Capacitor.podspec --allow-warnings;;

     publish) 
       pod trunk push ios/CapacitorCordova.podspec --allow-warnings
       pod trunk push ios/Capacitor.podspec --allow-warnings;;

     *) echo "'lint' or 'publish' were not provided. Exiting...";;
esac

git restore ios/Capacitor.podspec ios/CapacitorCordova.podspec
