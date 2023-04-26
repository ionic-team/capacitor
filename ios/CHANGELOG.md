# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.8.0](https://github.com/ionic-team/capacitor/compare/4.7.3...4.8.0) (2023-04-26)


### Bug Fixes

* **http:** copy native response url to fetch response ([42d2eb3](https://github.com/ionic-team/capacitor/commit/42d2eb3c3c04e087b88df7252cd2c323b00a3f95))


### Features

* **ios:** add webContentsDebuggingEnabled configuration ([#6500](https://github.com/ionic-team/capacitor/issues/6500)) ([b9e345a](https://github.com/ionic-team/capacitor/commit/b9e345a8f02229650eabc829d49c9d9e7227eb57))





## [4.7.3](https://github.com/ionic-team/capacitor/compare/4.7.2...4.7.3) (2023-03-31)

**Note:** Version bump only for package @capacitor/ios





## [4.7.2](https://github.com/ionic-team/capacitor/compare/4.7.1...4.7.2) (2023-03-31)

**Note:** Version bump only for package @capacitor/ios





## [4.7.1](https://github.com/ionic-team/capacitor/compare/4.7.0...4.7.1) (2023-03-16)


### Bug Fixes

* **iOS:** Separate cookies by ; rather than ; when accessing through document.cookie (Cap 4.x) ([#6380](https://github.com/ionic-team/capacitor/issues/6380)) ([1902b77](https://github.com/ionic-team/capacitor/commit/1902b77213e36bd9899634e7c86c9a02aab39932))





# [4.7.0](https://github.com/ionic-team/capacitor/compare/4.6.3...4.7.0) (2023-02-22)


### Bug Fixes

* handle fetch headers that are Headers objects ([#6320](https://github.com/ionic-team/capacitor/issues/6320)) ([cb00e49](https://github.com/ionic-team/capacitor/commit/cb00e4952acca8e877555f30b2190f6685d25934))
* **ios:** Avoid double encoding on http urls ([#6288](https://github.com/ionic-team/capacitor/issues/6288)) ([4768085](https://github.com/ionic-team/capacitor/commit/4768085414768bb2c013afcc6c645664893cd297))
* **ios:** Correctly Attach Headers to Request ([#6303](https://github.com/ionic-team/capacitor/issues/6303)) ([a3f875c](https://github.com/ionic-team/capacitor/commit/a3f875cf42e111fde07d6e87643264b19ed77573))





## [4.6.3](https://github.com/ionic-team/capacitor/compare/4.6.2...4.6.3) (2023-02-03)


### Bug Fixes

* **ios:** crash when http headers contain numbers ([#6251](https://github.com/ionic-team/capacitor/issues/6251)) ([028c556](https://github.com/ionic-team/capacitor/commit/028c556a50b41ee99fe8f4f1aa2f42d3fd57f92d))





## [4.6.2](https://github.com/ionic-team/capacitor/compare/4.6.1...4.6.2) (2023-01-17)


### Bug Fixes

* **ios:** CapacitorHttp cannot use delete method ([#6220](https://github.com/ionic-team/capacitor/issues/6220)) ([4d238a9](https://github.com/ionic-team/capacitor/commit/4d238a9e0dcf1e3e8c105c3aa4c7361abf16398e))
* **ios:** encode whitespace in http plugin urls ([#6169](https://github.com/ionic-team/capacitor/issues/6169)) ([dccb0a9](https://github.com/ionic-team/capacitor/commit/dccb0a99850c7c878906156a509ecd675836ef1a))
* **ios/android:** better http error handling ([#6208](https://github.com/ionic-team/capacitor/issues/6208)) ([7d4d70a](https://github.com/ionic-team/capacitor/commit/7d4d70a0500b7996c710c0762907f44bdf27c92b))





## [4.6.1](https://github.com/ionic-team/capacitor/compare/4.6.0...4.6.1) (2022-12-05)

**Note:** Version bump only for package @capacitor/ios





# [4.6.0](https://github.com/ionic-team/capacitor/compare/4.5.0...4.6.0) (2022-12-01)


### Bug Fixes

* **cookies:** Use Set-Cookie headers to persist cookies ([57f8b39](https://github.com/ionic-team/capacitor/commit/57f8b39d7f4c5ee0e5e5cb316913e9450a81d22b))


### Features

* **ios:** Plugin Registration and Plugin Instance Support ([#6072](https://github.com/ionic-team/capacitor/issues/6072)) ([9f1d863](https://github.com/ionic-team/capacitor/commit/9f1d863c1222096334a0dd05f39ce7f984a2763a))





# [4.5.0](https://github.com/ionic-team/capacitor/compare/4.4.0...4.5.0) (2022-11-16)


### Bug Fixes

* **cli/ios:** Read handleApplicationNotifications configuration option ([#6030](https://github.com/ionic-team/capacitor/issues/6030)) ([99ccf18](https://github.com/ionic-team/capacitor/commit/99ccf181f6ee8a00ed97bdbf9076e2b2ea27cd57))


### Features

* **cookies:** add get cookies plugin method ([ba1e770](https://github.com/ionic-team/capacitor/commit/ba1e7702a3338714aee24388c0afea39706c9341))





# [4.4.0](https://github.com/ionic-team/capacitor/compare/4.3.0...4.4.0) (2022-10-21)


### Bug Fixes

* **cookies:** make document.cookie setter synchronous ([2272abf](https://github.com/ionic-team/capacitor/commit/2272abf3d3d9dc82d9ca0d03b17e2b78f11f61fc))
* **http:** fix local http requests on native platforms ([c4e040a](https://github.com/ionic-team/capacitor/commit/c4e040a6f8c6b54bac6ae320e5f0f008604fe50f))





# [4.3.0](https://github.com/ionic-team/capacitor/compare/4.2.0...4.3.0) (2022-09-21)


### Bug Fixes

* **core:** Exception object was not set on Cap ([#5917](https://github.com/ionic-team/capacitor/issues/5917)) ([9ca27a4](https://github.com/ionic-team/capacitor/commit/9ca27a4f8441b368f8bf9d97dda57b1a55ac0e4e))


### Features

* Capacitor Cookies & Capacitor Http core plugins ([d4047cf](https://github.com/ionic-team/capacitor/commit/d4047cfa947676777f400389a8d65defae140b45))





# [4.2.0](https://github.com/ionic-team/capacitor/compare/4.1.0...4.2.0) (2022-09-08)

**Note:** Version bump only for package @capacitor/ios





# [4.1.0](https://github.com/ionic-team/capacitor/compare/4.0.1...4.1.0) (2022-08-18)


### Bug Fixes

* **ios:** Prevent Xcode 14 warning on CAPWebView ([#5821](https://github.com/ionic-team/capacitor/issues/5821)) ([66954ef](https://github.com/ionic-team/capacitor/commit/66954ef6bc93f2038d85a386ef2f8b582af11bc3))
* **ios:** return proper mimeType on M1 x86_64 simulators ([#5853](https://github.com/ionic-team/capacitor/issues/5853)) ([325b6fe](https://github.com/ionic-team/capacitor/commit/325b6fe83939efaaef44c7e8624e33de742a57e2)), closes [#5793](https://github.com/ionic-team/capacitor/issues/5793)


### Features

* **ios:** Add `setServerBasePath(_:)` to CAPBridgeProtocol ([#5860](https://github.com/ionic-team/capacitor/issues/5860)) ([76f28e7](https://github.com/ionic-team/capacitor/commit/76f28e70a5c0a03e4c6b9a93a0c068666a2c38ff))





## [4.0.1](https://github.com/ionic-team/capacitor/compare/4.0.0...4.0.1) (2022-07-28)


### Bug Fixes

* **ios:** publish Podfile script ([#5799](https://github.com/ionic-team/capacitor/issues/5799)) ([604f03a](https://github.com/ionic-team/capacitor/commit/604f03a29bc500d2841987d0a0f1b20d34fba7d6))





# [4.0.0](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.2...4.0.0) (2022-07-27)


### Bug Fixes

* **ios:** error data is optional ([#5782](https://github.com/ionic-team/capacitor/issues/5782)) ([da48d79](https://github.com/ionic-team/capacitor/commit/da48d798c3463de9de188ae6a6475fd6afba6091))


### Features

* **android:** Add Optional Data Param for Error Object ([#5719](https://github.com/ionic-team/capacitor/issues/5719)) ([174172b](https://github.com/ionic-team/capacitor/commit/174172b6c64dc9117c48ed0e20c25e0b6c2fb625))
* **android:** Use addWebMessageListener where available ([#5427](https://github.com/ionic-team/capacitor/issues/5427)) ([c2dfe80](https://github.com/ionic-team/capacitor/commit/c2dfe808446717412b35e82713d123b7a052f264))
* **ios:** Add overrideable router var for CAPWebView. ([#5743](https://github.com/ionic-team/capacitor/issues/5743)) ([c1de1c0](https://github.com/ionic-team/capacitor/commit/c1de1c0138aad188a760118e35983d10d257f8e7))
* **iOS:** post install script for deployment target ([#5783](https://github.com/ionic-team/capacitor/issues/5783)) ([f5afa94](https://github.com/ionic-team/capacitor/commit/f5afa94b3b9c246d87b2af03359840f503bace90))
* Add option for custom error page ([#5723](https://github.com/ionic-team/capacitor/issues/5723)) ([e8bdef3](https://github.com/ionic-team/capacitor/commit/e8bdef3b4634e4ad45fa8fc34c7c0ab8dfa383f3))





# [4.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.1...4.0.0-beta.2) (2022-07-08)


### Bug Fixes

* **ios:** Add check for both serverURL and localURL in navigation ([#5736](https://github.com/ionic-team/capacitor/issues/5736)) ([8e824f3](https://github.com/ionic-team/capacitor/commit/8e824f33ad4df898fb8c0936a8f5e9041832a5c5))
* **ios:** properly deliver retained events after listener re-add [#5732](https://github.com/ionic-team/capacitor/issues/5732) ([c5d6328](https://github.com/ionic-team/capacitor/commit/c5d632831924a1bcc868bc46b42f7ff619408752))


### Features

* **ios:** Add `setServerBasePath(path:)` to CAPWebView ([#5742](https://github.com/ionic-team/capacitor/issues/5742)) ([1afbf8a](https://github.com/ionic-team/capacitor/commit/1afbf8a9dd0b8f7b1ac439d24e5d8ba26f786318))
* Add CapWebView  ([#5715](https://github.com/ionic-team/capacitor/issues/5715)) ([143d266](https://github.com/ionic-team/capacitor/commit/143d266ef0a818bac59dbbdaeda3b5c382ebfa1d))





# [4.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.0...4.0.0-beta.1) (2022-06-27)


### Bug Fixes

* **ios:** Remove Cordova as an embedded framework ([#5709](https://github.com/ionic-team/capacitor/issues/5709)) ([bbf6d24](https://github.com/ionic-team/capacitor/commit/bbf6d248bf9217a5c5c6c15c7bcfeda209aba5b1))


### Features

* **ios:** Allow to configure popover size ([#5717](https://github.com/ionic-team/capacitor/issues/5717)) ([ca1a125](https://github.com/ionic-team/capacitor/commit/ca1a125e5ab05d6066dd303bc75e99dfe21f210a))





# [4.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.6.0...4.0.0-beta.0) (2022-06-17)


### Bug Fixes

* **ios:** make removeAllListeners return a promise ([#5526](https://github.com/ionic-team/capacitor/issues/5526)) ([815f71b](https://github.com/ionic-team/capacitor/commit/815f71b6b62f6c4d5f66e6a36c190bb00a96fdcc))


### Features

* **ios:** add getConfig to CAPPlugin ([#5495](https://github.com/ionic-team/capacitor/issues/5495)) ([224a9d0](https://github.com/ionic-team/capacitor/commit/224a9d075629d9c9da9ddc658eb282617fc46d09))
* **ios:** Add preferredContentMode configuration option ([#5583](https://github.com/ionic-team/capacitor/issues/5583)) ([5b6dfa3](https://github.com/ionic-team/capacitor/commit/5b6dfa3fe29c85632546b299f03cc04a77cf7475))
* **ios:** Support of range requests on WebViewAssetHandler ([#5659](https://github.com/ionic-team/capacitor/issues/5659)) ([348c08d](https://github.com/ionic-team/capacitor/commit/348c08d511e9d57a1b2ecedc3290c65fa9ba3924))





# [3.6.0](https://github.com/ionic-team/capacitor/compare/3.5.1...3.6.0) (2022-06-17)


### Bug Fixes

* **ios:** Use `URL(fileURLWithPath:)` instead of `URL(string:)` ([#5603](https://github.com/ionic-team/capacitor/issues/5603)) ([5fac1b2](https://github.com/ionic-team/capacitor/commit/5fac1b2da5aa5882087716cb2aa862d89173f4a1))


### Features

* **iOS, Android:** add AppUUID Lib for plugins ([#5690](https://github.com/ionic-team/capacitor/issues/5690)) ([05e76cf](https://github.com/ionic-team/capacitor/commit/05e76cf526a44e07fa75f9482fa2223a13918638))





# [4.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.2) (2022-05-12)


### Bug Fixes

* **ios:** make removeAllListeners return a promise ([#5526](https://github.com/ionic-team/capacitor/issues/5526)) ([815f71b](https://github.com/ionic-team/capacitor/commit/815f71b6b62f6c4d5f66e6a36c190bb00a96fdcc))


### Features

* **ios:** add getConfig to CAPPlugin ([#5495](https://github.com/ionic-team/capacitor/issues/5495)) ([224a9d0](https://github.com/ionic-team/capacitor/commit/224a9d075629d9c9da9ddc658eb282617fc46d09))
* **ios:** Add preferredContentMode configuration option ([#5583](https://github.com/ionic-team/capacitor/issues/5583)) ([5b6dfa3](https://github.com/ionic-team/capacitor/commit/5b6dfa3fe29c85632546b299f03cc04a77cf7475))






## [3.5.1](https://github.com/ionic-team/capacitor/compare/3.5.0...3.5.1) (2022-05-04)

**Note:** Version bump only for package @capacitor/ios





# [3.5.0](https://github.com/ionic-team/capacitor/compare/3.4.3...3.5.0) (2022-04-22)


### Features

* **ios:** Add overrideable routing for CAPBridgeViewController subclasses ([#5546](https://github.com/ionic-team/capacitor/issues/5546)) ([8875d5e](https://github.com/ionic-team/capacitor/commit/8875d5e2721e8a8ee763ce70cb672db383f36efa))





# [4.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.1) (2022-03-25)


### Features

* **ios:** add getConfig to CAPPlugin ([#5495](https://github.com/ionic-team/capacitor/issues/5495)) ([224a9d0](https://github.com/ionic-team/capacitor/commit/224a9d075629d9c9da9ddc658eb282617fc46d09))





## [3.4.3](https://github.com/ionic-team/capacitor/compare/3.4.2...3.4.3) (2022-03-04)

**Note:** Version bump only for package @capacitor/ios





## [3.4.2](https://github.com/ionic-team/capacitor/compare/3.4.1...3.4.2) (2022-03-03)

**Note:** Version bump only for package @capacitor/ios




## [3.4.1](https://github.com/ionic-team/capacitor/compare/3.4.0...3.4.1) (2022-02-09)


### Bug Fixes

* **ios:** Reload webView on webViewWebContentProcessDidTerminate ([#5391](https://github.com/ionic-team/capacitor/issues/5391)) ([beebff4](https://github.com/ionic-team/capacitor/commit/beebff4550575c28c233937a11a8eacf5a76411c))





# [3.4.0](https://github.com/ionic-team/capacitor/compare/3.3.4...3.4.0) (2022-01-19)


### Features

* **ios:** Add new iOS 15 Motion permission delegate ([#5317](https://github.com/ionic-team/capacitor/issues/5317)) ([c05a3cb](https://github.com/ionic-team/capacitor/commit/c05a3cbbf02217e3972d5e067970cae18bff3faa))
* **ios:** Add new iOS15 media capture permission delegate ([#5196](https://github.com/ionic-team/capacitor/issues/5196)) ([d8b54ac](https://github.com/ionic-team/capacitor/commit/d8b54ac23414bfe56e50e1254066630a6f87eb0e))





## [3.3.4](https://github.com/ionic-team/capacitor/compare/3.3.3...3.3.4) (2022-01-05)

**Note:** Version bump only for package @capacitor/ios





## [3.3.3](https://github.com/ionic-team/capacitor/compare/3.3.2...3.3.3) (2021-12-08)


### Bug Fixes

* **ios:** Present js alert on top of the presented VC ([#5282](https://github.com/ionic-team/capacitor/issues/5282)) ([a53d236](https://github.com/ionic-team/capacitor/commit/a53d236452e99d1e6151e19e313b3d1545957419))





## [3.3.2](https://github.com/ionic-team/capacitor/compare/3.3.1...3.3.2) (2021-11-17)

**Note:** Version bump only for package @capacitor/ios





## [3.3.1](https://github.com/ionic-team/capacitor/compare/3.3.0...3.3.1) (2021-11-05)

**Note:** Version bump only for package @capacitor/ios





# [3.3.0](https://github.com/ionic-team/capacitor/compare/3.2.5...3.3.0) (2021-11-03)


### Bug Fixes

* **core:** avoid crash on logging circular objects ([#5186](https://github.com/ionic-team/capacitor/issues/5186)) ([1451ec8](https://github.com/ionic-team/capacitor/commit/1451ec850a9ef73267a032638e73f1fc440647b9))
* **ios:** Avoid CDVScreenOrientationDelegate umbrella header warning ([#5156](https://github.com/ionic-team/capacitor/issues/5156)) ([31ec30d](https://github.com/ionic-team/capacitor/commit/31ec30de193aa3117dbb7eda928ef3a365d5667c))





## [3.2.5](https://github.com/ionic-team/capacitor/compare/3.2.4...3.2.5) (2021-10-13)


### Bug Fixes

* **ios:** proper handling of allowNavigation with multiple wildcard ([#5096](https://github.com/ionic-team/capacitor/issues/5096)) ([cda17a6](https://github.com/ionic-team/capacitor/commit/cda17a6c1504235c1c1e4826830f1d0e2ef2d35c))





## [3.2.4](https://github.com/ionic-team/capacitor/compare/3.2.3...3.2.4) (2021-09-27)


### Bug Fixes

* **ios:** Add CDVScreenOrientationDelegate protocol on CAPBridgeViewController ([#5070](https://github.com/ionic-team/capacitor/issues/5070)) ([530477d](https://github.com/ionic-team/capacitor/commit/530477d05e1364931f83a30d61d4f9b5cb687b19))
* **ios:** show correct line number on console logs ([#5073](https://github.com/ionic-team/capacitor/issues/5073)) ([ec41e74](https://github.com/ionic-team/capacitor/commit/ec41e743aa4ba81e791ad446fac461b7f43b46ed))





## [3.2.3](https://github.com/ionic-team/capacitor/compare/3.2.2...3.2.3) (2021-09-15)

**Note:** Version bump only for package @capacitor/ios





## [3.2.2](https://github.com/ionic-team/capacitor/compare/3.2.1...3.2.2) (2021-09-02)


### Bug Fixes

* **ios:** fixing podspec source paths ([#5002](https://github.com/ionic-team/capacitor/issues/5002)) ([6004a43](https://github.com/ionic-team/capacitor/commit/6004a43c608a4c967e3444c83954ad2095c3dcfd))





## [3.2.1](https://github.com/ionic-team/capacitor/compare/3.2.0...3.2.1) (2021-09-01)

**Note:** Version bump only for package @capacitor/ios





# [3.2.0](https://github.com/ionic-team/capacitor/compare/3.1.2...3.2.0) (2021-08-18)

**Note:** Version bump only for package @capacitor/ios





## [3.1.2](https://github.com/ionic-team/capacitor/compare/3.1.1...3.1.2) (2021-07-21)

**Note:** Version bump only for package @capacitor/ios





## [3.1.1](https://github.com/ionic-team/capacitor/compare/3.1.0...3.1.1) (2021-07-07)


### Bug Fixes

* fixing peer deps issues in android and ios libs ([310d9f4](https://github.com/ionic-team/capacitor/commit/310d9f486db976cb258fcda5ac893f019667617f))





# [3.1.0](https://github.com/ionic-team/capacitor/compare/3.0.2...3.1.0) (2021-07-07)


### Bug Fixes

* **ios:** isNewBinary is true if defaults have no stored versions ([#4779](https://github.com/ionic-team/capacitor/issues/4779)) ([bd86dbe](https://github.com/ionic-team/capacitor/commit/bd86dbeb74771ed201d0100773babf49e6764818))


### Features

* **ios:** Add limitsNavigationsToAppBoundDomains configuration option ([#4789](https://github.com/ionic-team/capacitor/issues/4789)) ([2b7016f](https://github.com/ionic-team/capacitor/commit/2b7016f3b4d62fd8c9d03fde2745b3d515bf08b2))





## [3.0.2](https://github.com/ionic-team/capacitor/compare/3.0.1...3.0.2) (2021-06-23)


### Bug Fixes

* **core:** cordova events not firing ([#4712](https://github.com/ionic-team/capacitor/issues/4712)) ([ca4e3b6](https://github.com/ionic-team/capacitor/commit/ca4e3b62dba6a40e593a1404ba2fe2b416a4ac14))
* **ios:** Use proper native events for cordova events ([#4720](https://github.com/ionic-team/capacitor/issues/4720)) ([99c21dc](https://github.com/ionic-team/capacitor/commit/99c21dcf98f1418d992e845492c730160611783a))





## [3.0.1](https://github.com/ionic-team/capacitor/compare/3.0.0...3.0.1) (2021-06-09)


### Bug Fixes

* Make isPluginAvailable available on bridge ([#4589](https://github.com/ionic-team/capacitor/issues/4589)) ([151e7a8](https://github.com/ionic-team/capacitor/commit/151e7a899d9646dbd5625a2539fd3f2297349bc5))





# [3.0.0](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.4...3.0.0) (2021-05-18)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-rc.4](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.3...3.0.0-rc.4) (2021-05-18)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.2...3.0.0-rc.3) (2021-05-11)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.1...3.0.0-rc.2) (2021-05-07)


### Bug Fixes

* **ios:** Don't auto release saved calls ([#4535](https://github.com/ionic-team/capacitor/issues/4535)) ([4f76933](https://github.com/ionic-team/capacitor/commit/4f76933b98d0461564d3dca9b36d4ea1eba8ed49))





# [3.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.0...3.0.0-rc.1) (2021-04-29)


### Bug Fixes

* generate Capacitor.Plugins object ([#4496](https://github.com/ionic-team/capacitor/issues/4496)) ([1c71b7a](https://github.com/ionic-team/capacitor/commit/1c71b7adb2c325e34d980dbf578dc22afb2c332b))
* **ios:** cordova-plugin-screen-orientation compatibility ([#4367](https://github.com/ionic-team/capacitor/issues/4367)) ([b893a57](https://github.com/ionic-team/capacitor/commit/b893a57aaaf3a16e13db9c33037a12f1a5ac92e0))
* **ios:** fire resume/pause events if no cordova plugins installed ([#4467](https://github.com/ionic-team/capacitor/issues/4467)) ([0105f7a](https://github.com/ionic-team/capacitor/commit/0105f7a2c68f2e7bec16ca23384b6acbb2f3057b))
* **ios:** put cancel button of confirm/prompt on the left ([#4464](https://github.com/ionic-team/capacitor/issues/4464)) ([e5b53aa](https://github.com/ionic-team/capacitor/commit/e5b53aa687a70938994802c7b1367cfcbb1e3811))


### Features

* Unify logging behavior across environments  ([#4416](https://github.com/ionic-team/capacitor/issues/4416)) ([bae0f3d](https://github.com/ionic-team/capacitor/commit/bae0f3d2cee84978636d0f589bc7e2f745671baf))
* **iOS:** Include native-bridge.js as a resource in both Cocoapods and direct build ([#4505](https://github.com/ionic-team/capacitor/issues/4505)) ([c16ccc0](https://github.com/ionic-team/capacitor/commit/c16ccc0118aec57dc23649894bc3bcd83827f89f))





# [3.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.6...3.0.0-rc.0) (2021-03-10)


### Features

* **iOS:** Obj-C convenience accessors on CAPPluginCall ([#4309](https://github.com/ionic-team/capacitor/issues/4309)) ([e3657d7](https://github.com/ionic-team/capacitor/commit/e3657d77647187946ffcd4c4791f4a47c768db7f))
* **iOS:** Unifying saving plugin calls ([#4253](https://github.com/ionic-team/capacitor/issues/4253)) ([de71da5](https://github.com/ionic-team/capacitor/commit/de71da52b80ff52d0234a5301fc6cae675640a33))





# [3.0.0-beta.6](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.5...3.0.0-beta.6) (2021-02-27)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-beta.5](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.4...3.0.0-beta.5) (2021-02-27)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-beta.4](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.3...3.0.0-beta.4) (2021-02-26)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.2...3.0.0-beta.3) (2021-02-18)


### Features

* **iOS:** Add automatic Date serialization to bridge communication ([#4177](https://github.com/ionic-team/capacitor/issues/4177)) ([3dabc69](https://github.com/ionic-team/capacitor/commit/3dabc69eab1c8ce0b7734acb641b67d349ec3093))





# [3.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.1...3.0.0-beta.2) (2021-02-08)


### Bug Fixes

* address bug in `isPluginAvailable()` for web and native ([#4114](https://github.com/ionic-team/capacitor/issues/4114)) ([2fbd954](https://github.com/ionic-team/capacitor/commit/2fbd95465a321b8f4c50d4daf22a63d8043cee9b))
* **iOS:** preserve null values in bridged types ([#4072](https://github.com/ionic-team/capacitor/issues/4072)) ([6dc691e](https://github.com/ionic-team/capacitor/commit/6dc691e66a07a421d5d4b08028ea05a65b3ddd84))





# [3.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.0...3.0.0-beta.1) (2021-01-14)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.14...3.0.0-beta.0) (2021-01-13)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-alpha.14](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.13...3.0.0-alpha.14) (2021-01-13)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-alpha.13](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.12...3.0.0-alpha.13) (2021-01-13)


### Bug Fixes

* **iOS:** properly handle date types during JSValue coercion ([#4043](https://github.com/ionic-team/capacitor/issues/4043)) ([1affae7](https://github.com/ionic-team/capacitor/commit/1affae7cf8d2f49681bf25be48633ab985bbd12f))
* **iOS:** skip Swift type coercion on Cordova plugin calls ([#4048](https://github.com/ionic-team/capacitor/issues/4048)) ([7bb9e0f](https://github.com/ionic-team/capacitor/commit/7bb9e0f22fdea369a6522c2d63a5b56baab9f5ca))



# [3.0.0-alpha.12](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.11...3.0.0-alpha.12) (2021-01-08)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-alpha.11](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.10...3.0.0-alpha.11) (2020-12-26)


### Features

* **iOS:** Open CAPBridgeViewController for subclassing ([#3973](https://github.com/ionic-team/capacitor/issues/3973)) ([a601705](https://github.com/ionic-team/capacitor/commit/a601705f8116ac10d1a0b5942511952c07cf474e))





# [3.0.0-alpha.9](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.8...3.0.0-alpha.9) (2020-12-15)

**Note:** Version bump only for package @capacitor/ios





# [3.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.7...3.0.0-alpha.8) (2020-12-15)


### Bug Fixes

* **ios:** expose lastURL getter ([#3898](https://github.com/ionic-team/capacitor/issues/3898)) ([90b7fe3](https://github.com/ionic-team/capacitor/commit/90b7fe39f5a7cb9d584618a6fba66338f2bbf5fe))



# [3.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.6...3.0.0-alpha.7) (2020-12-02)


### Bug Fixes

* **ios:** share message handler between webview and bridge ([#3875](https://github.com/ionic-team/capacitor/issues/3875)) ([f7dff2e](https://github.com/ionic-team/capacitor/commit/f7dff2e661a54bee770940ee1ebd9eab6456ba2e))


### Features

* **ios:** add local and remote notification router ([#3796](https://github.com/ionic-team/capacitor/issues/3796)) ([f3edaf9](https://github.com/ionic-team/capacitor/commit/f3edaf93d4328ea3ee90df573bf14ef0efc7553b))
* **ios:** add path utilities to bridge ([#3842](https://github.com/ionic-team/capacitor/issues/3842)) ([c31eb35](https://github.com/ionic-team/capacitor/commit/c31eb35f83a33626a9d88731c0fff18966c71b0b))
* **iOS:** Add base implementation of permissions calls ([#3856](https://github.com/ionic-team/capacitor/issues/3856)) ([d733236](https://github.com/ionic-team/capacitor/commit/d7332364212794a5005229defd05c129921d9c5d))
* **iOS:** Refactoring configuration ([#3759](https://github.com/ionic-team/capacitor/issues/3759)) ([e2e64c2](https://github.com/ionic-team/capacitor/commit/e2e64c23b88d93a1c594df51dddd0c55d5f37770))



# [3.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.5...3.0.0-alpha.6) (2020-10-30)


### Features

* unified errors and error codes ([#3673](https://github.com/ionic-team/capacitor/issues/3673)) ([f9e0803](https://github.com/ionic-team/capacitor/commit/f9e08038aa88f7453e8235f380d2767a12a7a073))





# [3.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.4...3.0.0-alpha.5) (2020-10-06)

**Note:** Version bump only for package @capacitor/ios



# [3.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.3...3.0.0-alpha.4) (2020-09-23)

**Note:** Version bump only for package @capacitor/ios



# [3.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.2...3.0.0-alpha.3) (2020-09-15)


**Note:** Version bump only for package @capacitor/ios



# [3.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.1...3.0.0-alpha.2) (2020-08-31)


### Features

* Add extension for creating data from data url ([#3474](https://github.com/ionic-team/capacitor/issues/3474)) ([2909fd0](https://github.com/ionic-team/capacitor/commit/2909fd0ac0d9fdb2cdb7fd25e38742451aa05fb1))



# [3.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/2.4.0...3.0.0-alpha.1) (2020-08-21)


### Bug Fixes

* **ios:** config bug from swiftlint refactor ([ace879f](https://github.com/ionic-team/capacitor/commit/ace879f42b19aa064efa80142c3783f736745344))



# [3.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/2.3.0...3.0.0-alpha.0) (2020-07-23)
