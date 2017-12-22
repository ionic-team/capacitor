Pod::Spec.new do |s|
  s.name         = "AvocadoCordova"
  s.module_name = 'Cordova'
  s.version      = "1.0.0"
  s.summary      = "Avocado Cordova Compatibility Bridge"
  s.homepage     = "https://ionicframework.com"
  s.license      = 'MIT'
  s.author       = "jcesarmobile"
  s.source       = { :git => 'https://github.com/ionic-team/avocado', :tag => s.version }
  s.platform     = :ios, 10.0
  s.source_files = 'AvocadoCordova/**/*.{h,m}'
  s.public_header_files = 'AvocadoCordova/Classes/Public/*.h'
  s.requires_arc = true
  s.framework    = "WebKit"
end
