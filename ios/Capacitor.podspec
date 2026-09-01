require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
prefix = if ENV['NATIVE_PUBLISH'] == 'true'
           'ios/'
         else
           ''
         end

Pod::Spec.new do |s|
  s.name = 'Capacitor'
  s.version = package['version']
  s.summary = 'Capacitor for iOS'
  s.license = 'MIT'
  s.homepage = 'https://capacitorjs.com/'
  s.ios.deployment_target = '16.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { git: 'https://github.com/ionic-team/capacitor.git', tag: package['version'] }
  s.source_files = [
    "#{prefix}Sources/Capacitor/**/*.{swift,h,m}",
    "#{prefix}Sources/CapacitorObjC/**/*.{h,m}",
    "#{prefix}Sources/CapacitorObjCShims/**/*.{h,m}"
  ]
  # Swift macros are an SPM-only feature; exclude their declarations so the CocoaPods build
  # doesn't try to resolve #externalMacro against a plugin target it can't build.
  #
  # `Capacitor-Swift.h` is an SPM-only shim that re-exposes the generated Swift interface at the
  # `<Capacitor/Capacitor-Swift.h>` path; under CocoaPods that header is generated for real, so the
  # shim must be excluded to avoid clobbering it.
  s.exclude_files = [
    "#{prefix}Sources/Capacitor/Macros.swift",
    "#{prefix}Sources/CapacitorObjCShims/include/Capacitor/Capacitor-Swift.h"
  ]
  s.resources = ["#{prefix}Sources/Capacitor/assets/native-bridge.js"]
  s.resource_bundles = { 'Capacitor' => ["#{prefix}Sources/Capacitor/PrivacyInfo.xcprivacy"] }
  s.swift_version = '5.1'
end
