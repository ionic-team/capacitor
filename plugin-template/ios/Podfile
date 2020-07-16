platform :ios, '11.0'

def capacitor_pods
  # Comment the next line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!
  pod 'Capacitor', :path => '../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../node_modules/@capacitor/ios'
end

target 'Plugin' do
  capacitor_pods
end

target 'PluginTests' do
  capacitor_pods
end
