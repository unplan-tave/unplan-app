const { CodeGenerator, withPodfile } = require('expo/config-plugins');

// Xcode 27 requires iOS 15 or newer for Pods, including resource bundle targets.
const podDeploymentTarget = `    minimum_ios_version = Gem::Version.new('15.0')
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        version = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        next unless version && Gem::Version.correct?(version)
        next unless Gem::Version.new(version) < minimum_ios_version

        build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = minimum_ios_version.to_s
      end
    end`;

module.exports = function withIosPodDeploymentTarget(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = CodeGenerator.mergeContents({
      src: config.modResults.contents,
      newSrc: podDeploymentTarget,
      tag: 'unplan-ios-pod-deployment-target',
      anchor: /^\s*post_install do \|installer\|\s*$/,
      offset: 1,
      comment: '#',
    }).contents;
    return config;
  });
};
