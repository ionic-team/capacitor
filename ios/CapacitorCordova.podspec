require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))
Pod::Spec.new do |s|
  s.name         = "CapacitorCordova"
  s.module_name  = 'Cordova'
  s.version      = package['version']
  s.summary      = "Capacitor Cordova Compatibility Layer"
  s.homepage     = "https://ionic-team.github.io/capacitor"
  s.license      = 'MIT'
  s.authors      = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source       = { :git => 'https://github.com/ionic-team/capacitor', :tag => s.version.to_s }
  s.platform     = :ios, 11.0
  s.source_files = 'CapacitorCordova/**/*.{h,m}'
  s.public_header_files = 'CapacitorCordova/CapacitorCordova/Classes/Public/*.h'
  s.requires_arc = true
  s.framework    = "WebKit"
end
