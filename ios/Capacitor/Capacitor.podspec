Pod::Spec.new do |s|
  s.name = 'Capacitor'
  s.version = '0.0.1'
  s.summary = 'Capacitor iOS Runtime'
  s.license = 'MIT'
  s.homepage = 'https://getcapacitor.com'
  s.ios.deployment_target  = '10.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :tag => s.version }
  s.source_files = 'Capacitor/*.{swift,h,m}', 'Capacitor/Plugins/*.{swift,h,m}', 'Capacitor/Plugins/**/*.{swift,h,m}'
  s.dependency 'CapacitorCordova', '0.0.1'
  s.dependency 'GCDWebServer', '~> 3.0'
end
