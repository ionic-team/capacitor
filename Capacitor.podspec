Pod::Spec.new do |s|
  s.name = 'Capacitor'
  s.version = '1.2.1'
  s.summary = 'Capacitor for iOS'
	s.social_media_url = 'http://twitter.com/getcapacitor'
  s.license = 'MIT'
  s.homepage = 'https://capacitor.ionicframework.com/'
  s.ios.deployment_target  = '11.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :tag => s.version.to_s }
  s.source_files = 'ios/Capacitor/Capacitor/*.{swift,h,m}', 'ios/Capacitor/Capacitor/Plugins/*.{swift,h,m}', 'ios/Capacitor/Capacitor/Plugins/**/*.{swift,h,m}'
  s.dependency 'CapacitorCordova', '1.2.1'
  s.swift_version = '4.2'
end
