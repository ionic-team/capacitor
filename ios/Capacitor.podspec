require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))
Pod::Spec.new do |s|
  s.name = 'Capacitor'
  s.version = package['version']
  s.summary = 'Capacitor for iOS'
  s.social_media_url = 'https://twitter.com/capacitorjs'
  s.license = 'MIT'
  s.homepage = 'https://capacitorjs.com/'
  s.ios.deployment_target  = '12.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :tag => s.version.to_s }
  s.source_files = 'Capacitor/Capacitor/*.{swift,h,m}', 'Capacitor/Capacitor/Plugins/*.{swift,h,m}', 'Capacitor/Capacitor/Plugins/**/*.{swift,h,m}'
  s.module_map = 'Capacitor/Capacitor/Capacitor.modulemap'
  s.resources = ['Capacitor/Capacitor/assets/native-bridge.js']
  s.dependency 'CapacitorCordova'
  s.swift_version = '5.0'
end
