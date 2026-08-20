module.exports = {
  ...require('@ionic/swiftlint-config'),
  included: ['${PWD}/ios', '${PWD}/ios-pods-template', '${PWD}/ios-spm-template'],
  excluded: ['${PWD}/ios/Tests/CapacitorTests', '${PWD}/ios/Frameworks'],
};
