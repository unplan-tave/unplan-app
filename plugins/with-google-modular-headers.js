const { withPodfile } = require('@expo/config-plugins');

const GOOGLE_MODULAR_HEADER_PODS = [
  "  pod 'GoogleUtilities', :modular_headers => true",
  "  pod 'RecaptchaInterop', :modular_headers => true",
];

module.exports = function withGoogleModularHeaders(config) {
  return withPodfile(config, (podfileConfig) => {
    const missingPods = GOOGLE_MODULAR_HEADER_PODS.filter(
      (pod) => !podfileConfig.modResults.contents.includes(pod),
    );

    if (missingPods.length === 0) {
      return podfileConfig;
    }

    let hasTarget = false;

    podfileConfig.modResults.contents = podfileConfig.modResults.contents.replace(
      /(target ['"][^'"]+['"] do)(\r?\n)/,
      (_, targetDeclaration, newline) => {
        hasTarget = true;
        return `${targetDeclaration}${newline}${missingPods.join(newline)}${newline}`;
      },
    );

    if (!hasTarget) {
      throw new Error('Unable to add Google modular headers: iOS target not found in Podfile.');
    }

    return podfileConfig;
  });
};
