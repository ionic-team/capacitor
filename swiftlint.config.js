module.exports = {
  ...require('@ionic/swiftlint-config'),
  included: ['${PWD}/ios', '${PWD}/ios-template'],
  excluded: [
    '${PWD}/ios/Capacitor/CapacitorTests',
    '${PWD}/ios/Capacitor/TestsHostApp',
    '${PWD}/ios/Frameworks',
  ],
};
