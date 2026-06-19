const { withPodfile } = require('@expo/config-plugins');

const GOOGLE_MODULAR_HEADER_PODS = [
  "  pod 'GoogleUtilities', :modular_headers => true",
  "  pod 'RecaptchaInterop', :modular_headers => true",
];

module.exports = function withGoogleModularHeaders(config) {
  return withPodfile(config, (podfileConfig) => {
    if (GOOGLE_MODULAR_HEADER_PODS.every((pod) => podfileConfig.modResults.contents.includes(pod))) {
      return podfileConfig;
    }

    podfileConfig.modResults.contents = podfileConfig.modResults.contents.replace(
      /(target ['"][^'"]+['"] do\n)/,
      `$1${GOOGLE_MODULAR_HEADER_PODS.join('\n')}\n`,
    );

    return podfileConfig;
  });
};
