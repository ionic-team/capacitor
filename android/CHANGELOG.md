# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.6...3.0.0-rc.0) (2021-03-10)


### Bug Fixes

* **android:** calls re-saved during permission/activity result callbacks were being released ([502a2d1](https://github.com/ionic-team/capacitor/commit/502a2d18ddce870f4caf810b405f7363f2340067))
* **android:** live reload not working when using adb reverse ([362f221](https://github.com/ionic-team/capacitor/commit/362f2219767a5f28e3ce1f6857a0e20024adc6b6))


### Features

* **android:** add configurable app path for embedded capacitor ([#4264](https://github.com/ionic-team/capacitor/issues/4264)) ([e433691](https://github.com/ionic-team/capacitor/commit/e43369144f7f378edc4f5d4f8dbbafe6cff6a70d))
* **android:** Unifying saving plugin calls ([#4254](https://github.com/ionic-team/capacitor/issues/4254)) ([a648c51](https://github.com/ionic-team/capacitor/commit/a648c51588627404b5ad30c35943fed18af4a546))





# [3.0.0-beta.6](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.5...3.0.0-beta.6) (2021-02-27)

**Note:** Version bump only for package @capacitor/android





# [3.0.0-beta.5](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.4...3.0.0-beta.5) (2021-02-27)

**Note:** Version bump only for package @capacitor/android





# [3.0.0-beta.4](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.3...3.0.0-beta.4) (2021-02-26)

**Note:** Version bump only for package @capacitor/android





# [3.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.2...3.0.0-beta.3) (2021-02-18)

**Note:** Version bump only for package @capacitor/android





# [3.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.1...3.0.0-beta.2) (2021-02-08)


### Bug Fixes

* address bug in `isPluginAvailable()` for web and native ([#4114](https://github.com/ionic-team/capacitor/issues/4114)) ([2fbd954](https://github.com/ionic-team/capacitor/commit/2fbd95465a321b8f4c50d4daf22a63d8043cee9b))
* **android:** get PermissionState enum by state value ([#4100](https://github.com/ionic-team/capacitor/issues/4100)) ([194ae86](https://github.com/ionic-team/capacitor/commit/194ae8699944bf016132fb64fe48010679a6d64e))
* **android:** requestPermission call rejects if permission missing in manifest ([55ef5ff](https://github.com/ionic-team/capacitor/commit/55ef5ff38e87729412c44bfa4b2f29e53044cecc))


### Features

* **android:** activity result use new API and update permission result callbacks to match ([#4127](https://github.com/ionic-team/capacitor/issues/4127)) ([002f1e5](https://github.com/ionic-team/capacitor/commit/002f1e55173a50b9fe918b4eda73b5113b713282))
* **android:** androidxActivityVersion & androidxFragmentVersion gradle variables ([#4103](https://github.com/ionic-team/capacitor/issues/4103)) ([4f77b96](https://github.com/ionic-team/capacitor/commit/4f77b962be85fc6bfc555a106c5b3e6707526626))





# [3.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.0...3.0.0-beta.1) (2021-01-14)

**Note:** Version bump only for package @capacitor/android





# [3.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.14...3.0.0-beta.0) (2021-01-13)

**Note:** Version bump only for package @capacitor/android





# [3.0.0-alpha.14](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.13...3.0.0-alpha.14) (2021-01-13)


### Bug Fixes

* **android:** append missing new lines on injected cordova files ([#4058](https://github.com/ionic-team/capacitor/issues/4058)) ([dbdc78d](https://github.com/ionic-team/capacitor/commit/dbdc78dc08e016dfbc2454d4f53a49f16f744b3e))


### Features

* **android:** method to check permission for an alias ([#4062](https://github.com/ionic-team/capacitor/issues/4062)) ([c88c4b4](https://github.com/ionic-team/capacitor/commit/c88c4b46b949a87c1b89476b75273adef725242b))





# [3.0.0-alpha.12](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.11...3.0.0-alpha.12) (2021-01-08)


### Features

* **android:** switch to new callback-style permission requests ([#4033](https://github.com/ionic-team/capacitor/issues/4033)) ([cc459de](https://github.com/ionic-team/capacitor/commit/cc459de7fc070c0227e066f3e8b92062728ab45d))





# [3.0.0-alpha.11](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.10...3.0.0-alpha.11) (2020-12-26)


### Features

* **android:** expose CapConfig.loadDefault(), deprecate v2 constructor ([#3964](https://github.com/ionic-team/capacitor/issues/3964)) ([94ae977](https://github.com/ionic-team/capacitor/commit/94ae9774d2467fa7ba0336e7183f6d28cae45908))





# [3.0.0-alpha.10](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.9...3.0.0-alpha.10) (2020-12-15)


### Bug Fixes

* **android:** include lint.xml for downstream lint tasks ([efa72f3](https://github.com/ionic-team/capacitor/commit/efa72f38c5f64d3b91cc4c4c7d4d87ab38219893))





# [3.0.0-alpha.9](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.8...3.0.0-alpha.9) (2020-12-15)


### Bug Fixes

* **android:** include lint-baseline.xml for downstream lint tasks ([20ccaa0](https://github.com/ionic-team/capacitor/commit/20ccaa0311dcf8468019325ad976156d92ed0202))





# [3.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.7...3.0.0-alpha.8) (2020-12-15)


### Bug Fixes

* **Android:** Use plugin's getPermissionStates() to support overriding ([#3939](https://github.com/ionic-team/capacitor/issues/3939)) ([855a607](https://github.com/ionic-team/capacitor/commit/855a60711bcf6cff3215a36fac7e5314a2c4d159))


### Features

* **android:** add onConfigurationChanged() activity lifecycle hook ([#3936](https://github.com/ionic-team/capacitor/issues/3936)) ([29e9e2c](https://github.com/ionic-team/capacitor/commit/29e9e2c5c30f23eb3ea2e88b1427eed0636e8125))
* **android:** Add WebColor utility for parsing color ([#3947](https://github.com/ionic-team/capacitor/issues/3947)) ([3746404](https://github.com/ionic-team/capacitor/commit/3746404240459ca9ea8175f2bb241d80746e8328))
* **Android:** Refactoring configuration ([#3778](https://github.com/ionic-team/capacitor/issues/3778)) ([9820a30](https://github.com/ionic-team/capacitor/commit/9820a30688f0a774eced1676f1927cacde53301f))



# [3.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.6...3.0.0-alpha.7) (2020-12-02)


### Bug Fixes

* **android:** dont release calls that are manually saved, eg listeners/watchers ([#3857](https://github.com/ionic-team/capacitor/issues/3857)) ([f1c8fe9](https://github.com/ionic-team/capacitor/commit/f1c8fe9e039d25eff2122fe915f17e84477427eb))
* **android:** fixed breaking change to `handleOnActivityResult` ([#3888](https://github.com/ionic-team/capacitor/issues/3888)) ([5fd60e6](https://github.com/ionic-team/capacitor/commit/5fd60e607b79b46cec08c6af1674305b1199d0a4))
* **android:** resolve undefined for both checkPermissions and requestPermissions by default ([#3855](https://github.com/ionic-team/capacitor/issues/3855)) ([383f62b](https://github.com/ionic-team/capacitor/commit/383f62b2b6531c579aac469e29b7c1c0c1f7540f))


### Features

* automatically import Android plugins ([#3788](https://github.com/ionic-team/capacitor/issues/3788)) ([aa1e1c6](https://github.com/ionic-team/capacitor/commit/aa1e1c604e260cc8babb0e7f5230f692bdcf6f09))
* **android:** Add handlePermissions function for plugins to call ([#3768](https://github.com/ionic-team/capacitor/issues/3768)) ([3a7e282](https://github.com/ionic-team/capacitor/commit/3a7e282a7515784dd343bbf1e3d52e0299bac887))
* **android:** modified plugin annotation format for multi-permissions and empty (auto-grant) ([#3822](https://github.com/ionic-team/capacitor/issues/3822)) ([1b5a3bd](https://github.com/ionic-team/capacitor/commit/1b5a3bdeb1b35612cf04e58bdf2fca68a0832a14))



# [3.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.5...3.0.0-alpha.6) (2020-10-30)


### Bug Fixes

* **android:** avoid crash on input file capture ([#3715](https://github.com/ionic-team/capacitor/issues/3715)) ([f502a99](https://github.com/ionic-team/capacitor/commit/f502a9964e28012980d636014043e86e918031d7))


### Features

* improve permissions ([eec61a6](https://github.com/ionic-team/capacitor/commit/eec61a6d8d8edfe94aea1a361787d1e6c736e20d))
* unified errors and error codes ([#3673](https://github.com/ionic-team/capacitor/issues/3673)) ([f9e0803](https://github.com/ionic-team/capacitor/commit/f9e08038aa88f7453e8235f380d2767a12a7a073))





# [3.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.4...3.0.0-alpha.5) (2020-10-06)

**Note:** Version bump only for package @capacitor/android



# [3.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.3...3.0.0-alpha.4) (2020-09-23)

**Note:** Version bump only for package @capacitor/android



# [3.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.2...3.0.0-alpha.3) (2020-09-15)


**Note:** Version bump only for package @capacitor/android



# [3.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.1...3.0.0-alpha.2) (2020-08-31)

**Note:** Version bump only for package @capacitor/android




# [3.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/2.4.0...3.0.0-alpha.1) (2020-08-21)



# [3.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/2.3.0...3.0.0-alpha.0) (2020-07-23)


### Features

* **android:** add custom plugins to BridgeFragment ([#3280](https://github.com/ionic-team/capacitor/issues/3280)) ([d131a5f](https://github.com/ionic-team/capacitor/commit/d131a5fed2b9ae29b6952397ec2f81104545b749))
