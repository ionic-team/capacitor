Pod::Spec.new do |s|
  s.name = 'Avocado'
  s.version = '0.0.1'
  s.summary = 'Avocado iOS Runtime'
  s.license = 'MIT'
  s.homepage = 'https://ionicframework.com'
  s.ios.deployment_target  = '10.0'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/avocado.git', :tag => s.version }
  s.source_files = 'Avocado/*.{swift,h,m}', 'Avocado/Plugins/*.{swift,h,m}', 'Avocado/Plugins/**/*.{swift,h,m}'
  s.resources = "Avocado/Scripts/*"
end
