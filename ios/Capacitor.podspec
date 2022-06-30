require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))
portals_dev_head = `git rev-parse origin/3.x`.strip
Pod::Spec.new do |s|
  s.name = 'Capacitor'
  s.version = package['version']
  s.summary = 'Capacitor for iOS'
  s.social_media_url = 'https://twitter.com/capacitorjs'
  s.license = 'MIT'
  s.homepage = 'https://capacitorjs.com/'
  s.ios.deployment_target  = '12.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :commit => portals_dev_head }
  s.source_files = 'ios/Capacitor/Capacitor/*.{swift,h,m}', 'ios/Capacitor/Capacitor/Plugins/*.{swift,h,m}', 'ios/Capacitor/Capacitor/Plugins/**/*.{swift,h,m}'
  s.module_map = 'ios/Capacitor/Capacitor/Capacitor.modulemap'
  s.resources = ['ios/Capacitor/Capacitor/assets/native-bridge.js']
  s.dependency 'CapacitorCordova'
  s.swift_version = '5.1'
end
