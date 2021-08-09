# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/ionic-team/capacitor/compare/3.1.1...3.1.2) (2021-07-21)


### Bug Fixes

* **core:** handle toJSON() in plugin objects ([#4823](https://github.com/ionic-team/capacitor/issues/4823)) ([0479822](https://github.com/ionic-team/capacitor/commit/04798221666437408f22947253a18ccb4f9e409e))
* **core:** Modify safeStringify to allow multiple null values ([#4853](https://github.com/ionic-team/capacitor/issues/4853)) ([854539b](https://github.com/ionic-team/capacitor/commit/854539b62a658e484954edbe38b25eea1b0b6f10))





## [3.1.1](https://github.com/ionic-team/capacitor/compare/3.1.0...3.1.1) (2021-07-07)

**Note:** Version bump only for package @capacitor/core





# [3.1.0](https://github.com/ionic-team/capacitor/compare/3.0.2...3.1.0) (2021-07-07)

**Note:** Version bump only for package @capacitor/core





## [3.0.2](https://github.com/ionic-team/capacitor/compare/3.0.1...3.0.2) (2021-06-23)


### Bug Fixes

* **core:** cordova events not firing ([#4712](https://github.com/ionic-team/capacitor/issues/4712)) ([ca4e3b6](https://github.com/ionic-team/capacitor/commit/ca4e3b62dba6a40e593a1404ba2fe2b416a4ac14))





## [3.0.1](https://github.com/ionic-team/capacitor/compare/3.0.0...3.0.1) (2021-06-09)


### Bug Fixes

* Make isPluginAvailable available on bridge ([#4589](https://github.com/ionic-team/capacitor/issues/4589)) ([151e7a8](https://github.com/ionic-team/capacitor/commit/151e7a899d9646dbd5625a2539fd3f2297349bc5))





# [3.0.0](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.4...3.0.0) (2021-05-18)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-rc.4](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.3...3.0.0-rc.4) (2021-05-18)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.2...3.0.0-rc.3) (2021-05-11)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.1...3.0.0-rc.2) (2021-05-07)


### Bug Fixes

* **bridge:** Fix type errors with new Platforms API ([#4524](https://github.com/ionic-team/capacitor/issues/4524)) ([7bbaea8](https://github.com/ionic-team/capacitor/commit/7bbaea85494c53a950abab40bb77f37087e22abe))
* **bridge:** Safely JSON.Stringify circular json on log ([#4507](https://github.com/ionic-team/capacitor/issues/4507)) ([e4c8fe4](https://github.com/ionic-team/capacitor/commit/e4c8fe41ec3992df5c20e4d0d3b69240ce672e44)), closes [#4506](https://github.com/ionic-team/capacitor/issues/4506)


### Features

* **core:** platforms api ([#4255](https://github.com/ionic-team/capacitor/issues/4255)) ([7d62713](https://github.com/ionic-team/capacitor/commit/7d6271369cb15eeab07c0bc7f606de6447a17cd4))





# [3.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.0...3.0.0-rc.1) (2021-04-29)


### Bug Fixes

* **core:** Call native implementation before web implementation ([#4493](https://github.com/ionic-team/capacitor/issues/4493)) ([febd606](https://github.com/ionic-team/capacitor/commit/febd60617ab60a3b34132f68f212e9a867d1b434))
* **core:** Use web listener if there is no native implementation ([#4488](https://github.com/ionic-team/capacitor/issues/4488)) ([196d843](https://github.com/ionic-team/capacitor/commit/196d843a3c9442c5dc6cf61bfe3494fa399dec4f))


### Features

* Unify logging behavior across environments  ([#4416](https://github.com/ionic-team/capacitor/issues/4416)) ([bae0f3d](https://github.com/ionic-team/capacitor/commit/bae0f3d2cee84978636d0f589bc7e2f745671baf))





# [3.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.6...3.0.0-rc.0) (2021-03-10)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-beta.6](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.5...3.0.0-beta.6) (2021-02-27)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-beta.5](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.4...3.0.0-beta.5) (2021-02-27)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.2...3.0.0-beta.3) (2021-02-18)


### Bug Fixes

* **core:** do not add window.cordova on web apps ([#4214](https://github.com/ionic-team/capacitor/issues/4214)) ([6d673ef](https://github.com/ionic-team/capacitor/commit/6d673ef7076f00c37eac0f801c4c487415df6d4d))





# [3.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.1...3.0.0-beta.2) (2021-02-08)


### Bug Fixes

* **core:** handle js.error messages to fix window error handler ([#4124](https://github.com/ionic-team/capacitor/issues/4124)) ([c0deb1d](https://github.com/ionic-team/capacitor/commit/c0deb1de349f5631af08eecbffc0ea4dea97c60d))
* address bug in `isPluginAvailable()` for web and native ([#4114](https://github.com/ionic-team/capacitor/issues/4114)) ([2fbd954](https://github.com/ionic-team/capacitor/commit/2fbd95465a321b8f4c50d4daf22a63d8043cee9b))
* **core:** fix another $$typeof issue ([#4113](https://github.com/ionic-team/capacitor/issues/4113)) ([4cbae41](https://github.com/ionic-team/capacitor/commit/4cbae41908670ab843bea5850da7a2cf1082afdb))





# [3.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.0...3.0.0-beta.1) (2021-01-14)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.14...3.0.0-beta.0) (2021-01-13)


### Features

* **core:** add commonjs output format ([#4064](https://github.com/ionic-team/capacitor/issues/4064)) ([74b7be8](https://github.com/ionic-team/capacitor/commit/74b7be89ef1bbf13ccd103410037cfe81c8fc124))





# [3.0.0-alpha.12](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.11...3.0.0-alpha.12) (2021-01-08)


### Bug Fixes

* **core:** fix $$typeof() not implemented error ([#4013](https://github.com/ionic-team/capacitor/issues/4013)) ([c7f80b5](https://github.com/ionic-team/capacitor/commit/c7f80b577c1de60cd0a105f3aaf0d1c314f3150d))





# [3.0.0-alpha.9](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.8...3.0.0-alpha.9) (2020-12-15)

**Note:** Version bump only for package @capacitor/core





# [3.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.7...3.0.0-alpha.8) (2020-12-15)

**Note:** Version bump only for package @capacitor/core



# [3.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.6...3.0.0-alpha.7) (2020-12-02)


### Bug Fixes

* **core:** export PermissionState ([#3775](https://github.com/ionic-team/capacitor/issues/3775)) ([2d5ac96](https://github.com/ionic-team/capacitor/commit/2d5ac963d131a704628f8a421be8429b9f63cf61))



# [3.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.5...3.0.0-alpha.6) (2020-10-30)


### Features

* improve permissions ([eec61a6](https://github.com/ionic-team/capacitor/commit/eec61a6d8d8edfe94aea1a361787d1e6c736e20d))
* unified errors and error codes ([#3673](https://github.com/ionic-team/capacitor/issues/3673)) ([f9e0803](https://github.com/ionic-team/capacitor/commit/f9e08038aa88f7453e8235f380d2767a12a7a073))





# [3.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.4...3.0.0-alpha.5) (2020-10-06)

**Note:** Version bump only for package @capacitor/core



# [3.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.3...3.0.0-alpha.4) (2020-09-23)

**Note:** Version bump only for package @capacitor/core



# [3.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.2...3.0.0-alpha.3) (2020-09-15)

**Note:** Version bump only for package @capacitor/core



# [3.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.1...3.0.0-alpha.2) (2020-08-31)

**Note:** Version bump only for package @capacitor/core



# [3.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/2.4.0...3.0.0-alpha.1) (2020-08-21)


### Bug Fixes

* **core:** provide mock implementation for unimplemented platforms ([#3352](https://github.com/ionic-team/capacitor/issues/3352)) ([befe230](https://github.com/ionic-team/capacitor/commit/befe2300435dbd54b22882fb6586c722f5ef466d))
* **core:** use more explicit result for Browser plugin events ([#3349](https://github.com/ionic-team/capacitor/issues/3349)) ([75f99d4](https://github.com/ionic-team/capacitor/commit/75f99d4de62a6afb2da0ff876ed3b0d351040184))
* **core:** use own type for backButton event result ([#3348](https://github.com/ionic-team/capacitor/issues/3348)) ([05d0e45](https://github.com/ionic-team/capacitor/commit/05d0e457eb69d5d39c8bb1d0117bc3d31afdca93))


### Features

* **core:** add unsupported browser exception ([#3389](https://github.com/ionic-team/capacitor/issues/3389)) ([c51e8f8](https://github.com/ionic-team/capacitor/commit/c51e8f8960c795421b35ad1fdd1cd6afbd7a7dfc))



# [3.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/2.3.0...3.0.0-alpha.0) (2020-07-23)


### Features

* **core:** add `registerPlugin` for importing from plugin packages ([#3305](https://github.com/ionic-team/capacitor/issues/3305)) ([95475cc](https://github.com/ionic-team/capacitor/commit/95475cceb4cbd5be2cc7e18f2cf3045eb6c6f7fd))
