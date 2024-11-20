module.exports = {
  ...require('@ionic/swiftlint-config'),
  included: ['${PWD}/ios', '${PWD}/ios-pods-template', '${PWD}/ios-spm-template'],
  excluded: ['${PWD}/ios/Capacitor/CapacitorTests', '${PWD}/ios/Capacitor/TestsHostApp', '${PWD}/ios/Frameworks'],
};
