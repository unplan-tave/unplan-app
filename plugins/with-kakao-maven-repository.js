const { withProjectBuildGradle } = require('expo/config-plugins');

const KAKAO_MAVEN_REPOSITORY = 'https://devrepo.kakao.com/nexus/content/groups/public/';
const ALLPROJECTS_REPOSITORIES_PATTERN = /allprojects\s*\{\s*repositories\s*\{/;

function addKakaoMavenRepository(buildGradle) {
  if (buildGradle.includes(KAKAO_MAVEN_REPOSITORY)) {
    return buildGradle;
  }

  if (!ALLPROJECTS_REPOSITORIES_PATTERN.test(buildGradle)) {
    throw new Error('Could not find allprojects.repositories in android/build.gradle.');
  }

  return buildGradle.replace(
    ALLPROJECTS_REPOSITORIES_PATTERN,
    (match) => `${match}
        maven { url "${KAKAO_MAVEN_REPOSITORY}" }`,
  );
}

module.exports = function withKakaoMavenRepository(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addKakaoMavenRepository(config.modResults.contents);
    }

    return config;
  });
};
