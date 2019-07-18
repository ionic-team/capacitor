## [1.1.1](https://github.com/ionic-team/capacitor/compare/1.1.0...1.1.1) (2019-07-18)


### Bug Fixes

* fix(cli): npmignore local.properties from android-template ([#1700](https://github.com/ionic-team/capacitor/pull/1700))
* fix(cordova): handle new plugins podspec tag ([#1712](https://github.com/ionic-team/capacitor/pull/1712))
* fix(cordova): replace Firebase import objective-c files ([#1716](https://github.com/ionic-team/capacitor/pull/1716))
* fix(cli/init): check if project already uses yarn before prompting ([#1708](https://github.com/ionic-team/capacitor/pull/1708))
* fix(web): support for App 'appStateChange' event ([#1715](https://github.com/ionic-team/capacitor/pull/1715))
* fix(cordova): Read DisableDeploy preference before setting start path ([#1724](https://github.com/ionic-team/capacitor/pull/1724))
* fix(push): registrationError not working on Android ([#1725](https://github.com/ionic-team/capacitor/pull/1725))
* fix(android): resolve share call ([#1764](https://github.com/ionic-team/capacitor/pull/1764))
* fix(android/ios): expose getPlatform method in Capacitor object ([#1766](https://github.com/ionic-team/capacitor/pull/1766))
* fix(cli): check for plugins in devDependencies ([#1769](https://github.com/ionic-team/capacitor/pull/1769))
* fix(android): enable full screen video ([#1763](https://github.com/ionic-team/capacitor/pull/1763))
* fix(android): splash spinner bar not properly handled in view ([#1734](https://github.com/ionic-team/capacitor/pull/1734))
* fix(ios): read enableHighAccuracy geolocation option ([#1773](https://github.com/ionic-team/capacitor/pull/1773))
* fix(android): better proxy mimeType detection for Capacitor injection ([#1774](https://github.com/ionic-team/capacitor/pull/1774))


### Docs

* docs(keyboard): move import before usage in sample code ([#1702](https://github.com/ionic-team/capacitor/pull/1702))
* docs: Add new community tutorials ([#1641](https://github.com/ionic-team/capacitor/pull/1641))
* docs: Fix install link on web section ([#1721](https://github.com/ionic-team/capacitor/pull/1721))
* docs: add cap-bluetooth-low-energy-client  ([#1768](https://github.com/ionic-team/capacitor/pull/1768))


### Chores

* chore(cli): Create 'convertToUnixPath' in fs-utils function ([#1699](https://github.com/ionic-team/capacitor/pull/1699))



## [1.1.0](https://github.com/ionic-team/capacitor/compare/1.0.0...1.1.0) (2019-06-21)


### Bug Fixes

* fix(android): Make Storage.clear() return promise ([#1570](https://github.com/ionic-team/capacitor/pull/1570))
* fix(android): Make proxy only inject Capacitor to html mime type files ([#1574](https://github.com/ionic-team/capacitor/pull/1574))
* fix: make capacitor compatible with commonjs ([#1575](https://github.com/ionic-team/capacitor/pull/1575))
* fix(cli): consider empty target/file in config-file/edit-config tags ([#1584](https://github.com/ionic-team/capacitor/pull/1584))
* fix(core): Remove browser from package.json ([#1597](https://github.com/ionic-team/capacitor/pull/1597))
* Fix(camera web): Reject promise if pwa-elements return error ([#1598](https://github.com/ionic-team/capacitor/pull/1598))
* fix(cli): Updating log entries for missing .plist entries to warnings ([#1605](https://github.com/ionic-team/capacitor/pull/1605))
* Fix(cli): Allow to add ios platform from windows ([#1607](https://github.com/ionic-team/capacitor/pull/1607))
* fix(electron): Prevent promises both resolving and rejecting ([#1618](https://github.com/ionic-team/capacitor/pull/1618))
* fix(cli): cordova plugins merges before clobbers ([#1616](https://github.com/ionic-team/capacitor/pull/1616))
* fix(cordova): forward requestCode 0 to Cordova plugins ([#1635](https://github.com/ionic-team/capacitor/pull/1635))
* fix(electron-template): update @capacitor/electron dependency to use final version ([#1630](https://github.com/ionic-team/capacitor/pull/1630))
* fix(electron): incorrect path being used for Filesystem.stat ([#1619](https://github.com/ionic-team/capacitor/pull/1619))
* fix(electron): Filesystem.rmdir not using directory ([#1623](https://github.com/ionic-team/capacitor/pull/1623))
* fix(ios): print warning without exiting if index not found ([9778c4c](https://github.com/ionic-team/capacitor/commit/9778c4c))
* Fix(core): Avoid prompting empty error if null ([#1639](https://github.com/ionic-team/capacitor/pull/1639))
* fix(ios): ignore Podfile.lock ([#1588](https://github.com/ionic-team/capacitor/pull/1588))
* fix(cli): Avoid empty feature in config.xml ([#1643](https://github.com/ionic-team/capacitor/pull/1643))
* fix(cli): Allow to filter incompatible plugins per platform ([#1645](https://github.com/ionic-team/capacitor/pull/1645))
* fix(cordova): Add CDVHandleOpenURLWithAppSourceAndAnnotationNotification constant ([#1650](https://github.com/ionic-team/capacitor/pull/1650))
* fix(cordova): Define pluginObjects in CDVViewController ([#1651](https://github.com/ionic-team/capacitor/pull/1651))
* fix(ios): lower case test matching host ([ded8df8](https://github.com/ionic-team/capacitor/commit/ded8df8))
* fix(cli): improve npx cap open message if no platform present ([#1654](https://github.com/ionic-team/capacitor/pull/1654))
* Fix(android): remove incorrect trailing newline in readFile when using encoding ([#1626](https://github.com/ionic-team/capacitor/pull/1626))
* Fix(cli): Only open Android Studio if path is set ([#1656](https://github.com/ionic-team/capacitor/pull/1656))
* fix(ios): support multiline text in Toast ([#1661](https://github.com/ionic-team/capacitor/pull/1661))
* fix(electron): add .gitignore ([#1662](https://github.com/ionic-team/capacitor/pull/1662))
* Fix(electron): make npx cap open electron run electron app ([#1666](https://github.com/ionic-team/capacitor/pull/1666))
* fix(cordova): implement getUrl method ([#1677](https://github.com/ionic-team/capacitor/pull/1677))
* fix(electron): typo in no plugin message ([#1681](https://github.com/ionic-team/capacitor/pull/1681))
* fix:(electron): fix Filesystem.readdir ([#1690](https://github.com/ionic-team/capacitor/pull/1690))
* fix(cli): adjust path for old structure plugins in windows ([#1692](https://github.com/ionic-team/capacitor/pull/1692))
* fix(cli): prevent npx cap init from blocking ([#1693](https://github.com/ionic-team/capacitor/pull/1693))


### Features

* feat(ios): move CAPConfig to be per-instance rather than a singleton ([e964068](https://github.com/ionic-team/capacitor/commit/e964068))
* feat(native-bridge): kill the error modal with 🔥 ([3ef2135](https://github.com/ionic-team/capacitor/commit/3ef2135))
* feat(electron): deprecate injectCapacitor method ([#1671](https://github.com/ionic-team/capacitor/pull/1671))
* feat(splashscreen): Add support for spinner on Android and iOS ([#1653](https://github.com/ionic-team/capacitor/pull/1653))
* feat(Filesystem): Add move implementation ([#1624](https://github.com/ionic-team/capacitor/pull/1624))
* feat(splashscreen): Added backgroundColor to Splash Screen plugin. ([#1649](https://github.com/ionic-team/capacitor/pull/1649))
* feat(webview): Add backgroundColor configuration option ([#1696](https://github.com/ionic-team/capacitor/pull/1696))
* feat(ios): add configuration option to disable logs ([#1697](https://github.com/ionic-team/capacitor/pull/1697))


### Docs

* header box shadow on scroll ([fb118f7](https://github.com/ionic-team/capacitor/commit/fb118f7))
* Added missing parenthesis to README ([#1571](https://github.com/ionic-team/capacitor/pull/1571))
* fix broken link ([#1565](https://github.com/ionic-team/capacitor/pull/1565))
* Fix(docs): Avoid the special char replacement on code samples ([#1587](https://github.com/ionic-team/capacitor/pull/1587))
* Update plugins.md ([#1590](https://github.com/ionic-team/capacitor/pull/1590))
* docs(storage): update example ([#1591](https://github.com/ionic-team/capacitor/pull/1591))
* docs(modals): fix code highlighting ([#1592](https://github.com/ionic-team/capacitor/pull/1592))
* Fix(docs): Remove note about pwa-elements import not working ([#1586](https://github.com/ionic-team/capacitor/pull/1586))
* This is Capacitor!! - Meta title fix ([939c7af](https://github.com/ionic-team/capacitor/commit/939c7af))
* Docs: added links to deploy to ios and android. ([#1593](https://github.com/ionic-team/capacitor/pull/1593))
* Docs: Fixed API list issue ([#1602](https://github.com/ionic-team/capacitor/pull/1602))
* Docs: Add more community guides to APIs and comm guides pages ([#1594](https://github.com/ionic-team/capacitor/pull/1594))
* Unclosed code tag in markdown ([#1613](https://github.com/ionic-team/capacitor/pull/1613))
* Docs(README): Remove beta note ([fefbdcc](https://github.com/ionic-team/capacitor/commit/fefbdcc))
* [Docs] Added appId, appName and npmClient to Configuration ([#1614](https://github.com/ionic-team/capacitor/pull/1614)) 
* fix(docs): use objectivec for syntax highlighting objc ([d467c9f](https://github.com/ionic-team/capacitor/commit/d467c9f))
* Docs: Remove iOS info from Android Plugin docs ([#1647](https://github.com/ionic-team/capacitor/pull/1647))
* Docs: Update Forum link to point to Ionic Forum ([#1657](https://github.com/ionic-team/capacitor/pull/1657))
* docs(electron): add updating markdown file ([#1668](https://github.com/ionic-team/capacitor/pull/1668))
* docs: some improvements on updating guides ([#1675](https://github.com/ionic-team/capacitor/pull/1675))
* fixing xml/html code example escaping ([f6e7152](https://github.com/ionic-team/capacitor/commit/f6e7152))
* adding objective C syntax highlighting support ([8c6b9f4](https://github.com/ionic-team/capacitor/commit/8c6b9f4))


### Chores

* Chore(cli): Remove unused files from plugin template ([#1629](https://github.com/ionic-team/capacitor/pull/1629))
* Update .gitignore file in android-template ([#1580](https://github.com/ionic-team/capacitor/pull/1580))
* chore(cli): Autodetect Android Studio path on Windows ([#1633](https://github.com/ionic-team/capacitor/pull/1633)) 
* chore(electron): improve template and dependency installation ([#1664](https://github.com/ionic-team/capacitor/pull/1664))
* chore(electron): update electron template to not use injectCapacitor ([#1672](https://github.com/ionic-team/capacitor/pull/1672))
* note about updating ios native deps taking forever first time ([f2090c3](https://github.com/ionic-team/capacitor/commit/f2090c3))