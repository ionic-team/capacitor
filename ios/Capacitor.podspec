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
  s.social_media_url = 'https://twitter.com/capacitorjs'
  s.license = 'MIT'
  s.homepage = 'https://capacitorjs.com/'
  s.ios.deployment_target = '13.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { git: 'https://github.com/ionic-team/capacitor.git', tag: package['version'] }
  s.source_files = "#{prefix}Capacitor/Capacitor/*.{swift,h,m}", "#{prefix}Capacitor/Capacitor/Codable/*.{swift,h,m}",
                   "#{prefix}Capacitor/Capacitor/Plugins/*.{swift,h,m}", "#{prefix}Capacitor/Capacitor/Plugins/**/*.{swift,h,m}"
  s.module_map = "#{prefix}Capacitor/Capacitor/Capacitor.modulemap"
  s.resources = ["#{prefix}Capacitor/Capacitor/assets/native-bridge.js"]
  s.dependency 'CapacitorCordova'
  s.swift_version = '5.1'
end
