require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
prefix = if ENV['NATIVE_PUBLISH'] == 'true'
           'ios/'
         else
           ''
         end

Pod::Spec.new do |s|
  s.name         = 'CapacitorCordova'
  s.module_name  = 'Cordova'
  s.version      = package['version']
  s.summary      = 'Capacitor Cordova Compatibility Layer'
  s.homepage     = 'https://capacitorjs.com'
  s.license      = 'MIT'
  s.authors      = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source       = { git: 'https://github.com/ionic-team/capacitor', tag: s.version.to_s }
  s.platform     = :ios, 16.0
  s.source_files = "#{prefix}Sources/CapacitorCordova/**/*.{h,m,swift}"
  s.public_header_files = "#{prefix}Sources/CapacitorCordova/Classes/Public/*.h",
                          "#{prefix}Sources/CapacitorCordova/CapacitorCordova.h"
  s.module_map = "#{prefix}Sources/CapacitorCordova/CapacitorCordova.modulemap"
  s.resource_bundles = { 'CapacitorCordova' => ["#{prefix}Sources/CapacitorCordova/PrivacyInfo.xcprivacy"] }
  s.requires_arc = true
  s.dependency 'Capacitor', s.version.to_s
  s.framework    = 'WebKit'
end
