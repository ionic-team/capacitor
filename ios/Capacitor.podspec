require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))
Pod::Spec.new do |s|
  s.name = 'Capacitor'
  s.version = package['version']
  s.summary = 'Capacitor for iOS'
	s.social_media_url = 'http://twitter.com/getcapacitor'
  s.license = 'MIT'
  s.homepage = 'https://capacitor.ionicframework.com/'
  s.ios.deployment_target  = '11.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :tag => s.version.to_s }
  s.source_files = 'Capacitor/Capacitor/*.{swift,h,m}', 'Capacitor/Capacitor/Plugins/*.{swift,h,m}', 'Capacitor/Capacitor/Plugins/**/*.{swift,h,m}'
  s.dependency 'CapacitorCordova'
  s.swift_version = '5.0'
end
