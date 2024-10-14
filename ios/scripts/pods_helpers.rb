def assertDeploymentTarget(installer)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # ensure IPHONEOS_DEPLOYMENT_TARGET is at least 14.0
      deployment_target = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f
      should_upgrade = deployment_target < 14.0 && deployment_target != 0.0
      if should_upgrade
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0'
      end
    end
  end
end