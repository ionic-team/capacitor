module.exports = {
  ...require('@ionic/swiftlint-config'),
  included: ['${PWD}/ios', '${PWD}/ios-pods-template', '${PWD}/ios-spm-template'],
  excluded: ['${PWD}/ios/Tests', '${PWD}/ios/Frameworks', '${PWD}/.build', '${PWD}/ios/.build'],
};
