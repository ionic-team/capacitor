Pod::Spec.new do |s|
  s.name = 'CordovaPluginsResources'
  s.version = '0.0.105'
  s.summary = 'Resources for Cordova plugins'
  s.license = 'MIT'
  s.homepage = 'https://capacitorjs.com/'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :tag => s.version.to_s }
  s.resources = ['resources/*']
end
