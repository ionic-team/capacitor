Pod::Spec.new do |s|
  s.name         = "CapacitorCordova"
  s.module_name = 'Cordova'
  s.version      = "0.0.1"
  s.summary      = "Capacitor Cordova Compatibility Bridge"
  s.homepage     = "https://ionicframework.com"
  s.license      = 'MIT'
  s.author       = "jcesarmobile"
  s.source       = { :git => 'https://github.com/ionic-team/capacitor', :tag => s.version }
  s.platform     = :ios, 10.0
  s.source_files = 'CapacitorCordova/**/*.{h,m}'
  s.public_header_files = 'CapacitorCordova/Classes/Public/*.h'
  s.requires_arc = true
  s.framework    = "WebKit"
end
