# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/6.0.0-beta.1...6.0.0-beta.2) (2023-12-14)

**Note:** Version bump only for package capacitor

# [6.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/6.0.0-beta.0...6.0.0-beta.1) (2023-12-14)

### Bug Fixes

- **ios:** Add Codable folder to podspec source_files ([#7131](https://github.com/ionic-team/capacitor/issues/7131)) ([04d1d55](https://github.com/ionic-team/capacitor/commit/04d1d557b51fcac31281a3f547300f06c6dacfb2))

# [6.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/6.0.0-alpha.2...6.0.0-beta.0) (2023-12-13)

### Bug Fixes

- **http:** parse readablestream data on fetch request objects ([#6919](https://github.com/ionic-team/capacitor/issues/6919)) ([80ec3b7](https://github.com/ionic-team/capacitor/commit/80ec3b73db18b7b6841bf90ed50a67389946ab87))
- **http:** properly write form-urlencoded data on android request body ([#7001](https://github.com/ionic-team/capacitor/issues/7001)) ([a986ee5](https://github.com/ionic-team/capacitor/commit/a986ee541f54a1d3ac637b514fe547b224b36903))
- **http:** set formdata boundary and body when content-type not explicitly set ([0c2ccd9](https://github.com/ionic-team/capacitor/commit/0c2ccd910a92ce3deaa67eb1819a4faa39c6af6e))
- **ios:** add some new cordova-ios classes used by Cordova plugins ([#7096](https://github.com/ionic-team/capacitor/issues/7096)) ([3db9051](https://github.com/ionic-team/capacitor/commit/3db9051eb015cf5f402f81b4cbaa7b27a5c9477a))

### Features

- **ios:** Add Codable support for CAPPluginCall and JSValueContainer ([#7119](https://github.com/ionic-team/capacitor/issues/7119)) ([af417e0](https://github.com/ionic-team/capacitor/commit/af417e0cbbb1a3a7b3b62756eebb8d1dc0952cc4))
- support for Amazon Fire WebView ([#6603](https://github.com/ionic-team/capacitor/issues/6603)) ([3cb4eb8](https://github.com/ionic-team/capacitor/commit/3cb4eb89632bce8dc872418fdb130bfd4de40b68))

# [6.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/6.0.0-alpha.1...6.0.0-alpha.2) (2023-11-15)

### Bug Fixes

- **ios:** Remove CocoaPods Xcode 15 workaround that causes issues ([#7059](https://github.com/ionic-team/capacitor/issues/7059)) ([043a8db](https://github.com/ionic-team/capacitor/commit/043a8dba4059e33c7445696c186110bef1130e16))

# [6.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/5.2.3...6.0.0-alpha.1) (2023-11-08)

### Bug Fixes

- allow double quotes in Gemfile ([#6903](https://github.com/ionic-team/capacitor/issues/6903)) ([3abdbed](https://github.com/ionic-team/capacitor/commit/3abdbed38844d5d59d244f6f0dfc2647f29ce446))
- **android:** handle webview version for developer builds ([#6907](https://github.com/ionic-team/capacitor/issues/6907)) ([88498e6](https://github.com/ionic-team/capacitor/commit/88498e6228492a9ae917d3a7b37c242881f9fe52))
- **android:** make local urls use unpatched fetch ([#6953](https://github.com/ionic-team/capacitor/issues/6953)) ([e50e56c](https://github.com/ionic-team/capacitor/commit/e50e56c5231f230497d1bd420e02e2e065c38f86))
- **android:** Use Logger class instead of Log in CapacitorCookieManager ([#6923](https://github.com/ionic-team/capacitor/issues/6923)) ([8aaa356](https://github.com/ionic-team/capacitor/commit/8aaa356ab1f14b56df821e8ac0bb7e43bfa094fa))
- **cli:** force latest native-run version for iOS 17 support ([#6926](https://github.com/ionic-team/capacitor/issues/6926)) ([7e7c8b9](https://github.com/ionic-team/capacitor/commit/7e7c8b9113f541d530c5883dea1f52b2957c0859))
- **cli:** Pin @ionic/utils-subprocess version ([#7057](https://github.com/ionic-team/capacitor/issues/7057)) ([0ac019a](https://github.com/ionic-team/capacitor/commit/0ac019a36070b4cb9917a82e406453169c7d5559))
- **cli:** use helper in Podfile with correct path ([#6878](https://github.com/ionic-team/capacitor/issues/6878)) ([8e95be9](https://github.com/ionic-team/capacitor/commit/8e95be9f91169e258ab5cdd8fd673106392b8429))
- **cli:** Use latest native-run ([#7023](https://github.com/ionic-team/capacitor/issues/7023)) ([4125160](https://github.com/ionic-team/capacitor/commit/412516069e15fbdbc17ad130c2f3a67891b6bc45))
- **cookies:** remove session cookies when initializing the cookie manager ([037863b](https://github.com/ionic-team/capacitor/commit/037863bea6f3a00978125dc2f8ecba1e896c0740))
- **http:** add support for Request objects in fetch ([24b3cc1](https://github.com/ionic-team/capacitor/commit/24b3cc113e3d8aae5d85dbf2d25bec0c35136477))
- **http:** disconnect active connections if call or bridge is destroyed ([a1ed6cc](https://github.com/ionic-team/capacitor/commit/a1ed6cc6f07465d683b95e3796d944f863a7b857))
- **http:** inherit object properties on window.XMLHttpRequest ([91c11d0](https://github.com/ionic-team/capacitor/commit/91c11d06f773c45a10f6f2d52f672ae6f189b162))
- **http:** return numbers and booleans as-is when application/json is the content type ([03dd3f9](https://github.com/ionic-team/capacitor/commit/03dd3f96c7ee75b6fff2b7c40d0c9a58fb04fce5))
- **ios-template:** added workaround for Cocoapods bug in XC15 ([#6847](https://github.com/ionic-team/capacitor/issues/6847)) ([10ccc76](https://github.com/ionic-team/capacitor/commit/10ccc769b67eda12a2899c447949a4865d3e9954))
- Update migrate to Capacitor 6 ([#6872](https://github.com/ionic-team/capacitor/issues/6872)) ([98eec8f](https://github.com/ionic-team/capacitor/commit/98eec8fe9fd332d6669965fa5a21412233b3e06e))

### Features

- add livereload to run command ([#6831](https://github.com/ionic-team/capacitor/issues/6831)) ([4099969](https://github.com/ionic-team/capacitor/commit/4099969f70e9b995182bacecc16e160d89bbc746))
- Add the spm root project to the template ([#6877](https://github.com/ionic-team/capacitor/issues/6877)) ([02c44c2](https://github.com/ionic-team/capacitor/commit/02c44c2d9ed1b76a72b0f8a2c338b556133c9582))
- Add XCFrameworks ([#7020](https://github.com/ionic-team/capacitor/issues/7020)) ([5306095](https://github.com/ionic-team/capacitor/commit/53060955dc83cdbfda66bed60c2efcba395a9ca8))
- **android:** allow developers to provide logic for onRenderProcessGone in WebViewListener ([#6966](https://github.com/ionic-team/capacitor/issues/6966)) ([79e17bb](https://github.com/ionic-team/capacitor/commit/79e17bb5e6ccd813bddc626703152d3983f6d93b))
- better support monorepos ([#6811](https://github.com/ionic-team/capacitor/issues/6811)) ([ae35e29](https://github.com/ionic-team/capacitor/commit/ae35e29fb8c886dea867683a23a558d2d344073b))
- **ios:** Makes CapacitorBridge, WebViewAssetHandler, and WebViewDelegationHandler open classes, along with several of their methods ([#7009](https://github.com/ionic-team/capacitor/issues/7009)) ([40d62cb](https://github.com/ionic-team/capacitor/commit/40d62cbce950c2f3972764fe134cc37f2343f33d))
- modify package.swift on update and sync ([#7042](https://github.com/ionic-team/capacitor/issues/7042)) ([24573fb](https://github.com/ionic-team/capacitor/commit/24573fb864c43551e2ce42721b45ff901155627d))

## [5.5.1](https://github.com/ionic-team/capacitor/compare/5.5.0...5.5.1) (2023-10-25)

### Bug Fixes

- **ios:** CAPWebView config update ([#7004](https://github.com/ionic-team/capacitor/issues/7004)) ([f3e8be0](https://github.com/ionic-team/capacitor/commit/f3e8be0453c31f74a2fdf4c9a6d8d7967a6b5c20))

# [5.5.0](https://github.com/ionic-team/capacitor/compare/5.4.2...5.5.0) (2023-10-11)

### Features

- **android:** allow developers to provide logic for onRenderProcessGone in WebViewListener ([#6946](https://github.com/ionic-team/capacitor/issues/6946)) ([34b724a](https://github.com/ionic-team/capacitor/commit/34b724a4cf406c23b2a9952ef81e0327b78a3b3a))

## [5.4.2](https://github.com/ionic-team/capacitor/compare/5.4.1...5.4.2) (2023-10-04)

### Bug Fixes

- **android:** make local urls use unpatched fetch ([#6954](https://github.com/ionic-team/capacitor/issues/6954)) ([56fb853](https://github.com/ionic-team/capacitor/commit/56fb8536af53f4f4ee49b9394fd966ad514b9458))

## [5.4.1](https://github.com/ionic-team/capacitor/compare/5.4.0...5.4.1) (2023-09-21)

### Bug Fixes

- **android:** handle webview version for developer builds ([#6911](https://github.com/ionic-team/capacitor/issues/6911)) ([b5b0398](https://github.com/ionic-team/capacitor/commit/b5b0398a7fe117a824f97125f5feabe81073daf3))
- **android:** Use Logger class instead of Log in CapacitorCookieManager ([#6925](https://github.com/ionic-team/capacitor/issues/6925)) ([b6901e0](https://github.com/ionic-team/capacitor/commit/b6901e01e05cd22a71841d2f5821fbe2a6939ead))
- **cli:** force latest native-run version for iOS 17 support ([#6928](https://github.com/ionic-team/capacitor/issues/6928)) ([f9be9f5](https://github.com/ionic-team/capacitor/commit/f9be9f5791e6f0881be2c73bb8fbe7a8c1b10848))
- **cookies:** retrieve cookies when using a custom android scheme ([6b5ddad](https://github.com/ionic-team/capacitor/commit/6b5ddad8b36e33ef4171f6da5cc311ed3f634ac6))
- **http:** parse readablestream data on fetch request objects ([3fe0642](https://github.com/ionic-team/capacitor/commit/3fe06426bd20713e2322780b70bc5d97ad371fae))
- **http:** return xhr response headers case insensitive ([687b6b1](https://github.com/ionic-team/capacitor/commit/687b6b1780506c17fb73ed1d9cbf50c1d1e40ef1))
- **ios:** Add workaround for CocoaPods problem on Xcode 15 ([#6921](https://github.com/ionic-team/capacitor/issues/6921)) ([1ffa244](https://github.com/ionic-team/capacitor/commit/1ffa2441fc8a04e4bf1712d0afb868a83e7f1951))

# [5.4.0](https://github.com/ionic-team/capacitor/compare/5.3.0...5.4.0) (2023-09-14)

### Bug Fixes

- **cli:** use helper in Podfile with correct path ([#6888](https://github.com/ionic-team/capacitor/issues/6888)) ([9048432](https://github.com/ionic-team/capacitor/commit/9048432755095ce3dcca9d3bab39894f2b6c3967))
- **http:** add support for defining xhr and angular http response types ([09bd040](https://github.com/ionic-team/capacitor/commit/09bd040dfe4b8808d7499b6ee592005420406cac))
- **http:** add support for Request objects in fetch ([2fe4535](https://github.com/ionic-team/capacitor/commit/2fe4535e781b1a5cfa0f3359c1afa5c360073b6a))
- **http:** inherit object properties on window.XMLHttpRequest ([5cd3b2f](https://github.com/ionic-team/capacitor/commit/5cd3b2fa6d6936864e1aab2e98963df2d4da3b95))

### Features

- add livereload to run command ([#6831](https://github.com/ionic-team/capacitor/issues/6831)) ([54a63ae](https://github.com/ionic-team/capacitor/commit/54a63ae0a5f0845d5ef2c0d10bd0c27682866940))

# [5.3.0](https://github.com/ionic-team/capacitor/compare/5.2.3...5.3.0) (2023-08-23)

### Bug Fixes

- **cookies:** remove session cookies when initializing the cookie manager ([037863b](https://github.com/ionic-team/capacitor/commit/037863bea6f3a00978125dc2f8ecba1e896c0740))
- **http:** disconnect active connections if call or bridge is destroyed ([a1ed6cc](https://github.com/ionic-team/capacitor/commit/a1ed6cc6f07465d683b95e3796d944f863a7b857))
- **http:** return numbers and booleans as-is when application/json is the content type ([03dd3f9](https://github.com/ionic-team/capacitor/commit/03dd3f96c7ee75b6fff2b7c40d0c9a58fb04fce5))

### Features

- better support monorepos ([#6811](https://github.com/ionic-team/capacitor/issues/6811)) ([ae35e29](https://github.com/ionic-team/capacitor/commit/ae35e29fb8c886dea867683a23a558d2d344073b))

## [5.2.3](https://github.com/ionic-team/capacitor/compare/5.2.2...5.2.3) (2023-08-10)

### Bug Fixes

- **android:** allow single input file selection from samsumg gallery ([#6778](https://github.com/ionic-team/capacitor/issues/6778)) ([3d57ecd](https://github.com/ionic-team/capacitor/commit/3d57ecdf7631d1581047bd5d9f86ea657ecad845))
- **android:** avoid R8 optimizations remove plugin classes ([#6783](https://github.com/ionic-team/capacitor/issues/6783)) ([cc85df5](https://github.com/ionic-team/capacitor/commit/cc85df5f3a6999883623054573bafc30665e41e7))
- **cli:** remove package related checks on doctor command ([#6773](https://github.com/ionic-team/capacitor/issues/6773)) ([4499b6b](https://github.com/ionic-team/capacitor/commit/4499b6bb6c52e9bc7fdfdb35ee2519881996eedf))
- **cli:** signing type option issue ([#6716](https://github.com/ionic-team/capacitor/issues/6716)) ([ee0f745](https://github.com/ionic-team/capacitor/commit/ee0f7457e458ca4bb4eb74f67552ac2ace76016b))
- **cookies:** hide httpOnly cookies from client ([0cc927e](https://github.com/ionic-team/capacitor/commit/0cc927ef5f0f7076a6d486d666d78483f1d71c54))
- **http:** return valid response for relative url xhr requests ([bde6569](https://github.com/ionic-team/capacitor/commit/bde65696218f97a8328041f137457f46e5eb766a))

## [5.2.2](https://github.com/ionic-team/capacitor/compare/5.2.1...5.2.2) (2023-07-19)

### Bug Fixes

- add http method to prototype.open ([#6740](https://github.com/ionic-team/capacitor/issues/6740)) ([1fd2d87](https://github.com/ionic-team/capacitor/commit/1fd2d8762ff2341a8fe20eec9e774c6a29576e88))

## [5.2.1](https://github.com/ionic-team/capacitor/compare/5.2.0...5.2.1) (2023-07-13)

### Bug Fixes

- allow single parameter on setRequestBody ([#6728](https://github.com/ionic-team/capacitor/issues/6728)) ([5343bdb](https://github.com/ionic-team/capacitor/commit/5343bdb60d26849cd8f9c8ff28ba7d9ddbd05b26))

# [5.2.0](https://github.com/ionic-team/capacitor/compare/5.1.1...5.2.0) (2023-07-12)

### Bug Fixes

- **cli:** make migrate not error if there are no dependencies ([#6707](https://github.com/ionic-team/capacitor/issues/6707)) ([25ca83a](https://github.com/ionic-team/capacitor/commit/25ca83a8a76fe0eaf73c0db24fd950b33fd16063))
- **cookies:** sanitize url before retrieving/setting cookies ([ca40634](https://github.com/ionic-team/capacitor/commit/ca4063471f215d3f7525e51592d9c72138a52855))
- **http:** fire events in correct order when using xhr ([5ed3617](https://github.com/ionic-team/capacitor/commit/5ed361787596bb5949f6ae5e366495f296352bf3))

### Features

- **http:** support for FormData requests ([#6708](https://github.com/ionic-team/capacitor/issues/6708)) ([849c564](https://github.com/ionic-team/capacitor/commit/849c56458205bea3b078b1ee19807d7fd84c47b1))

## [5.1.1](https://github.com/ionic-team/capacitor/compare/5.1.0...5.1.1) (2023-07-05)

### Bug Fixes

- **ios:** Revert server url addition for CAPWebView. ([#6705](https://github.com/ionic-team/capacitor/issues/6705)) ([1b8352d](https://github.com/ionic-team/capacitor/commit/1b8352dc5124dc3f57d7881d619537cbf8c3674b))

# [5.1.0](https://github.com/ionic-team/capacitor/compare/5.0.5...5.1.0) (2023-06-29)

### Bug Fixes

- **android:** Move bridge localUrl initialization to initWebView ([#6685](https://github.com/ionic-team/capacitor/issues/6685)) ([7f5f0ca](https://github.com/ionic-team/capacitor/commit/7f5f0ca4220d40d6a19c778c18f9534ef3b65899))
- **android:** revert cookie manager initialization to plugin load ([53a2d47](https://github.com/ionic-team/capacitor/commit/53a2d4792e026a89723a672a01fc34990add71f0))
- **ios:** Return proper MIME Type for local WASM files ([#6675](https://github.com/ionic-team/capacitor/issues/6675)) ([d7856de](https://github.com/ionic-team/capacitor/commit/d7856de62a4c058ac474ae91a5fd221dabf99c0a))
- **ios:** set cors headers in asset handler for live reload ([e5a1c81](https://github.com/ionic-team/capacitor/commit/e5a1c81fe81904dfd7e3f5100a04088173effc1c))

### Features

- **android:** add check for excluded domains before ssl request ([7906d36](https://github.com/ionic-team/capacitor/commit/7906d3616e8bfb2e2c1c81ee123424c06fc4e5ab))
- **cli:** add apksigner as a build option ([#6442](https://github.com/ionic-team/capacitor/issues/6442)) ([9818a76](https://github.com/ionic-team/capacitor/commit/9818a76ab4ea6660b444354f239344d37c77d3b3))
- export buildRequestInit function so we can use for downloadFile ([95b0575](https://github.com/ionic-team/capacitor/commit/95b0575e3fbc1b1408aa69b61c58e18bf8882cea))

## [5.0.5](https://github.com/ionic-team/capacitor/compare/5.0.4...5.0.5) (2023-06-09)

### Bug Fixes

- **http:** don't throw errors when content-type is null on response ([#6627](https://github.com/ionic-team/capacitor/issues/6627)) ([538821f](https://github.com/ionic-team/capacitor/commit/538821f267aa3b79548fed6aaea8880ff949ffdd))

## [5.0.4](https://github.com/ionic-team/capacitor/compare/5.0.3...5.0.4) (2023-05-23)

### Bug Fixes

- **cicd:** removed `set -eo pipefail` to allow job to continue ([#6596](https://github.com/ionic-team/capacitor/issues/6596)) ([caeeb09](https://github.com/ionic-team/capacitor/commit/caeeb090922a5f7e56b1629209cb4227ae60da07))
- **cli:** correct migration of package from AndroidManifest.xml to build.gradle ([#6607](https://github.com/ionic-team/capacitor/issues/6607)) ([1c26a3e](https://github.com/ionic-team/capacitor/commit/1c26a3e57f356a0972bd43854ca86770a49f2d63))
- **cli:** Don't succeed migration if npm install failed ([#6595](https://github.com/ionic-team/capacitor/issues/6595)) ([6843d96](https://github.com/ionic-team/capacitor/commit/6843d9642fad9a322579cbe5f01563929a83dbf5))
- **cli:** proper plugin module patch in monorepos ([#6589](https://github.com/ionic-team/capacitor/issues/6589)) ([d49e632](https://github.com/ionic-team/capacitor/commit/d49e6324ab5e0bea58ff6ca32feb7ea39d33a772))

## [5.0.3](https://github.com/ionic-team/capacitor/compare/5.0.2...5.0.3) (2023-05-10)

**Note:** Version bump only for package capacitor

## [5.0.2](https://github.com/ionic-team/capacitor/compare/5.0.1...5.0.2) (2023-05-09)

### Bug Fixes

- **cli:** handle unrecognized java --version ([#6577](https://github.com/ionic-team/capacitor/issues/6577)) ([56b0037](https://github.com/ionic-team/capacitor/commit/56b0037a70d64019563b6e55e53de423f471fe2f))
- **cli:** Move package to build.gradle in Capacitor plugins ([#6569](https://github.com/ionic-team/capacitor/issues/6569)) ([8cb26cd](https://github.com/ionic-team/capacitor/commit/8cb26cd97a4f9cf59abb6b3828a07555a6af0b15))
- fallback to plain `pod` if `Gemfile` does not contain CocoaPods ([#6581](https://github.com/ionic-team/capacitor/issues/6581)) ([3a41b4c](https://github.com/ionic-team/capacitor/commit/3a41b4c1b70af7a45201fb11b04dc5558893aa7e))

## [5.0.1](https://github.com/ionic-team/capacitor/compare/5.0.0...5.0.1) (2023-05-05)

### Bug Fixes

- **cli:** install minor Capacitor 5 version ([#6562](https://github.com/ionic-team/capacitor/issues/6562)) ([f4af0a2](https://github.com/ionic-team/capacitor/commit/f4af0a298fb5a5f8257f175327058341a230ae4f))
- **cli:** Update migration link ([#6560](https://github.com/ionic-team/capacitor/issues/6560)) ([e03062e](https://github.com/ionic-team/capacitor/commit/e03062e6025fea0edfabbff2081b3f91017aece4))

# [5.0.0](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.3...5.0.0) (2023-05-03)

**Note:** Version bump only for package capacitor

# [5.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.2...5.0.0-rc.3) (2023-05-03)

**Note:** Version bump only for package capacitor

# [5.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.1...5.0.0-rc.2) (2023-05-03)

### Bug Fixes

- check for android and JDK ([#6554](https://github.com/ionic-team/capacitor/issues/6554)) ([ddcc818](https://github.com/ionic-team/capacitor/commit/ddcc818e828b290459d3ddffe9102fc312139823))

# [5.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.0...5.0.0-rc.1) (2023-05-02)

### Bug Fixes

- **cli:** Avoid infinite loop in namespace migration ([#6551](https://github.com/ionic-team/capacitor/issues/6551)) ([d3aacde](https://github.com/ionic-team/capacitor/commit/d3aacdeb0c86d3941464954e7d1f582e405be489))
- **cli:** Migrate more plugin variables ([#6552](https://github.com/ionic-team/capacitor/issues/6552)) ([b7da5b9](https://github.com/ionic-team/capacitor/commit/b7da5b988ce7da5ea3991eaec46b9e52ff3635f1))

# [5.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.3...5.0.0-rc.0) (2023-05-01)

**Note:** Version bump only for package capacitor

# [5.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.2...5.0.0-beta.3) (2023-04-21)

### Bug Fixes

- **cookies:** init cookie manager after server url is set ([0ee772f](https://github.com/ionic-team/capacitor/commit/0ee772ff6456ad0948a0dd025dfcf2658a5563a0))

### Features

- **android:** update gradle to 8.0.2 and gradle plugin to 8.0.0 ([#6497](https://github.com/ionic-team/capacitor/issues/6497)) ([01b5b39](https://github.com/ionic-team/capacitor/commit/01b5b399324ae5d0896989478a6910fb946542d7))
- **cli:** android manifest to build.gradle migration ([#6533](https://github.com/ionic-team/capacitor/issues/6533)) ([245b6ab](https://github.com/ionic-team/capacitor/commit/245b6ab85b0f481f08c21e25f2b2a7eb6da9996c))
- **cli:** Migrate update to gradle 8 ([#6530](https://github.com/ionic-team/capacitor/issues/6530)) ([da3ac0e](https://github.com/ionic-team/capacitor/commit/da3ac0e72c0559223e9b91f31830810d39638734))

# [5.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.1...5.0.0-beta.2) (2023-04-13)

### Bug Fixes

- **android:** launching intents without host ([#6489](https://github.com/ionic-team/capacitor/issues/6489)) ([95f7474](https://github.com/ionic-team/capacitor/commit/95f747401ac5a666de4338a18666060e9c1ff39e))
- **android:** unify kotlin dependency version ([#6501](https://github.com/ionic-team/capacitor/issues/6501)) ([0a40477](https://github.com/ionic-team/capacitor/commit/0a4047768cbde9bc17d92955e64ab11d2e3b3335))
- **cookies:** check isEnabled before setting cookieHandler ([bb04f24](https://github.com/ionic-team/capacitor/commit/bb04f24f0b4a99e46ed5ca047d3d3df81804d516))
- **ios/android:** copy url from nativeResponse to response ([#6482](https://github.com/ionic-team/capacitor/issues/6482)) ([828fb71](https://github.com/ionic-team/capacitor/commit/828fb71ebb52c0655d5879ad0edaac7368ab2b96))
- remove accept-charset ([#6386](https://github.com/ionic-team/capacitor/issues/6386)) ([bbf6f7e](https://github.com/ionic-team/capacitor/commit/bbf6f7e1af0c49c0bc917942b6715c613be3f557))

### Features

- **ios:** Add Bundler support ([#5205](https://github.com/ionic-team/capacitor/issues/5205)) ([f21c6d0](https://github.com/ionic-team/capacitor/commit/f21c6d01fc30e46c151afc93da9727dbf6c9ddcf))
- **ios:** add webContentsDebuggingEnabled configuration ([#6495](https://github.com/ionic-team/capacitor/issues/6495)) ([c691e4a](https://github.com/ionic-team/capacitor/commit/c691e4aecbfb7a45ce0465d1fe9020ab715815d3))

# [5.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.0...5.0.0-beta.1) (2023-04-03)

### Bug Fixes

- copy url from nativeResponse to response in native-bridge.ts ([#6397](https://github.com/ionic-team/capacitor/issues/6397)) ([e81a2ff](https://github.com/ionic-team/capacitor/commit/e81a2ff42ddd446f3004ab5af6e74209f7ff076a))

### Features

- **cli:** add npm update step to migrate ([#6462](https://github.com/ionic-team/capacitor/issues/6462)) ([65520c3](https://github.com/ionic-team/capacitor/commit/65520c36cdb4ac6f8811eb72624c447f2a0d884a))
- **cli:** non interactive migrate ([#6461](https://github.com/ionic-team/capacitor/issues/6461)) ([53dfeaf](https://github.com/ionic-team/capacitor/commit/53dfeaf77ace5b165260b68351eae8e5bf72ea0a))

# [5.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/5.0.0-alpha.1...5.0.0-beta.0) (2023-03-31)

### Bug Fixes

- 204 http response ([#6266](https://github.com/ionic-team/capacitor/issues/6266)) ([771f6ce](https://github.com/ionic-team/capacitor/commit/771f6ce1f35159848db218a42dc4f56b5106f750))
- **android:** Allow WebView to load data urls ([#6418](https://github.com/ionic-team/capacitor/issues/6418)) ([daf2ec6](https://github.com/ionic-team/capacitor/commit/daf2ec64df0c567c6a42560488e5d2515eff8a33))
- **android:** proper app url check for launching intents ([#6450](https://github.com/ionic-team/capacitor/issues/6450)) ([302ba35](https://github.com/ionic-team/capacitor/commit/302ba353acbd6d67e96e2b28870bc9c5bb4e9af0))
- **android:** remove stored references to bridge that holds it in memory ([#6448](https://github.com/ionic-team/capacitor/issues/6448)) ([4737d2b](https://github.com/ionic-team/capacitor/commit/4737d2b46b480c7c0246ac6414494cbbdac7811b))
- **cli:** Fix cordova plugin config checker over checking 5.x ([#6444](https://github.com/ionic-team/capacitor/issues/6444)) ([9d21a0e](https://github.com/ionic-team/capacitor/commit/9d21a0e363141fa0792c12d977b13692be67cf6d))
- **ios:** Event listeners were unexpectedly nil ([#6445](https://github.com/ionic-team/capacitor/issues/6445)) ([209d4ed](https://github.com/ionic-team/capacitor/commit/209d4edace610b00e689440a5c08e72f5da60cc2))

### Features

- **android:** Fix for [#6258](https://github.com/ionic-team/capacitor/issues/6258), Add support for modern Huawei devices ([#6402](https://github.com/ionic-team/capacitor/issues/6402)) ([17f2f4a](https://github.com/ionic-team/capacitor/commit/17f2f4ac744a038c1dae3cbd74a670d5ede92ef3))
- **cli:** Add missing Cap 4 to Cap 5 migration tasks ([#6453](https://github.com/ionic-team/capacitor/issues/6453)) ([7dff363](https://github.com/ionic-team/capacitor/commit/7dff36376d6efa6ea8793b81550979ee9254991b))
- **cli:** Add support for Android build `--flavor` ([#6437](https://github.com/ionic-team/capacitor/issues/6437)) ([e91a8e7](https://github.com/ionic-team/capacitor/commit/e91a8e795604042684ec9e20b620eee36e0dfda2))
- **cli:** update migrate command for cap4 -> cap5 ([#6447](https://github.com/ionic-team/capacitor/issues/6447)) ([b1f0a37](https://github.com/ionic-team/capacitor/commit/b1f0a3744d3158dab083ea31ea3e747b937729d2))
- retain multiple calls per event until consumed ([#6419](https://github.com/ionic-team/capacitor/issues/6419)) ([5aba2cb](https://github.com/ionic-team/capacitor/commit/5aba2cbe29bdbab2a7af861c65d8323acf9c54a6))
- Upgrade to Typescript 5.x ([#6433](https://github.com/ionic-team/capacitor/issues/6433)) ([88d0ded](https://github.com/ionic-team/capacitor/commit/88d0ded9e7356531ffc4563b9b81a0f3f069484b))

# [5.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/4.7.0...5.0.0-alpha.1) (2023-03-16)

### Bug Fixes

- **android:** handle empty permission list ([#6375](https://github.com/ionic-team/capacitor/issues/6375)) ([b11a9df](https://github.com/ionic-team/capacitor/commit/b11a9df070f18a25364a9109e295556fc75ea7f9))
- **android:** handle null http headers and params ([#6370](https://github.com/ionic-team/capacitor/issues/6370)) ([e486672](https://github.com/ionic-team/capacitor/commit/e486672731818d5c64c50956562aa4766f169d41))
- **android:** solve and/or silence lint errors ([#6358](https://github.com/ionic-team/capacitor/issues/6358)) ([c627415](https://github.com/ionic-team/capacitor/commit/c627415743bec92dcb65ab8b8840003d8c0a5286))
- **cli:** point build to proper workspace name ([#6371](https://github.com/ionic-team/capacitor/issues/6371)) ([78b7a59](https://github.com/ionic-team/capacitor/commit/78b7a591429b5fc1dc7bf87e06e9a1afd3599408))
- **iOS:** Separate cookies by `; ` rather than `;` when accessing through `document.cookie` ([#6313](https://github.com/ionic-team/capacitor/issues/6313)) ([beade60](https://github.com/ionic-team/capacitor/commit/beade6020e25dc405e796e1b06bf6dd90b217693))

### Features

- **android-template:** Removing enableJetifier ([#6339](https://github.com/ionic-team/capacitor/issues/6339)) ([e118175](https://github.com/ionic-team/capacitor/commit/e11817544fcdc7fb6ecc02907d9a002f4f61c277))
- **android:** Removing enableJetifier ([#6333](https://github.com/ionic-team/capacitor/issues/6333)) ([fc0b403](https://github.com/ionic-team/capacitor/commit/fc0b403265f63eab35cdb2f262fb1e047db4b6bd))
- **cli:** Add --forwardPorts option to Capacitor CLI ([#5645](https://github.com/ionic-team/capacitor/issues/5645)) ([2f04d29](https://github.com/ionic-team/capacitor/commit/2f04d29a17eb46f9bd140b93e821e11380699367))
- **cli:** update init to set androidScheme to https ([#6342](https://github.com/ionic-team/capacitor/issues/6342)) ([158b27e](https://github.com/ionic-team/capacitor/commit/158b27e53fd803c87de32e8da9f0c5117f81a3a5))

# [4.7.0](https://github.com/ionic-team/capacitor/compare/4.6.3...4.7.0) (2023-02-22)

### Bug Fixes

- handle fetch headers that are Headers objects ([#6320](https://github.com/ionic-team/capacitor/issues/6320)) ([cb00e49](https://github.com/ionic-team/capacitor/commit/cb00e4952acca8e877555f30b2190f6685d25934))
- **cli:** prevent error on manifest element without children ([#6278](https://github.com/ionic-team/capacitor/issues/6278)) ([a7e374f](https://github.com/ionic-team/capacitor/commit/a7e374fc4d834ded437edb4c8a0be98b6691be4c))
- **cli:** Remove buildOptions from platform capacitor.config.json ([#6292](https://github.com/ionic-team/capacitor/issues/6292)) ([acddcd9](https://github.com/ionic-team/capacitor/commit/acddcd95b40a7d4cc6c7682d2d1019f96dacf68d))
- **ios:** Avoid double encoding on http urls ([#6288](https://github.com/ionic-team/capacitor/issues/6288)) ([4768085](https://github.com/ionic-team/capacitor/commit/4768085414768bb2c013afcc6c645664893cd297))
- **ios:** Correctly Attach Headers to Request ([#6303](https://github.com/ionic-team/capacitor/issues/6303)) ([a3f875c](https://github.com/ionic-team/capacitor/commit/a3f875cf42e111fde07d6e87643264b19ed77573))

### Features

- **android:** add ability to create config from a custom file path ([#6264](https://github.com/ionic-team/capacitor/issues/6264)) ([42b4f0f](https://github.com/ionic-team/capacitor/commit/42b4f0f416c8038ae368860007910bb09c8ec84e))
- **android:** Add SSL Pinning logic ([#6314](https://github.com/ionic-team/capacitor/issues/6314)) ([07f113e](https://github.com/ionic-team/capacitor/commit/07f113e6933e15c45d772f69f7128cbb3706f7b9))
- **android:** enable loading of assets outside of the content web asset directory ([#6301](https://github.com/ionic-team/capacitor/issues/6301)) ([364497d](https://github.com/ionic-team/capacitor/commit/364497d4aca93fc716a0673ef9103479aed791ec))
- **cli:** add ssl pinning copy logic ([#6312](https://github.com/ionic-team/capacitor/issues/6312)) ([cce66c1](https://github.com/ionic-team/capacitor/commit/cce66c1d59370ba35db879f4d7a3620d22175ab0))

## [4.6.3](https://github.com/ionic-team/capacitor/compare/4.6.2...4.6.3) (2023-02-03)

### Bug Fixes

- **cli/cordova:** Exclude private framework Headers ([#6229](https://github.com/ionic-team/capacitor/issues/6229)) ([6c2726d](https://github.com/ionic-team/capacitor/commit/6c2726dc0817c9e57c8b7909e4a69a9b376c425d))
- **ios:** crash when http headers contain numbers ([#6251](https://github.com/ionic-team/capacitor/issues/6251)) ([028c556](https://github.com/ionic-team/capacitor/commit/028c556a50b41ee99fe8f4f1aa2f42d3fd57f92d))

## [4.6.2](https://github.com/ionic-team/capacitor/compare/4.6.1...4.6.2) (2023-01-17)

### Bug Fixes

- **android:** get application/x-www-form-urlencoded as string ([#6165](https://github.com/ionic-team/capacitor/issues/6165)) ([0735e89](https://github.com/ionic-team/capacitor/commit/0735e89d48e77a1ddca97a48e3851f4a0a3ea2c1))
- **cli:** config file android release type not overridden ([#6205](https://github.com/ionic-team/capacitor/issues/6205)) ([1441c55](https://github.com/ionic-team/capacitor/commit/1441c551737ce42dd2b82fc1a9da1e8311e27f1a))
- **cli:** flavor flag not using correct apk ([#6151](https://github.com/ionic-team/capacitor/issues/6151)) ([f4e7f19](https://github.com/ionic-team/capacitor/commit/f4e7f19f186e334404b2cd0decc3205e57bf4469))
- **ios:** CapacitorHttp cannot use delete method ([#6220](https://github.com/ionic-team/capacitor/issues/6220)) ([4d238a9](https://github.com/ionic-team/capacitor/commit/4d238a9e0dcf1e3e8c105c3aa4c7361abf16398e))
- **ios:** encode whitespace in http plugin urls ([#6169](https://github.com/ionic-team/capacitor/issues/6169)) ([dccb0a9](https://github.com/ionic-team/capacitor/commit/dccb0a99850c7c878906156a509ecd675836ef1a))
- **ios/android:** better http error handling ([#6208](https://github.com/ionic-team/capacitor/issues/6208)) ([7d4d70a](https://github.com/ionic-team/capacitor/commit/7d4d70a0500b7996c710c0762907f44bdf27c92b))

## [4.6.1](https://github.com/ionic-team/capacitor/compare/4.6.0...4.6.1) (2022-12-05)

### Bug Fixes

- **cli:** support variables in config warn checks ([#6136](https://github.com/ionic-team/capacitor/issues/6136)) ([b460add](https://github.com/ionic-team/capacitor/commit/b460add5e22139f234ca8fae98f174bb7c447292))

# [4.6.0](https://github.com/ionic-team/capacitor/compare/4.5.0...4.6.0) (2022-12-01)

### Bug Fixes

- **android:** Don't run Cordova plugins on ui thread ([#6108](https://github.com/ionic-team/capacitor/issues/6108)) ([592ee86](https://github.com/ionic-team/capacitor/commit/592ee862a58f5cb0737620a0246fe8ae295d27cf))
- **cli:** useLegacyBridge should be optional ([#6095](https://github.com/ionic-team/capacitor/issues/6095)) ([20f68fe](https://github.com/ionic-team/capacitor/commit/20f68feab2cb88cf8a79a987533839aa49255607))
- **cli:** warns about config that is present ([#6060](https://github.com/ionic-team/capacitor/issues/6060)) ([7ac43e7](https://github.com/ionic-team/capacitor/commit/7ac43e722139a61129cfecf98da373659b1aeac8))
- **cookies:** Use Set-Cookie headers to persist cookies ([57f8b39](https://github.com/ionic-team/capacitor/commit/57f8b39d7f4c5ee0e5e5cb316913e9450a81d22b))

### Features

- **android:** Plugin Instance Support ([#6073](https://github.com/ionic-team/capacitor/issues/6073)) ([3d5b7c2](https://github.com/ionic-team/capacitor/commit/3d5b7c2d372cf764c625f46d1e8761e05b8959da))
- **ios:** Plugin Registration and Plugin Instance Support ([#6072](https://github.com/ionic-team/capacitor/issues/6072)) ([9f1d863](https://github.com/ionic-team/capacitor/commit/9f1d863c1222096334a0dd05f39ce7f984a2763a))

# [4.5.0](https://github.com/ionic-team/capacitor/compare/4.4.0...4.5.0) (2022-11-16)

### Bug Fixes

- **android:** Silence deprecation warning on handlePermissionResult ([#6092](https://github.com/ionic-team/capacitor/issues/6092)) ([888b13e](https://github.com/ionic-team/capacitor/commit/888b13e89c48dab949b38135a3ec443ac4fd852e))
- **cli:** add vite config to framework detection ([#6039](https://github.com/ionic-team/capacitor/issues/6039)) ([3796d42](https://github.com/ionic-team/capacitor/commit/3796d42665f3150f99c761aa561a9e34d03cae28))
- **cli:** calculate padding of super.onCreate(savedInstanceState); line ([#6016](https://github.com/ionic-team/capacitor/issues/6016)) ([5729ac1](https://github.com/ionic-team/capacitor/commit/5729ac19e7880713ec52bac431a2756da5aa3109))
- **cli:** Update gradle versions only if they are older ([#6015](https://github.com/ionic-team/capacitor/issues/6015)) ([ae94101](https://github.com/ionic-team/capacitor/commit/ae941017fff3bcfa75e0788535f356a56ce6fa05))
- **cli/ios:** Read handleApplicationNotifications configuration option ([#6030](https://github.com/ionic-team/capacitor/issues/6030)) ([99ccf18](https://github.com/ionic-team/capacitor/commit/99ccf181f6ee8a00ed97bdbf9076e2b2ea27cd57))

### Features

- **android/cli:** Allow to use the old addJavascriptInterface bridge ([#6043](https://github.com/ionic-team/capacitor/issues/6043)) ([a6e7c54](https://github.com/ionic-team/capacitor/commit/a6e7c5422687b703492a5fcc49369eacc376143d))
- **cookies:** add get cookies plugin method ([ba1e770](https://github.com/ionic-team/capacitor/commit/ba1e7702a3338714aee24388c0afea39706c9341))

# [4.4.0](https://github.com/ionic-team/capacitor/compare/4.3.0...4.4.0) (2022-10-21)

### Bug Fixes

- **android:** added ServerPath object and building options for setting initial load from portals ([#6008](https://github.com/ionic-team/capacitor/issues/6008)) ([205b6e6](https://github.com/ionic-team/capacitor/commit/205b6e61806158244846608b1e6c0c7b26ee4ab7))
- **cookies:** make document.cookie setter synchronous ([2272abf](https://github.com/ionic-team/capacitor/commit/2272abf3d3d9dc82d9ca0d03b17e2b78f11f61fc))
- **http:** fix exception thrown on 204 responses ([1f6e8be](https://github.com/ionic-team/capacitor/commit/1f6e8be9d8813c4397e2c54ac4c06beb55f97b5f))
- **http:** fix local http requests on native platforms ([c4e040a](https://github.com/ionic-team/capacitor/commit/c4e040a6f8c6b54bac6ae320e5f0f008604fe50f))

### Features

- **cli:** add build command for android ([#5891](https://github.com/ionic-team/capacitor/issues/5891)) ([6d4e620](https://github.com/ionic-team/capacitor/commit/6d4e620308b6dd97376e3af7de1dd1a530083f1c))
- **cli:** add build command for ios ([#5925](https://github.com/ionic-team/capacitor/issues/5925)) ([8e8414f](https://github.com/ionic-team/capacitor/commit/8e8414fa6f4ccb245576cc113eb969937613bbf7))
- **cli:** supports secure live updates in Portals for Capacitor config ([#5955](https://github.com/ionic-team/capacitor/issues/5955)) ([a309b45](https://github.com/ionic-team/capacitor/commit/a309b455fdd190613353bdf0eb04469cf4aa6ccd))

# [4.3.0](https://github.com/ionic-team/capacitor/compare/4.2.0...4.3.0) (2022-09-21)

### Bug Fixes

- **android:** open external links in browser ([#5913](https://github.com/ionic-team/capacitor/issues/5913)) ([7553ede](https://github.com/ionic-team/capacitor/commit/7553ede93170971e21ab3dec1798443d084ead2a))
- **android:** set all cookies on proxied requests ([#5781](https://github.com/ionic-team/capacitor/issues/5781)) ([5ef6a38](https://github.com/ionic-team/capacitor/commit/5ef6a3889121dd39a9159ff80250df18854bc557))
- **android:** set WebViewClient on the WebView ([#5919](https://github.com/ionic-team/capacitor/issues/5919)) ([020ed8e](https://github.com/ionic-team/capacitor/commit/020ed8eaeb7864399d4b93f54ab7601c607d8e0d))
- **cli:** Find the Info.plist when using scheme ([#5914](https://github.com/ionic-team/capacitor/issues/5914)) ([f7029ac](https://github.com/ionic-team/capacitor/commit/f7029acb885ec60f85a434b6f71e4f2a633c7651))
- **cli:** Make migrator update gradle wrapper files ([#5910](https://github.com/ionic-team/capacitor/issues/5910)) ([b8b9b1f](https://github.com/ionic-team/capacitor/commit/b8b9b1f96249908435017eea6c427221f1971836))
- **cli:** Make update from windows use proper paths on Podfile ([#5906](https://github.com/ionic-team/capacitor/issues/5906)) ([c41d28f](https://github.com/ionic-team/capacitor/commit/c41d28f8cc829c6bf69d776280c9f1fdba9f866f))
- **cli:** show error if npm install on migration failed ([#5904](https://github.com/ionic-team/capacitor/issues/5904)) ([aa60a75](https://github.com/ionic-team/capacitor/commit/aa60a75d9c2c784e127a4d89e4079b412fbe7262))
- **core:** Exception object was not set on Cap ([#5917](https://github.com/ionic-team/capacitor/issues/5917)) ([9ca27a4](https://github.com/ionic-team/capacitor/commit/9ca27a4f8441b368f8bf9d97dda57b1a55ac0e4e))

### Features

- Capacitor Cookies & Capacitor Http core plugins ([d4047cf](https://github.com/ionic-team/capacitor/commit/d4047cfa947676777f400389a8d65defae140b45))

# [4.2.0](https://github.com/ionic-team/capacitor/compare/4.1.0...4.2.0) (2022-09-08)

### Features

- **cli:** add inline option to copy command ([#5901](https://github.com/ionic-team/capacitor/issues/5901)) ([17fbabb](https://github.com/ionic-team/capacitor/commit/17fbabb2a77d1b356d24048efc5883bd4d049104))
- **cli:** add scheme and flavor options to run command ([#5873](https://github.com/ionic-team/capacitor/issues/5873)) ([e4c143d](https://github.com/ionic-team/capacitor/commit/e4c143d4da653533570215964808c2f32f5469d3))
- **cli:** copy signature when using secure live updates ([#5896](https://github.com/ionic-team/capacitor/issues/5896)) ([0f17177](https://github.com/ionic-team/capacitor/commit/0f17177b1c64c0f69f86e990e4e150b820da497b))

# [4.1.0](https://github.com/ionic-team/capacitor/compare/4.0.1...4.1.0) (2022-08-18)

### Bug Fixes

- **cli:** Also update preferences plugin if present ([#5831](https://github.com/ionic-team/capacitor/issues/5831)) ([b9d5954](https://github.com/ionic-team/capacitor/commit/b9d5954ca0b333f2caa20179b96b049379860ea5))
- **cli:** Don't add google-services plugin if missing ([#5825](https://github.com/ionic-team/capacitor/issues/5825)) ([48ff9e6](https://github.com/ionic-team/capacitor/commit/48ff9e6461e8037a5c6da87c90efc6bc872d7f08))
- **cli:** make migrator also update plugin variables ([#5871](https://github.com/ionic-team/capacitor/issues/5871)) ([478d48c](https://github.com/ionic-team/capacitor/commit/478d48c3e322cffc6f0ff7ce590b635de4b41279))
- **cli:** Migrator put registerPlugin before super.onCreate ([#5828](https://github.com/ionic-team/capacitor/issues/5828)) ([8cd3373](https://github.com/ionic-team/capacitor/commit/8cd3373133903f97a836fd6ac6b7ce4e1ba9317e))
- **cli:** prevent error on migrate when devDependencies is missing ([#5863](https://github.com/ionic-team/capacitor/issues/5863)) ([474ad1f](https://github.com/ionic-team/capacitor/commit/474ad1f4d4a9ea0636a457836c938dac9f6534e8))
- **cli:** remove double space in cap 2 variables file ([#5826](https://github.com/ionic-team/capacitor/issues/5826)) ([7184097](https://github.com/ionic-team/capacitor/commit/7184097da88ed34f3e754119f967d262aa5e2add))
- **cli:** Support of BoM dependencies on cordova plugins ([#5827](https://github.com/ionic-team/capacitor/issues/5827)) ([ea2d95b](https://github.com/ionic-team/capacitor/commit/ea2d95ba43467cd2d4c4637aacab6bf655d9c596))
- **ios:** Prevent Xcode 14 warning on CAPWebView ([#5821](https://github.com/ionic-team/capacitor/issues/5821)) ([66954ef](https://github.com/ionic-team/capacitor/commit/66954ef6bc93f2038d85a386ef2f8b582af11bc3))
- **ios:** return proper mimeType on M1 x86_64 simulators ([#5853](https://github.com/ionic-team/capacitor/issues/5853)) ([325b6fe](https://github.com/ionic-team/capacitor/commit/325b6fe83939efaaef44c7e8624e33de742a57e2)), closes [#5793](https://github.com/ionic-team/capacitor/issues/5793)
- update @types/tar to prevent core build failure ([#5822](https://github.com/ionic-team/capacitor/issues/5822)) ([59e64b7](https://github.com/ionic-team/capacitor/commit/59e64b7c548341c27a8477ddc867290592c43815))

### Features

- **cli:** Option to inline JS source maps during sync ([#5843](https://github.com/ionic-team/capacitor/issues/5843)) ([7ce6dd4](https://github.com/ionic-team/capacitor/commit/7ce6dd4b6fb5cdc395add6f656fbedc785178ae3))
- **ios:** Add `setServerBasePath(_:)` to CAPBridgeProtocol ([#5860](https://github.com/ionic-team/capacitor/issues/5860)) ([76f28e7](https://github.com/ionic-team/capacitor/commit/76f28e70a5c0a03e4c6b9a93a0c068666a2c38ff))

## [4.0.1](https://github.com/ionic-team/capacitor/compare/4.0.0...4.0.1) (2022-07-28)

### Bug Fixes

- **cli:** Correct Splash theme update ([#5805](https://github.com/ionic-team/capacitor/issues/5805)) ([25b82a8](https://github.com/ionic-team/capacitor/commit/25b82a84425bf09b2be45b213788b0e13982b9b3))
- **cli:** Revert some splash migration errors ([#5806](https://github.com/ionic-team/capacitor/issues/5806)) ([471feed](https://github.com/ionic-team/capacitor/commit/471feedc07bef357ac798fcba664bd373e9f8ebf))
- **ios:** publish Podfile script ([#5799](https://github.com/ionic-team/capacitor/issues/5799)) ([604f03a](https://github.com/ionic-team/capacitor/commit/604f03a29bc500d2841987d0a0f1b20d34fba7d6))

# [4.0.0](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.2...4.0.0) (2022-07-27)

### Bug Fixes

- **android:** Publish proguard-rules.pro on npm ([#5761](https://github.com/ionic-team/capacitor/issues/5761)) ([df77103](https://github.com/ionic-team/capacitor/commit/df77103ca411fa452239099769289eeeea2404d2))
- **ios:** error data is optional ([#5782](https://github.com/ionic-team/capacitor/issues/5782)) ([da48d79](https://github.com/ionic-team/capacitor/commit/da48d798c3463de9de188ae6a6475fd6afba6091))

### Features

- **android:** Add android.minWebviewVersion configuration option ([#5768](https://github.com/ionic-team/capacitor/issues/5768)) ([ad83827](https://github.com/ionic-team/capacitor/commit/ad838279e9cd190ce6f1a020a0ac9e3916786324))
- **android:** Add Optional Data Param for Error Object ([#5719](https://github.com/ionic-team/capacitor/issues/5719)) ([174172b](https://github.com/ionic-team/capacitor/commit/174172b6c64dc9117c48ed0e20c25e0b6c2fb625))
- **android:** Use addWebMessageListener where available ([#5427](https://github.com/ionic-team/capacitor/issues/5427)) ([c2dfe80](https://github.com/ionic-team/capacitor/commit/c2dfe808446717412b35e82713d123b7a052f264))
- **android-template:** Use Android 12 splash API ([#5777](https://github.com/ionic-team/capacitor/issues/5777)) ([f3ab951](https://github.com/ionic-team/capacitor/commit/f3ab9519e1f08d5dfeb2db61b6939725be92b4f3))
- **cli:** add migrator for cap3 to cap4 ([#5762](https://github.com/ionic-team/capacitor/issues/5762)) ([7cb660a](https://github.com/ionic-team/capacitor/commit/7cb660a34d9a87274761d4492d0d77c9ef44ace8))
- **ios:** Add overrideable router var for CAPWebView. ([#5743](https://github.com/ionic-team/capacitor/issues/5743)) ([c1de1c0](https://github.com/ionic-team/capacitor/commit/c1de1c0138aad188a760118e35983d10d257f8e7))
- **iOS:** post install script for deployment target ([#5783](https://github.com/ionic-team/capacitor/issues/5783)) ([f5afa94](https://github.com/ionic-team/capacitor/commit/f5afa94b3b9c246d87b2af03359840f503bace90))
- Add option for custom error page ([#5723](https://github.com/ionic-team/capacitor/issues/5723)) ([e8bdef3](https://github.com/ionic-team/capacitor/commit/e8bdef3b4634e4ad45fa8fc34c7c0ab8dfa383f3))

# [4.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.1...4.0.0-beta.2) (2022-07-08)

### Bug Fixes

- **ios:** Add check for both serverURL and localURL in navigation ([#5736](https://github.com/ionic-team/capacitor/issues/5736)) ([8e824f3](https://github.com/ionic-team/capacitor/commit/8e824f33ad4df898fb8c0936a8f5e9041832a5c5))
- **ios:** properly deliver retained events after listener re-add [#5732](https://github.com/ionic-team/capacitor/issues/5732) ([c5d6328](https://github.com/ionic-team/capacitor/commit/c5d632831924a1bcc868bc46b42f7ff619408752))

### Features

- **ios:** Add `setServerBasePath(path:)` to CAPWebView ([#5742](https://github.com/ionic-team/capacitor/issues/5742)) ([1afbf8a](https://github.com/ionic-team/capacitor/commit/1afbf8a9dd0b8f7b1ac439d24e5d8ba26f786318))
- Add CapWebView ([#5715](https://github.com/ionic-team/capacitor/issues/5715)) ([143d266](https://github.com/ionic-team/capacitor/commit/143d266ef0a818bac59dbbdaeda3b5c382ebfa1d))

# [4.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.0...4.0.0-beta.1) (2022-06-27)

### Bug Fixes

- **ios:** Remove Cordova as an embedded framework ([#5709](https://github.com/ionic-team/capacitor/issues/5709)) ([bbf6d24](https://github.com/ionic-team/capacitor/commit/bbf6d248bf9217a5c5c6c15c7bcfeda209aba5b1))

### Features

- **ios:** Allow to configure popover size ([#5717](https://github.com/ionic-team/capacitor/issues/5717)) ([ca1a125](https://github.com/ionic-team/capacitor/commit/ca1a125e5ab05d6066dd303bc75e99dfe21f210a))

# [4.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.6.0...4.0.0-beta.0) (2022-06-17)

### Bug Fixes

- **android:** make removeAllListeners return a promise ([#5527](https://github.com/ionic-team/capacitor/issues/5527)) ([6f4d858](https://github.com/ionic-team/capacitor/commit/6f4d858ea879d97109c0c7da2d664d04806adc2a))
- **android:** prevent app from loading if server.url is invalid ([d4a0dea](https://github.com/ionic-team/capacitor/commit/d4a0deaa37eda4476f0be030e266c2c1260fc6e8))
- **cli:** Use CURRENT_PROJECT_VERSION variable on ios template ([#5418](https://github.com/ionic-team/capacitor/issues/5418)) ([0a07648](https://github.com/ionic-team/capacitor/commit/0a07648b4d1c5fb1fd7de3c72ac1bbcb30f48203))
- **ios:** make removeAllListeners return a promise ([#5526](https://github.com/ionic-team/capacitor/issues/5526)) ([815f71b](https://github.com/ionic-team/capacitor/commit/815f71b6b62f6c4d5f66e6a36c190bb00a96fdcc))

### Features

- **android:** don't allow server.androidScheme to be set to schemes handled by WebView ([01285ba](https://github.com/ionic-team/capacitor/commit/01285ba253d602b08a41240ad2ccf370730d51a3))
- **android:** set default targetSDK to 31 ([#5442](https://github.com/ionic-team/capacitor/issues/5442)) ([4442459](https://github.com/ionic-team/capacitor/commit/4442459b24cdbac25cb1e4de11583d22c21452b3))
- **android:** set default targetSDK to 32 ([#5611](https://github.com/ionic-team/capacitor/issues/5611)) ([416b966](https://github.com/ionic-team/capacitor/commit/416b9662fbf6233d23216c0c0441862603c3a723))
- **android:** Upgrade gradle to 7.4 ([#5445](https://github.com/ionic-team/capacitor/issues/5445)) ([28eaf18](https://github.com/ionic-team/capacitor/commit/28eaf1851fa7a912917dbb40c68fb4dd583d08ad))
- **android:** Use java 11 ([#5552](https://github.com/ionic-team/capacitor/issues/5552)) ([e47959f](https://github.com/ionic-team/capacitor/commit/e47959fcbd6a89b97b1275a5814fdb4e7ce30672))
- **android-template:** use DayNight theme as default ([#5643](https://github.com/ionic-team/capacitor/issues/5643)) ([9d76869](https://github.com/ionic-team/capacitor/commit/9d76869129cec6ea67c083a850447b4bfcf48947))
- **cli:** export android-template activity for SDK 31 support ([#5351](https://github.com/ionic-team/capacitor/issues/5351)) ([79b4a3c](https://github.com/ionic-team/capacitor/commit/79b4a3c56ce9704bc8f5b0b8ce6d5e60f86d4d2c))
- **cli:** set targetSDK to 31 in android-template ([#5443](https://github.com/ionic-team/capacitor/issues/5443)) ([8793c58](https://github.com/ionic-team/capacitor/commit/8793c58f24611d7780aff80d547b367f4114f7c5))
- **cli:** set targetSDK to 32 in android-template ([#5612](https://github.com/ionic-team/capacitor/issues/5612)) ([8b8be47](https://github.com/ionic-team/capacitor/commit/8b8be4706b7534e346738479865e5f66a25005bf))
- **cli:** Upgrade Gradle to 7.4 in the template ([#5446](https://github.com/ionic-team/capacitor/issues/5446)) ([11b648d](https://github.com/ionic-team/capacitor/commit/11b648d21567c5ab8e7e195fdefec1e1254ce62a))
- **ios:** add getConfig to CAPPlugin ([#5495](https://github.com/ionic-team/capacitor/issues/5495)) ([224a9d0](https://github.com/ionic-team/capacitor/commit/224a9d075629d9c9da9ddc658eb282617fc46d09))
- **ios:** Add preferredContentMode configuration option ([#5583](https://github.com/ionic-team/capacitor/issues/5583)) ([5b6dfa3](https://github.com/ionic-team/capacitor/commit/5b6dfa3fe29c85632546b299f03cc04a77cf7475))
- **ios:** Support of range requests on WebViewAssetHandler ([#5659](https://github.com/ionic-team/capacitor/issues/5659)) ([348c08d](https://github.com/ionic-team/capacitor/commit/348c08d511e9d57a1b2ecedc3290c65fa9ba3924))

# [3.6.0](https://github.com/ionic-team/capacitor/compare/3.5.1...3.6.0) (2022-06-17)

### Bug Fixes

- **ios:** Use `URL(fileURLWithPath:)` instead of `URL(string:)` ([#5603](https://github.com/ionic-team/capacitor/issues/5603)) ([5fac1b2](https://github.com/ionic-team/capacitor/commit/5fac1b2da5aa5882087716cb2aa862d89173f4a1))

### Features

- **android:** update support for Portals for Capacitor to include Live Updates ([#5660](https://github.com/ionic-team/capacitor/issues/5660)) ([62f0a5e](https://github.com/ionic-team/capacitor/commit/62f0a5eaa40776aad79dbf8f8c0900037d3cc97e))
- **iOS, Android:** add AppUUID Lib for plugins ([#5690](https://github.com/ionic-team/capacitor/issues/5690)) ([05e76cf](https://github.com/ionic-team/capacitor/commit/05e76cf526a44e07fa75f9482fa2223a13918638))

# [4.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.2) (2022-05-12)

### Bug Fixes

- **android:** make removeAllListeners return a promise ([#5527](https://github.com/ionic-team/capacitor/issues/5527)) ([6f4d858](https://github.com/ionic-team/capacitor/commit/6f4d858ea879d97109c0c7da2d664d04806adc2a))
- **android:** prevent app from loading if server.url is invalid ([d4a0dea](https://github.com/ionic-team/capacitor/commit/d4a0deaa37eda4476f0be030e266c2c1260fc6e8))
- **cli:** Use CURRENT_PROJECT_VERSION variable on ios template ([#5418](https://github.com/ionic-team/capacitor/issues/5418)) ([0a07648](https://github.com/ionic-team/capacitor/commit/0a07648b4d1c5fb1fd7de3c72ac1bbcb30f48203))
- **ios:** make removeAllListeners return a promise ([#5526](https://github.com/ionic-team/capacitor/issues/5526)) ([815f71b](https://github.com/ionic-team/capacitor/commit/815f71b6b62f6c4d5f66e6a36c190bb00a96fdcc))

### Features

- **android:** don't allow server.androidScheme to be set to schemes handled by WebView ([01285ba](https://github.com/ionic-team/capacitor/commit/01285ba253d602b08a41240ad2ccf370730d51a3))
- **android:** set default targetSDK to 31 ([#5442](https://github.com/ionic-team/capacitor/issues/5442)) ([4442459](https://github.com/ionic-team/capacitor/commit/4442459b24cdbac25cb1e4de11583d22c21452b3))
- **android:** Upgrade gradle to 7.4 ([#5445](https://github.com/ionic-team/capacitor/issues/5445)) ([28eaf18](https://github.com/ionic-team/capacitor/commit/28eaf1851fa7a912917dbb40c68fb4dd583d08ad))
- **android:** Use java 11 ([#5552](https://github.com/ionic-team/capacitor/issues/5552)) ([e47959f](https://github.com/ionic-team/capacitor/commit/e47959fcbd6a89b97b1275a5814fdb4e7ce30672))
- **cli:** export android-template activity for SDK 31 support ([#5351](https://github.com/ionic-team/capacitor/issues/5351)) ([79b4a3c](https://github.com/ionic-team/capacitor/commit/79b4a3c56ce9704bc8f5b0b8ce6d5e60f86d4d2c))
- **cli:** set targetSDK to 31 in android-template ([#5443](https://github.com/ionic-team/capacitor/issues/5443)) ([8793c58](https://github.com/ionic-team/capacitor/commit/8793c58f24611d7780aff80d547b367f4114f7c5))
- **cli:** Upgrade Gradle to 7.4 in the template ([#5446](https://github.com/ionic-team/capacitor/issues/5446)) ([11b648d](https://github.com/ionic-team/capacitor/commit/11b648d21567c5ab8e7e195fdefec1e1254ce62a))
- **ios:** add getConfig to CAPPlugin ([#5495](https://github.com/ionic-team/capacitor/issues/5495)) ([224a9d0](https://github.com/ionic-team/capacitor/commit/224a9d075629d9c9da9ddc658eb282617fc46d09))
- **ios:** Add preferredContentMode configuration option ([#5583](https://github.com/ionic-team/capacitor/issues/5583)) ([5b6dfa3](https://github.com/ionic-team/capacitor/commit/5b6dfa3fe29c85632546b299f03cc04a77cf7475))

## [3.5.1](https://github.com/ionic-team/capacitor/compare/3.5.0...3.5.1) (2022-05-04)

### Bug Fixes

- **android:** move initialFocus on webview into config ([#5579](https://github.com/ionic-team/capacitor/issues/5579)) ([8b4e861](https://github.com/ionic-team/capacitor/commit/8b4e861514b0fbe08e9296f49c280234f54742e1))
- **core:** Make cordova bridge use Promise instead of setTimeout ([#5586](https://github.com/ionic-team/capacitor/issues/5586)) ([f35d96b](https://github.com/ionic-team/capacitor/commit/f35d96b185f5890600a64b78e6bf939c336cbb2d))

# [3.5.0](https://github.com/ionic-team/capacitor/compare/3.4.3...3.5.0) (2022-04-22)

### Features

- **android:** Add overridable routing for WebViewLocalServer ([#5553](https://github.com/ionic-team/capacitor/issues/5553)) ([3bb288e](https://github.com/ionic-team/capacitor/commit/3bb288e848c5c0e49c1e58c0782e0b1ffd7b1f31))
- **cli:** support capacitor portals plugin changes needed ([#5558](https://github.com/ionic-team/capacitor/issues/5558)) ([6810a19](https://github.com/ionic-team/capacitor/commit/6810a19ae2bbda1f4b2afad61d37ca822ca157f5))
- **ios:** Add overrideable routing for CAPBridgeViewController subclasses ([#5546](https://github.com/ionic-team/capacitor/issues/5546)) ([8875d5e](https://github.com/ionic-team/capacitor/commit/8875d5e2721e8a8ee763ce70cb672db383f36efa))

# [4.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.1) (2022-03-25)

### Bug Fixes

- **cli:** Use CURRENT_PROJECT_VERSION variable on ios template ([#5418](https://github.com/ionic-team/capacitor/issues/5418)) ([0a07648](https://github.com/ionic-team/capacitor/commit/0a07648b4d1c5fb1fd7de3c72ac1bbcb30f48203))

### Features

- **android:** set default targetSDK to 31 ([#5442](https://github.com/ionic-team/capacitor/issues/5442)) ([4442459](https://github.com/ionic-team/capacitor/commit/4442459b24cdbac25cb1e4de11583d22c21452b3))
- **android:** Upgrade gradle to 7.4 ([#5445](https://github.com/ionic-team/capacitor/issues/5445)) ([28eaf18](https://github.com/ionic-team/capacitor/commit/28eaf1851fa7a912917dbb40c68fb4dd583d08ad))
- **cli:** export android-template activity for SDK 31 support ([#5351](https://github.com/ionic-team/capacitor/issues/5351)) ([79b4a3c](https://github.com/ionic-team/capacitor/commit/79b4a3c56ce9704bc8f5b0b8ce6d5e60f86d4d2c))
- **cli:** set targetSDK to 31 in android-template ([#5443](https://github.com/ionic-team/capacitor/issues/5443)) ([8793c58](https://github.com/ionic-team/capacitor/commit/8793c58f24611d7780aff80d547b367f4114f7c5))
- **cli:** Upgrade Gradle to 7.4 in the template ([#5446](https://github.com/ionic-team/capacitor/issues/5446)) ([11b648d](https://github.com/ionic-team/capacitor/commit/11b648d21567c5ab8e7e195fdefec1e1254ce62a))
- **ios:** add getConfig to CAPPlugin ([#5495](https://github.com/ionic-team/capacitor/issues/5495)) ([224a9d0](https://github.com/ionic-team/capacitor/commit/224a9d075629d9c9da9ddc658eb282617fc46d09))

## [3.4.3](https://github.com/ionic-team/capacitor/compare/3.4.2...3.4.3) (2022-03-04)

### Bug Fixes

- **cli:** avoid srcFiles is not iterable on kotlinNeededCheck ([#5481](https://github.com/ionic-team/capacitor/issues/5481)) ([3c2b579](https://github.com/ionic-team/capacitor/commit/3c2b579c6edb1fc69d85689b268eb92067b7821b))

## [3.4.2](https://github.com/ionic-team/capacitor/compare/3.4.1...3.4.2) (2022-03-03)

### Bug Fixes

- **android:** compatibility with cordova kotlin plugins ([#5438](https://github.com/ionic-team/capacitor/issues/5438)) ([55bf004](https://github.com/ionic-team/capacitor/commit/55bf004897b3feb280ab6b6575d2a2c1a0a183e2))

## [3.4.1](https://github.com/ionic-team/capacitor/compare/3.4.0...3.4.1) (2022-02-09)

### Bug Fixes

- **ci:** add token to ghr call in xcframework build action ([#5422](https://github.com/ionic-team/capacitor/issues/5422)) ([5573a77](https://github.com/ionic-team/capacitor/commit/5573a77b13539a5c36e4fbc7a1cd6548689d83d3))
- **ci:** Fix tags/releases for Attach .xcframework CI action ([#5423](https://github.com/ionic-team/capacitor/issues/5423)) ([57b3df3](https://github.com/ionic-team/capacitor/commit/57b3df3724a2bda8e59af83f99c127b1503b5c37))
- **cli:** Better error on gradlew permission problems ([#5405](https://github.com/ionic-team/capacitor/issues/5405)) ([9420f08](https://github.com/ionic-team/capacitor/commit/9420f08dedad78cfaa5500cccf8bdbf1a9140684))
- **ios:** Reload webView on webViewWebContentProcessDidTerminate ([#5391](https://github.com/ionic-team/capacitor/issues/5391)) ([beebff4](https://github.com/ionic-team/capacitor/commit/beebff4550575c28c233937a11a8eacf5a76411c))

# [3.4.0](https://github.com/ionic-team/capacitor/compare/3.3.4...3.4.0) (2022-01-19)

### Bug Fixes

- **android:** Add appcompat to capacitor-cordova-android-plugins module ([#5373](https://github.com/ionic-team/capacitor/issues/5373)) ([1c756b7](https://github.com/ionic-team/capacitor/commit/1c756b77bf334036a4b30ddac86ac926fa6c0b3d))
- **android:** prevent input file crash if accept has . ([#5363](https://github.com/ionic-team/capacitor/issues/5363)) ([bdacb30](https://github.com/ionic-team/capacitor/commit/bdacb300bb6391dc4b84bb2bab075df993a15cba))

### Features

- **android:** Add getLong helper on PluginCall ([#5235](https://github.com/ionic-team/capacitor/issues/5235)) ([26261fb](https://github.com/ionic-team/capacitor/commit/26261fb49211330c4db72c259359565da7d7bc4b))
- **ios:** Add new iOS 15 Motion permission delegate ([#5317](https://github.com/ionic-team/capacitor/issues/5317)) ([c05a3cb](https://github.com/ionic-team/capacitor/commit/c05a3cbbf02217e3972d5e067970cae18bff3faa))
- **ios:** Add new iOS15 media capture permission delegate ([#5196](https://github.com/ionic-team/capacitor/issues/5196)) ([d8b54ac](https://github.com/ionic-team/capacitor/commit/d8b54ac23414bfe56e50e1254066630a6f87eb0e))

## [3.3.4](https://github.com/ionic-team/capacitor/compare/3.3.3...3.3.4) (2022-01-05)

### Bug Fixes

- **android:** Prevent crash if activity killed on input file ([#5328](https://github.com/ionic-team/capacitor/issues/5328)) ([a206841](https://github.com/ionic-team/capacitor/commit/a20684180a9b6fd50547ae578f21531faa116da5))
- **cli:** Escape appName from invalid characters on add ([#5325](https://github.com/ionic-team/capacitor/issues/5325)) ([033f4ee](https://github.com/ionic-team/capacitor/commit/033f4eef59fdb7cc32018b162114511448bc46a6))
- **cli:** sync failing if Info.plist is localized ([#5333](https://github.com/ionic-team/capacitor/issues/5333)) ([df7a104](https://github.com/ionic-team/capacitor/commit/df7a1041c4e2d9a5a1ceef247ed00f9f8467df76))

## [3.3.3](https://github.com/ionic-team/capacitor/compare/3.3.2...3.3.3) (2021-12-08)

### Bug Fixes

- **android:** change logging level of google services message ([#5189](https://github.com/ionic-team/capacitor/issues/5189)) ([6b1dd43](https://github.com/ionic-team/capacitor/commit/6b1dd430dc91eb9e2b36edaa173ccc294c9fb4ff))
- **android:** Prevent crash in restoreInstanceState if bundleData is null ([#5289](https://github.com/ionic-team/capacitor/issues/5289)) ([622d62f](https://github.com/ionic-team/capacitor/commit/622d62fc0d7cd79558bf6f11331bd7d6690aa4f9))
- **android:** restrict android run command to configured flavour ([#5256](https://github.com/ionic-team/capacitor/issues/5256)) ([ba84443](https://github.com/ionic-team/capacitor/commit/ba84443dce9c81e09140def57a60018b527b5bb5))
- **cli:** Add onesignal-cordova-plugin to the static list again ([#5262](https://github.com/ionic-team/capacitor/issues/5262)) ([e67ca99](https://github.com/ionic-team/capacitor/commit/e67ca9964c5a923d35f5cf41eb802c665563726f))
- **ios:** Present js alert on top of the presented VC ([#5282](https://github.com/ionic-team/capacitor/issues/5282)) ([a53d236](https://github.com/ionic-team/capacitor/commit/a53d236452e99d1e6151e19e313b3d1545957419))

## [3.3.2](https://github.com/ionic-team/capacitor/compare/3.3.1...3.3.2) (2021-11-17)

### Bug Fixes

- **android:** Allow web geolocation if only COARSE_LOCATION is granted ([#5236](https://github.com/ionic-team/capacitor/issues/5236)) ([bc7b24e](https://github.com/ionic-team/capacitor/commit/bc7b24e9b58b194b32b750c5816c8d8ef180834a))
- **cli:** add cordova-plugin-google-analytics to static list ([#5220](https://github.com/ionic-team/capacitor/issues/5220)) ([67a996c](https://github.com/ionic-team/capacitor/commit/67a996c0a6896e32c41ea01822d6435fdd706b84))
- **cli:** Add plugin to static list if pod has use-frameworks ([#5232](https://github.com/ionic-team/capacitor/issues/5232)) ([8a0518b](https://github.com/ionic-team/capacitor/commit/8a0518be9f6f6a4be4a9f1366cb8dcb191225b9d))
- **cli:** sync gradle from android folder ([#5233](https://github.com/ionic-team/capacitor/issues/5233)) ([cd779c4](https://github.com/ionic-team/capacitor/commit/cd779c4b6ed4ffc96777be7c94a0af4baca6d6d5))

## [3.3.1](https://github.com/ionic-team/capacitor/compare/3.3.0...3.3.1) (2021-11-05)

### Bug Fixes

- **cli:** Make config don't error if iOS is missing ([#5212](https://github.com/ionic-team/capacitor/issues/5212)) ([db9f12b](https://github.com/ionic-team/capacitor/commit/db9f12b545994b2ed88098c0168bb051f8191771))

# [3.3.0](https://github.com/ionic-team/capacitor/compare/3.2.5...3.3.0) (2021-11-03)

### Bug Fixes

- **cli:** Add Batch plugin to static list ([#5138](https://github.com/ionic-team/capacitor/issues/5138)) ([9470633](https://github.com/ionic-team/capacitor/commit/94706338c096b30390fa288c9b107e253923a644))
- **cli:** Add onesignal-cordova-plugin to static pod list ([#5143](https://github.com/ionic-team/capacitor/issues/5143)) ([937e240](https://github.com/ionic-team/capacitor/commit/937e2408f9bb60691e653b70d8b7cb02f540b251))
- **cli:** detect and register multiple plugins from same package ([#5098](https://github.com/ionic-team/capacitor/issues/5098)) ([25e770c](https://github.com/ionic-team/capacitor/commit/25e770c3f598bf3a1e05e21d607ab3ad70268674))
- **core:** avoid crash on logging circular objects ([#5186](https://github.com/ionic-team/capacitor/issues/5186)) ([1451ec8](https://github.com/ionic-team/capacitor/commit/1451ec850a9ef73267a032638e73f1fc440647b9))
- **ios:** Avoid CDVScreenOrientationDelegate umbrella header warning ([#5156](https://github.com/ionic-team/capacitor/issues/5156)) ([31ec30d](https://github.com/ionic-team/capacitor/commit/31ec30de193aa3117dbb7eda928ef3a365d5667c))

### Features

- **android:** ability to reload the webview ([#5184](https://github.com/ionic-team/capacitor/issues/5184)) ([c495bed](https://github.com/ionic-team/capacitor/commit/c495bed216ddf05450f185d2d3f09b4052b281a8))
- **cli:** add support for 'pod install' in VM based environments ([#5144](https://github.com/ionic-team/capacitor/issues/5144)) ([32ecf22](https://github.com/ionic-team/capacitor/commit/32ecf22de0a550756dbfa68b3b17c2333c89a430))
- **cli:** Allow to configure access origin tags on cordova config.xml ([#5134](https://github.com/ionic-team/capacitor/issues/5134)) ([0841a09](https://github.com/ionic-team/capacitor/commit/0841a093bf73ed4acac9a90be44a8e8a3aedbcdb))
- **cli:** Allow users to include Cordova plugins to the static list ([#5175](https://github.com/ionic-team/capacitor/issues/5175)) ([664149a](https://github.com/ionic-team/capacitor/commit/664149aadbe80e66dd757315a826ec1ab305edb9))

## [3.2.5](https://github.com/ionic-team/capacitor/compare/3.2.4...3.2.5) (2021-10-13)

### Bug Fixes

- **android:** Avoid ConcurrentModificationException on notifyListeners ([#5125](https://github.com/ionic-team/capacitor/issues/5125)) ([b82bfe0](https://github.com/ionic-team/capacitor/commit/b82bfe0db2e38fa286eb18391b1d5e2f86a1b35c))
- **android:** Support cordova-android 10 ([#5103](https://github.com/ionic-team/capacitor/issues/5103)) ([e238233](https://github.com/ionic-team/capacitor/commit/e238233dcf34a183af4861176789d1feb1eb51fa))
- **cli:** create only static pod if needed ([#5099](https://github.com/ionic-team/capacitor/issues/5099)) ([8304744](https://github.com/ionic-team/capacitor/commit/83047445562a52cc927c7c77d55b48288cfc1fcc))
- **ios:** proper handling of allowNavigation with multiple wildcard ([#5096](https://github.com/ionic-team/capacitor/issues/5096)) ([cda17a6](https://github.com/ionic-team/capacitor/commit/cda17a6c1504235c1c1e4826830f1d0e2ef2d35c))

## [3.2.4](https://github.com/ionic-team/capacitor/compare/3.2.3...3.2.4) (2021-09-27)

### Bug Fixes

- **cli:** await sync on add to avoid telemetry hang ([833bc20](https://github.com/ionic-team/capacitor/commit/833bc20525a2558e03cd0e56c6765ce6828cdfac))
- **ios:** Add CDVScreenOrientationDelegate protocol on CAPBridgeViewController ([#5070](https://github.com/ionic-team/capacitor/issues/5070)) ([530477d](https://github.com/ionic-team/capacitor/commit/530477d05e1364931f83a30d61d4f9b5cb687b19))
- **ios:** show correct line number on console logs ([#5073](https://github.com/ionic-team/capacitor/issues/5073)) ([ec41e74](https://github.com/ionic-team/capacitor/commit/ec41e743aa4ba81e791ad446fac461b7f43b46ed))

## [3.2.3](https://github.com/ionic-team/capacitor/compare/3.2.2...3.2.3) (2021-09-15)

### Bug Fixes

- **android:** proguard rules ([#5048](https://github.com/ionic-team/capacitor/issues/5048)) ([cf15c0f](https://github.com/ionic-team/capacitor/commit/cf15c0fb3bd67315011865fedb4157d5076965fd))
- Add SalesforceMobileSDK-CordovaPlugin to iOS incompatible list ([#5031](https://github.com/ionic-team/capacitor/issues/5031)) ([6f3f79f](https://github.com/ionic-team/capacitor/commit/6f3f79f412b77b0c90988226ec5ade5d0198c706))
- Define cordovaConfig gradle variable ([#5024](https://github.com/ionic-team/capacitor/issues/5024)) ([55c217e](https://github.com/ionic-team/capacitor/commit/55c217e6898d0270c23c3a7158a5102e9b84ff40))
- **android:** save activity result launcher calls ([#5004](https://github.com/ionic-team/capacitor/issues/5004)) ([2c1eb60](https://github.com/ionic-team/capacitor/commit/2c1eb603c79b94f6fcc74f0cbef523590b656a1e))

## [3.2.2](https://github.com/ionic-team/capacitor/compare/3.2.1...3.2.2) (2021-09-02)

### Bug Fixes

- **ios:** fixing podspec source paths ([#5002](https://github.com/ionic-team/capacitor/issues/5002)) ([6004a43](https://github.com/ionic-team/capacitor/commit/6004a43c608a4c967e3444c83954ad2095c3dcfd))

## [3.2.1](https://github.com/ionic-team/capacitor/compare/3.2.0...3.2.1) (2021-09-01)

**Note:** Version bump only for package capacitor

# [3.2.0](https://github.com/ionic-team/capacitor/compare/3.1.2...3.2.0) (2021-08-18)

### Bug Fixes

- **android:** Don't inject map files into capacitor script ([#4893](https://github.com/ionic-team/capacitor/issues/4893)) ([992bebc](https://github.com/ionic-team/capacitor/commit/992bebce5a54128ec09b4905c4424fbe392719be))
- **cli:** Put cordova git pod dependencies in Podfile ([#4940](https://github.com/ionic-team/capacitor/issues/4940)) ([642dbf4](https://github.com/ionic-team/capacitor/commit/642dbf433e22bb695e5f782bd685de42eb2afada))
- **cli:** Separate Swift plugins from ObjC plugins ([#4925](https://github.com/ionic-team/capacitor/issues/4925)) ([43ce803](https://github.com/ionic-team/capacitor/commit/43ce803975ccd66823aab1e8c0d44d0ca81c6b2f))

### Features

- **core:** implement CapacitorCustomPlatform for 3rd party platforms ([#4771](https://github.com/ionic-team/capacitor/issues/4771)) ([12c6294](https://github.com/ionic-team/capacitor/commit/12c6294b9eb82976b1322f00da9ba5a6004f7977))

## [3.1.2](https://github.com/ionic-team/capacitor/compare/3.1.1...3.1.2) (2021-07-21)

### Bug Fixes

- **android:** add missing android webview lifecycle events ([6a7c4e3](https://github.com/ionic-team/capacitor/commit/6a7c4e3b3a250270ac5c4b0f09da2a613ef2cf17))
- **android:** Set theme an content view on onCreate ([#4841](https://github.com/ionic-team/capacitor/issues/4841)) ([8950c60](https://github.com/ionic-team/capacitor/commit/8950c600bb6e3804b79c62e83fef2253c2cc2389))
- **cli:** Don't warn about hideLogs on some commands ([#4813](https://github.com/ionic-team/capacitor/issues/4813)) ([dc279cc](https://github.com/ionic-team/capacitor/commit/dc279cc0a4ba8332296c65ca00647829f43ed1d9))
- **core:** handle toJSON() in plugin objects ([#4823](https://github.com/ionic-team/capacitor/issues/4823)) ([0479822](https://github.com/ionic-team/capacitor/commit/04798221666437408f22947253a18ccb4f9e409e))
- **core:** Modify safeStringify to allow multiple null values ([#4853](https://github.com/ionic-team/capacitor/issues/4853)) ([854539b](https://github.com/ionic-team/capacitor/commit/854539b62a658e484954edbe38b25eea1b0b6f10))

## [3.1.1](https://github.com/ionic-team/capacitor/compare/3.1.0...3.1.1) (2021-07-07)

### Bug Fixes

- fixing peer deps issues in android and ios libs ([310d9f4](https://github.com/ionic-team/capacitor/commit/310d9f486db976cb258fcda5ac893f019667617f))

# [3.1.0](https://github.com/ionic-team/capacitor/compare/3.0.2...3.1.0) (2021-07-07)

### Bug Fixes

- **cli:** Don't error if there are no scripts ([#4763](https://github.com/ionic-team/capacitor/issues/4763)) ([dec3fb2](https://github.com/ionic-team/capacitor/commit/dec3fb285239912980f2abea1cf48c583da6a163))
- **ios:** isNewBinary is true if defaults have no stored versions ([#4779](https://github.com/ionic-team/capacitor/issues/4779)) ([bd86dbe](https://github.com/ionic-team/capacitor/commit/bd86dbeb74771ed201d0100773babf49e6764818))

### Features

- **cli:** Add hooks to call into npm scripts when capacitor commands run ([#4739](https://github.com/ionic-team/capacitor/issues/4739)) ([515230c](https://github.com/ionic-team/capacitor/commit/515230ccefec76d4b7ed03ef1122709d1b63b58a))
- **cli:** allow run command to use flavors ([#4782](https://github.com/ionic-team/capacitor/issues/4782)) ([05cb853](https://github.com/ionic-team/capacitor/commit/05cb8533d4479efd3dc823b18f48699302f462ba))
- **ios:** Add limitsNavigationsToAppBoundDomains configuration option ([#4789](https://github.com/ionic-team/capacitor/issues/4789)) ([2b7016f](https://github.com/ionic-team/capacitor/commit/2b7016f3b4d62fd8c9d03fde2745b3d515bf08b2))

## [3.0.2](https://github.com/ionic-team/capacitor/compare/3.0.1...3.0.2) (2021-06-23)

### Bug Fixes

- **android:** Set WEBVIEW_SERVER_URL before injecting native-bridge ([#4748](https://github.com/ionic-team/capacitor/issues/4748)) ([5d6b179](https://github.com/ionic-team/capacitor/commit/5d6b17994abc7ad770b95e3a9fc29aecf5d9fc05))
- **cli:** correctly show EACCES error on run ([#4742](https://github.com/ionic-team/capacitor/issues/4742)) ([2ab8778](https://github.com/ionic-team/capacitor/commit/2ab877881a292bba0aed946b20c3c6bb58808e58))
- **cli:** Don't error on ios sync on non macOS ([#4723](https://github.com/ionic-team/capacitor/issues/4723)) ([368ffad](https://github.com/ionic-team/capacitor/commit/368ffad03612841a8f228c6a174c141659f5293d))
- **core:** cordova events not firing ([#4712](https://github.com/ionic-team/capacitor/issues/4712)) ([ca4e3b6](https://github.com/ionic-team/capacitor/commit/ca4e3b62dba6a40e593a1404ba2fe2b416a4ac14))
- **ios:** Use proper native events for cordova events ([#4720](https://github.com/ionic-team/capacitor/issues/4720)) ([99c21dc](https://github.com/ionic-team/capacitor/commit/99c21dcf98f1418d992e845492c730160611783a))

## [3.0.1](https://github.com/ionic-team/capacitor/compare/3.0.0...3.0.1) (2021-06-09)

### Bug Fixes

- **android:** Avoid crash on input file ([#4707](https://github.com/ionic-team/capacitor/issues/4707)) ([883c0fe](https://github.com/ionic-team/capacitor/commit/883c0fe4a8a33d2e14894d9b307f4d7ce6d13bad))
- **android:** Make proxy handle user info in server url ([#4699](https://github.com/ionic-team/capacitor/issues/4699)) ([baeed45](https://github.com/ionic-team/capacitor/commit/baeed45038134d446aef7747e5ad5ce4ac07c438))
- **android:** Reset bridge on onPageStarted only ([#4634](https://github.com/ionic-team/capacitor/issues/4634)) ([96e4830](https://github.com/ionic-team/capacitor/commit/96e483046c9128dbcaec21efb0f5d619c6b1185f))
- **cli:** add priority to framework detection ([#4617](https://github.com/ionic-team/capacitor/issues/4617)) ([6a22f03](https://github.com/ionic-team/capacitor/commit/6a22f0375921fc7c015bc72e036dee014b1baed9))
- **cli:** Better native-run error ([#4676](https://github.com/ionic-team/capacitor/issues/4676)) ([39eebd0](https://github.com/ionic-team/capacitor/commit/39eebd0a2dc45fd5d07f79fb9ad5b919556c5fc5))
- **cli:** Don't prompt cordova preferences if non interactive ([#4680](https://github.com/ionic-team/capacitor/issues/4680)) ([293527c](https://github.com/ionic-team/capacitor/commit/293527c85296a9b79ce6dbd12e0f3e3e43fbce0b))
- **cli:** Remove v3 prefix from docs urls ([#4596](https://github.com/ionic-team/capacitor/issues/4596)) ([f99f11a](https://github.com/ionic-team/capacitor/commit/f99f11a6ee65020a8b2e58665e3427de814fba3a))
- **cli:** Throw error if native-run didn't find targets ([#4681](https://github.com/ionic-team/capacitor/issues/4681)) ([bfbf2b5](https://github.com/ionic-team/capacitor/commit/bfbf2b5ffb48bf1617404385f7407baefcfe3282))
- Make isPluginAvailable available on bridge ([#4589](https://github.com/ionic-team/capacitor/issues/4589)) ([151e7a8](https://github.com/ionic-team/capacitor/commit/151e7a899d9646dbd5625a2539fd3f2297349bc5))

# [3.0.0](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.4...3.0.0) (2021-05-18)

### Bug Fixes

- **cli:** create-react-app framework detection should not look for react-dev-utils ([#4585](https://github.com/ionic-team/capacitor/issues/4585)) ([9f7910e](https://github.com/ionic-team/capacitor/commit/9f7910ee39ea7721d01428ec65b3d101b8ba963e))

# [3.0.0-rc.4](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.3...3.0.0-rc.4) (2021-05-18)

### Features

- **cli:** auto detect framework's webDir ([#4550](https://github.com/ionic-team/capacitor/issues/4550)) ([329448a](https://github.com/ionic-team/capacitor/commit/329448a26846b5167b16f9169d62a9ff61eef87d))

# [3.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.2...3.0.0-rc.3) (2021-05-11)

**Note:** Version bump only for package capacitor

# [3.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.1...3.0.0-rc.2) (2021-05-07)

### Bug Fixes

- **bridge:** Fix type errors with new Platforms API ([#4524](https://github.com/ionic-team/capacitor/issues/4524)) ([7bbaea8](https://github.com/ionic-team/capacitor/commit/7bbaea85494c53a950abab40bb77f37087e22abe))
- **bridge:** Safely JSON.Stringify circular json on log ([#4507](https://github.com/ionic-team/capacitor/issues/4507)) ([e4c8fe4](https://github.com/ionic-team/capacitor/commit/e4c8fe41ec3992df5c20e4d0d3b69240ce672e44)), closes [#4506](https://github.com/ionic-team/capacitor/issues/4506)
- **ios:** Don't auto release saved calls ([#4535](https://github.com/ionic-team/capacitor/issues/4535)) ([4f76933](https://github.com/ionic-team/capacitor/commit/4f76933b98d0461564d3dca9b36d4ea1eba8ed49))

### Features

- **core:** platforms api ([#4255](https://github.com/ionic-team/capacitor/issues/4255)) ([7d62713](https://github.com/ionic-team/capacitor/commit/7d6271369cb15eeab07c0bc7f606de6447a17cd4))

# [3.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.0...3.0.0-rc.1) (2021-04-29)

### Bug Fixes

- generate Capacitor.Plugins object ([#4496](https://github.com/ionic-team/capacitor/issues/4496)) ([1c71b7a](https://github.com/ionic-team/capacitor/commit/1c71b7adb2c325e34d980dbf578dc22afb2c332b))
- **android:** Release the call after reject/resolve ([#4318](https://github.com/ionic-team/capacitor/issues/4318)) ([a9f30a8](https://github.com/ionic-team/capacitor/commit/a9f30a88bf3cf239a59c4e901e2a9a2a141a9044))
- **android:** resolve issue with activity result API registration for fragments ([#4402](https://github.com/ionic-team/capacitor/issues/4402)) ([ac6c6bc](https://github.com/ionic-team/capacitor/commit/ac6c6bc031e0c8236004dfb9e1b04f1f849c1519))
- **cli:** Allow prereleases on node version check ([#4469](https://github.com/ionic-team/capacitor/issues/4469)) ([dd26a98](https://github.com/ionic-team/capacitor/commit/dd26a98bde9c4487178bc4ee45587f86ec53df2a))
- **cli:** filter targets without id from run device list ([#4397](https://github.com/ionic-team/capacitor/issues/4397)) ([9ec444f](https://github.com/ionic-team/capacitor/commit/9ec444f034d435c7c945e9a20e3ca99a3b1f54d6))
- **cordova:** use proper targetSdkVersion ([#4498](https://github.com/ionic-team/capacitor/issues/4498)) ([7d48be8](https://github.com/ionic-team/capacitor/commit/7d48be8ce77e1f19e5bb267abdc61eb98b4d0f3c))
- **core:** Call native implementation before web implementation ([#4493](https://github.com/ionic-team/capacitor/issues/4493)) ([febd606](https://github.com/ionic-team/capacitor/commit/febd60617ab60a3b34132f68f212e9a867d1b434))
- **core:** Use web listener if there is no native implementation ([#4488](https://github.com/ionic-team/capacitor/issues/4488)) ([196d843](https://github.com/ionic-team/capacitor/commit/196d843a3c9442c5dc6cf61bfe3494fa399dec4f))
- **ios:** cordova-plugin-screen-orientation compatibility ([#4367](https://github.com/ionic-team/capacitor/issues/4367)) ([b893a57](https://github.com/ionic-team/capacitor/commit/b893a57aaaf3a16e13db9c33037a12f1a5ac92e0))
- **ios:** fire resume/pause events if no cordova plugins installed ([#4467](https://github.com/ionic-team/capacitor/issues/4467)) ([0105f7a](https://github.com/ionic-team/capacitor/commit/0105f7a2c68f2e7bec16ca23384b6acbb2f3057b))
- **ios:** put cancel button of confirm/prompt on the left ([#4464](https://github.com/ionic-team/capacitor/issues/4464)) ([e5b53aa](https://github.com/ionic-team/capacitor/commit/e5b53aa687a70938994802c7b1367cfcbb1e3811))

### Features

- Unify logging behavior across environments ([#4416](https://github.com/ionic-team/capacitor/issues/4416)) ([bae0f3d](https://github.com/ionic-team/capacitor/commit/bae0f3d2cee84978636d0f589bc7e2f745671baf))
- **android:** ability to add listeners to the Capacitor WebView ([#4405](https://github.com/ionic-team/capacitor/issues/4405)) ([7bdcc15](https://github.com/ionic-team/capacitor/commit/7bdcc15a20248fc17b5867b215bba0c43e29b2c0))
- **cli:** Add signup prompt on first init ([#4440](https://github.com/ionic-team/capacitor/issues/4440)) ([b3faa97](https://github.com/ionic-team/capacitor/commit/b3faa97d9b0ee542a8d90f433545f7e83402c485))
- **iOS:** Include native-bridge.js as a resource in both Cocoapods and direct build ([#4505](https://github.com/ionic-team/capacitor/issues/4505)) ([c16ccc0](https://github.com/ionic-team/capacitor/commit/c16ccc0118aec57dc23649894bc3bcd83827f89f))

# [3.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.6...3.0.0-rc.0) (2021-03-10)

### Bug Fixes

- **android:** calls re-saved during permission/activity result callbacks were being released ([502a2d1](https://github.com/ionic-team/capacitor/commit/502a2d18ddce870f4caf810b405f7363f2340067))
- **android:** live reload not working when using adb reverse ([362f221](https://github.com/ionic-team/capacitor/commit/362f2219767a5f28e3ce1f6857a0e20024adc6b6))
- **cli:** Make tests work on npm 7 ([#4297](https://github.com/ionic-team/capacitor/issues/4297)) ([676c907](https://github.com/ionic-team/capacitor/commit/676c907c7ce84fdc57d00152024144a74d24b137))

### Features

- **android:** add configurable app path for embedded capacitor ([#4264](https://github.com/ionic-team/capacitor/issues/4264)) ([e433691](https://github.com/ionic-team/capacitor/commit/e43369144f7f378edc4f5d4f8dbbafe6cff6a70d))
- **android:** Unifying saving plugin calls ([#4254](https://github.com/ionic-team/capacitor/issues/4254)) ([a648c51](https://github.com/ionic-team/capacitor/commit/a648c51588627404b5ad30c35943fed18af4a546))
- **iOS:** Obj-C convenience accessors on CAPPluginCall ([#4309](https://github.com/ionic-team/capacitor/issues/4309)) ([e3657d7](https://github.com/ionic-team/capacitor/commit/e3657d77647187946ffcd4c4791f4a47c768db7f))
- **iOS:** Unifying saving plugin calls ([#4253](https://github.com/ionic-team/capacitor/issues/4253)) ([de71da5](https://github.com/ionic-team/capacitor/commit/de71da52b80ff52d0234a5301fc6cae675640a33))

# [3.0.0-beta.6](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.5...3.0.0-beta.6) (2021-02-27)

**Note:** Version bump only for package capacitor

# [3.0.0-beta.5](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.4...3.0.0-beta.5) (2021-02-27)

**Note:** Version bump only for package capacitor

# [3.0.0-beta.4](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.3...3.0.0-beta.4) (2021-02-26)

### Bug Fixes

- **cli:** init failure if config.xml is present ([#4227](https://github.com/ionic-team/capacitor/issues/4227)) ([f1703dc](https://github.com/ionic-team/capacitor/commit/f1703dcb3ebaa83df9f2b72ca00eb6721e96dfd9))

# [3.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.2...3.0.0-beta.3) (2021-02-18)

### Bug Fixes

- **cli:** do not error if webDir is missing when adding platforms ([#4215](https://github.com/ionic-team/capacitor/issues/4215)) ([4583add](https://github.com/ionic-team/capacitor/commit/4583add61f5f7ac60de8722664811d96d4095459))
- **core:** do not add window.cordova on web apps ([#4214](https://github.com/ionic-team/capacitor/issues/4214)) ([6d673ef](https://github.com/ionic-team/capacitor/commit/6d673ef7076f00c37eac0f801c4c487415df6d4d))

### Features

- **cli:** do not require webDir when server.url is set ([#4200](https://github.com/ionic-team/capacitor/issues/4200)) ([91ddfbd](https://github.com/ionic-team/capacitor/commit/91ddfbd3cd1f598906b2ddc5cab8904420f231f6))
- **iOS:** Add automatic Date serialization to bridge communication ([#4177](https://github.com/ionic-team/capacitor/issues/4177)) ([3dabc69](https://github.com/ionic-team/capacitor/commit/3dabc69eab1c8ce0b7734acb641b67d349ec3093))

# [3.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.1...3.0.0-beta.2) (2021-02-08)

### Bug Fixes

- **core:** handle js.error messages to fix window error handler ([#4124](https://github.com/ionic-team/capacitor/issues/4124)) ([c0deb1d](https://github.com/ionic-team/capacitor/commit/c0deb1de349f5631af08eecbffc0ea4dea97c60d))
- address bug in `isPluginAvailable()` for web and native ([#4114](https://github.com/ionic-team/capacitor/issues/4114)) ([2fbd954](https://github.com/ionic-team/capacitor/commit/2fbd95465a321b8f4c50d4daf22a63d8043cee9b))
- **android:** get PermissionState enum by state value ([#4100](https://github.com/ionic-team/capacitor/issues/4100)) ([194ae86](https://github.com/ionic-team/capacitor/commit/194ae8699944bf016132fb64fe48010679a6d64e))
- **android:** requestPermission call rejects if permission missing in manifest ([55ef5ff](https://github.com/ionic-team/capacitor/commit/55ef5ff38e87729412c44bfa4b2f29e53044cecc))
- **core:** fix another $$typeof issue ([#4113](https://github.com/ionic-team/capacitor/issues/4113)) ([4cbae41](https://github.com/ionic-team/capacitor/commit/4cbae41908670ab843bea5850da7a2cf1082afdb))
- **iOS:** preserve null values in bridged types ([#4072](https://github.com/ionic-team/capacitor/issues/4072)) ([6dc691e](https://github.com/ionic-team/capacitor/commit/6dc691e66a07a421d5d4b08028ea05a65b3ddd84))
- remove USE_PUSH flag and code from iOS template ([#4070](https://github.com/ionic-team/capacitor/issues/4070)) ([6d54243](https://github.com/ionic-team/capacitor/commit/6d54243108883e0b07d725dcc7a1cb8700f1b35e))

### Features

- **android:** activity result use new API and update permission result callbacks to match ([#4127](https://github.com/ionic-team/capacitor/issues/4127)) ([002f1e5](https://github.com/ionic-team/capacitor/commit/002f1e55173a50b9fe918b4eda73b5113b713282))
- **android:** androidxActivityVersion & androidxFragmentVersion gradle variables ([#4103](https://github.com/ionic-team/capacitor/issues/4103)) ([4f77b96](https://github.com/ionic-team/capacitor/commit/4f77b962be85fc6bfc555a106c5b3e6707526626))
- **cli:** configurable iOS build scheme ([#4073](https://github.com/ionic-team/capacitor/issues/4073)) ([e6374dc](https://github.com/ionic-team/capacitor/commit/e6374dc88c388a30186e8bfea22ce129ca1a9e02))
- **cli:** send config, rootDir, and webDir to custom platform hooks ([#4084](https://github.com/ionic-team/capacitor/issues/4084)) ([13e9860](https://github.com/ionic-team/capacitor/commit/13e9860468126ba3c37b25d9093ab5f6cce2df2c))

# [3.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.0...3.0.0-beta.1) (2021-01-14)

**Note:** Version bump only for package capacitor

# [3.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.14...3.0.0-beta.0) (2021-01-13)

### Features

- **core:** add commonjs output format ([#4064](https://github.com/ionic-team/capacitor/issues/4064)) ([74b7be8](https://github.com/ionic-team/capacitor/commit/74b7be89ef1bbf13ccd103410037cfe81c8fc124))

# [3.0.0-alpha.14](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.13...3.0.0-alpha.14) (2021-01-13)

### Bug Fixes

- **android:** append missing new lines on injected cordova files ([#4058](https://github.com/ionic-team/capacitor/issues/4058)) ([dbdc78d](https://github.com/ionic-team/capacitor/commit/dbdc78dc08e016dfbc2454d4f53a49f16f744b3e))
- **cli:** bump minimum node version to 12.4.0 ([#4059](https://github.com/ionic-team/capacitor/issues/4059)) ([61e3be0](https://github.com/ionic-team/capacitor/commit/61e3be0c865a3591a0d6bcfc27d0bbb72ee98395))
- **cli:** default to new directory instead of crashing ([70fdf0b](https://github.com/ionic-team/capacitor/commit/70fdf0be0e0f06b4f20e20a3ae4bfef4de2374e9))

### Features

- **android:** method to check permission for an alias ([#4062](https://github.com/ionic-team/capacitor/issues/4062)) ([c88c4b4](https://github.com/ionic-team/capacitor/commit/c88c4b46b949a87c1b89476b75273adef725242b))

# [3.0.0-alpha.13](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.12...3.0.0-alpha.13) (2021-01-13)

### Bug Fixes

- **cli:** use stderr for logs when using --json option ([#4044](https://github.com/ionic-team/capacitor/issues/4044)) ([452a101](https://github.com/ionic-team/capacitor/commit/452a101648fe6da4232d18985c5d814920505920))
- **iOS:** properly handle date types during JSValue coercion ([#4043](https://github.com/ionic-team/capacitor/issues/4043)) ([1affae7](https://github.com/ionic-team/capacitor/commit/1affae7cf8d2f49681bf25be48633ab985bbd12f))
- **iOS:** skip Swift type coercion on Cordova plugin calls ([#4048](https://github.com/ionic-team/capacitor/issues/4048)) ([7bb9e0f](https://github.com/ionic-team/capacitor/commit/7bb9e0f22fdea369a6522c2d63a5b56baab9f5ca))

### Features

- **cli:** create TS configuration files in `init` ([#3999](https://github.com/ionic-team/capacitor/issues/3999)) ([fa7003e](https://github.com/ionic-team/capacitor/commit/fa7003e4ef1d988633abb85b1b109c51b94fda42))

# [3.0.0-alpha.12](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.11...3.0.0-alpha.12) (2021-01-08)

### Bug Fixes

- move `public` into iOS target directory ([#4002](https://github.com/ionic-team/capacitor/issues/4002)) ([4f41296](https://github.com/ionic-team/capacitor/commit/4f41296a109cf73fdf8e695849e95f292a543f85))
- **cli:** run an actual debug build for iOS ([#4014](https://github.com/ionic-team/capacitor/issues/4014)) ([dc6399c](https://github.com/ionic-team/capacitor/commit/dc6399cf0b5eb6afb50274a84dc71486cd3e4173))
- **core:** fix $$typeof() not implemented error ([#4013](https://github.com/ionic-team/capacitor/issues/4013)) ([c7f80b5](https://github.com/ionic-team/capacitor/commit/c7f80b577c1de60cd0a105f3aaf0d1c314f3150d))

### Features

- **android:** switch to new callback-style permission requests ([#4033](https://github.com/ionic-team/capacitor/issues/4033)) ([cc459de](https://github.com/ionic-team/capacitor/commit/cc459de7fc070c0227e066f3e8b92062728ab45d))
- **cli:** allow 'export default' style TS config files ([#4031](https://github.com/ionic-team/capacitor/issues/4031)) ([9393667](https://github.com/ionic-team/capacitor/commit/9393667bbe629d6c18a22b16fe3f3c6fe83e11f6))
- **cli:** opt-in anonymous usage data ([#4022](https://github.com/ionic-team/capacitor/issues/4022)) ([3facfb7](https://github.com/ionic-team/capacitor/commit/3facfb790bff79b00ba1ab6dd8cb331989937da7))

# [3.0.0-alpha.11](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.10...3.0.0-alpha.11) (2020-12-26)

### Features

- **android:** expose CapConfig.loadDefault(), deprecate v2 constructor ([#3964](https://github.com/ionic-team/capacitor/issues/3964)) ([94ae977](https://github.com/ionic-team/capacitor/commit/94ae9774d2467fa7ba0336e7183f6d28cae45908))
- **iOS:** Open CAPBridgeViewController for subclassing ([#3973](https://github.com/ionic-team/capacitor/issues/3973)) ([a601705](https://github.com/ionic-team/capacitor/commit/a601705f8116ac10d1a0b5942511952c07cf474e))

# [3.0.0-alpha.10](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.9...3.0.0-alpha.10) (2020-12-15)

### Bug Fixes

- **android:** include lint.xml for downstream lint tasks ([efa72f3](https://github.com/ionic-team/capacitor/commit/efa72f38c5f64d3b91cc4c4c7d4d87ab38219893))

# [3.0.0-alpha.9](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.8...3.0.0-alpha.9) (2020-12-15)

### Bug Fixes

- **android:** include lint-baseline.xml for downstream lint tasks ([20ccaa0](https://github.com/ionic-team/capacitor/commit/20ccaa0311dcf8468019325ad976156d92ed0202))

# [3.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.7...3.0.0-alpha.8) (2020-12-15)

### Bug Fixes

- **Android:** Use plugin's getPermissionStates() to support overriding ([#3939](https://github.com/ionic-team/capacitor/issues/3939)) ([855a607](https://github.com/ionic-team/capacitor/commit/855a60711bcf6cff3215a36fac7e5314a2c4d159))
- **ios:** expose lastURL getter ([#3898](https://github.com/ionic-team/capacitor/issues/3898)) ([90b7fe3](https://github.com/ionic-team/capacitor/commit/90b7fe39f5a7cb9d584618a6fba66338f2bbf5fe))

### Features

- **android:** add onConfigurationChanged() activity lifecycle hook ([#3936](https://github.com/ionic-team/capacitor/issues/3936)) ([29e9e2c](https://github.com/ionic-team/capacitor/commit/29e9e2c5c30f23eb3ea2e88b1427eed0636e8125))
- **android:** Add WebColor utility for parsing color ([#3947](https://github.com/ionic-team/capacitor/issues/3947)) ([3746404](https://github.com/ionic-team/capacitor/commit/3746404240459ca9ea8175f2bb241d80746e8328))
- **Android:** Refactoring configuration ([#3778](https://github.com/ionic-team/capacitor/issues/3778)) ([9820a30](https://github.com/ionic-team/capacitor/commit/9820a30688f0a774eced1676f1927cacde53301f))

# [3.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.6...3.0.0-alpha.7) (2020-12-02)

### Bug Fixes

- **android:** dont release calls that are manually saved, eg listeners/watchers ([#3857](https://github.com/ionic-team/capacitor/issues/3857)) ([f1c8fe9](https://github.com/ionic-team/capacitor/commit/f1c8fe9e039d25eff2122fe915f17e84477427eb))
- **android:** fixed breaking change to `handleOnActivityResult` ([#3888](https://github.com/ionic-team/capacitor/issues/3888)) ([5fd60e6](https://github.com/ionic-team/capacitor/commit/5fd60e607b79b46cec08c6af1674305b1199d0a4))
- **android:** resolve undefined for both checkPermissions and requestPermissions by default ([#3855](https://github.com/ionic-team/capacitor/issues/3855)) ([383f62b](https://github.com/ionic-team/capacitor/commit/383f62b2b6531c579aac469e29b7c1c0c1f7540f))
- **cli:** Properly detect cocoapods on multiple platforms ([#3810](https://github.com/ionic-team/capacitor/issues/3810)) ([8753694](https://github.com/ionic-team/capacitor/commit/8753694b12033feb01c82bd5985dce2584bae80c))
- **cli:** run sync instead of copy during run ([#3816](https://github.com/ionic-team/capacitor/issues/3816)) ([ff45340](https://github.com/ionic-team/capacitor/commit/ff4534064c7f47331721d086889a42a97cf30945))
- **cli:** use correct path for native-run ([02cf1ba](https://github.com/ionic-team/capacitor/commit/02cf1ba4b7d1c419551b6494f08cb90553fd93be))
- **core:** export PermissionState ([#3775](https://github.com/ionic-team/capacitor/issues/3775)) ([2d5ac96](https://github.com/ionic-team/capacitor/commit/2d5ac963d131a704628f8a421be8429b9f63cf61))
- **ios:** share message handler between webview and bridge ([#3875](https://github.com/ionic-team/capacitor/issues/3875)) ([f7dff2e](https://github.com/ionic-team/capacitor/commit/f7dff2e661a54bee770940ee1ebd9eab6456ba2e))

### Features

- automatically import Android plugins ([#3788](https://github.com/ionic-team/capacitor/issues/3788)) ([aa1e1c6](https://github.com/ionic-team/capacitor/commit/aa1e1c604e260cc8babb0e7f5230f692bdcf6f09))
- **android:** Add handlePermissions function for plugins to call ([#3768](https://github.com/ionic-team/capacitor/issues/3768)) ([3a7e282](https://github.com/ionic-team/capacitor/commit/3a7e282a7515784dd343bbf1e3d52e0299bac887))
- **android:** modified plugin annotation format for multi-permissions and empty (auto-grant) ([#3822](https://github.com/ionic-team/capacitor/issues/3822)) ([1b5a3bd](https://github.com/ionic-team/capacitor/commit/1b5a3bdeb1b35612cf04e58bdf2fca68a0832a14))
- **cli:** add --no-sync option to run ([#3819](https://github.com/ionic-team/capacitor/issues/3819)) ([8def829](https://github.com/ionic-team/capacitor/commit/8def8290bb182436204380fc711d84fa36c17004))
- **cli:** add config command ([#3817](https://github.com/ionic-team/capacitor/issues/3817)) ([d3d7f89](https://github.com/ionic-team/capacitor/commit/d3d7f893179a170017a36dd76e9ed7bd374a22b3))
- **cli:** Add configurable pod path ([#3811](https://github.com/ionic-team/capacitor/issues/3811)) ([88f9187](https://github.com/ionic-team/capacitor/commit/88f9187f41f95ef62f6bf854c63f0b1c91dbc2f7))
- **cli:** extendable plugin configuration types ([#3858](https://github.com/ionic-team/capacitor/issues/3858)) ([f789526](https://github.com/ionic-team/capacitor/commit/f789526e42283c2a166ff32a2b16b70e65b94ba4))
- **cli:** locate plugins by allowlist ([#3762](https://github.com/ionic-team/capacitor/issues/3762)) ([81963b6](https://github.com/ionic-team/capacitor/commit/81963b615ccbdc8993d0befbefe87173db4ba108))
- **cli:** STUDIO_PATH environment variable ([#3755](https://github.com/ionic-team/capacitor/issues/3755)) ([65cef53](https://github.com/ionic-team/capacitor/commit/65cef53277444c173ff928dc4ef196f0dae4c8a7))
- **cli:** support TS/JS config files ([#3756](https://github.com/ionic-team/capacitor/issues/3756)) ([a52775f](https://github.com/ionic-team/capacitor/commit/a52775fb635a5cbcccf2dcaa955ad12804ad5986))
- **ios:** add local and remote notification router ([#3796](https://github.com/ionic-team/capacitor/issues/3796)) ([f3edaf9](https://github.com/ionic-team/capacitor/commit/f3edaf93d4328ea3ee90df573bf14ef0efc7553b))
- **ios:** add path utilities to bridge ([#3842](https://github.com/ionic-team/capacitor/issues/3842)) ([c31eb35](https://github.com/ionic-team/capacitor/commit/c31eb35f83a33626a9d88731c0fff18966c71b0b))
- **iOS:** Add base implementation of permissions calls ([#3856](https://github.com/ionic-team/capacitor/issues/3856)) ([d733236](https://github.com/ionic-team/capacitor/commit/d7332364212794a5005229defd05c129921d9c5d))
- **iOS:** Refactoring configuration ([#3759](https://github.com/ionic-team/capacitor/issues/3759)) ([e2e64c2](https://github.com/ionic-team/capacitor/commit/e2e64c23b88d93a1c594df51dddd0c55d5f37770))

# [3.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.5...3.0.0-alpha.6) (2020-10-30)

### Bug Fixes

- **android:** avoid crash on input file capture ([#3715](https://github.com/ionic-team/capacitor/issues/3715)) ([f502a99](https://github.com/ionic-team/capacitor/commit/f502a9964e28012980d636014043e86e918031d7))

### Features

- improve permissions ([eec61a6](https://github.com/ionic-team/capacitor/commit/eec61a6d8d8edfe94aea1a361787d1e6c736e20d))
- unified errors and error codes ([#3673](https://github.com/ionic-team/capacitor/issues/3673)) ([f9e0803](https://github.com/ionic-team/capacitor/commit/f9e08038aa88f7453e8235f380d2767a12a7a073))
- **cli:** add `capacitor run` command ([#3599](https://github.com/ionic-team/capacitor/issues/3599)) ([8576b0f](https://github.com/ionic-team/capacitor/commit/8576b0ff6a048981a07cab91135a0071b724e043))

# [3.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.4...3.0.0-alpha.5) (2020-10-06)

**Note:** Version bump only

# [3.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.3...3.0.0-alpha.4) (2020-09-23)

### Features

- **cli:** ability to specify custom platform directories ([#3565](https://github.com/ionic-team/capacitor/issues/3565)) ([c6eda55](https://github.com/ionic-team/capacitor/commit/c6eda55482ef56abdfe9a33444e828b771af9386))

# [3.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.2...3.0.0-alpha.3) (2020-09-15)

### Bug Fixes

- **android:** allow directories beginning with underscore in assets dir to be packaged ([c23d993](https://github.com/ionic-team/capacitor/commit/c23d99315acea2f0894e5ff8a08dd42a867b2982))

# [3.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.1...3.0.0-alpha.2) (2020-08-31)

### Features

- Add extension for creating data from data url ([#3474](https://github.com/ionic-team/capacitor/issues/3474)) ([2909fd0](https://github.com/ionic-team/capacitor/commit/2909fd0ac0d9fdb2cdb7fd25e38742451aa05fb1))

# [3.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.0...3.0.0-alpha.1) (2020-08-21)

### Bug Fixes

- **cli:** update plugin template to compile using java 8 ([#3350](https://github.com/ionic-team/capacitor/issues/3350)) ([676917e](https://github.com/ionic-team/capacitor/commit/676917eb81580ea5327d496bd80986e68df6ad04))
- **core:** provide mock implementation for unimplemented platforms ([#3352](https://github.com/ionic-team/capacitor/issues/3352)) ([befe230](https://github.com/ionic-team/capacitor/commit/befe2300435dbd54b22882fb6586c722f5ef466d))
- **core:** use more explicit result for Browser plugin events ([#3349](https://github.com/ionic-team/capacitor/issues/3349)) ([75f99d4](https://github.com/ionic-team/capacitor/commit/75f99d4de62a6afb2da0ff876ed3b0d351040184))
- **core:** use own type for backButton event result ([#3348](https://github.com/ionic-team/capacitor/issues/3348)) ([05d0e45](https://github.com/ionic-team/capacitor/commit/05d0e457eb69d5d39c8bb1d0117bc3d31afdca93))
- **ios:** config bug from swiftlint refactor ([ace879f](https://github.com/ionic-team/capacitor/commit/ace879f42b19aa064efa80142c3783f736745344))

### Features

- **cli:** add fmt script to plugin template ([#3354](https://github.com/ionic-team/capacitor/issues/3354)) ([9ca1e72](https://github.com/ionic-team/capacitor/commit/9ca1e723334f5d21706a8586c11d73162b47a13a))
- **core:** add unsupported browser exception ([#3389](https://github.com/ionic-team/capacitor/issues/3389)) ([c51e8f8](https://github.com/ionic-team/capacitor/commit/c51e8f8960c795421b35ad1fdd1cd6afbd7a7dfc))

# [3.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/2.4.6...3.0.0-alpha.0) (2020-07-23)

### Features

- **android:** add custom plugins to BridgeFragment ([#3280](https://github.com/ionic-team/capacitor/issues/3280)) ([d131a5f](https://github.com/ionic-team/capacitor/commit/d131a5fed2b9ae29b6952397ec2f81104545b749))
- **core:** add `registerPlugin` for importing from plugin packages ([#3305](https://github.com/ionic-team/capacitor/issues/3305)) ([95475cc](https://github.com/ionic-team/capacitor/commit/95475cceb4cbd5be2cc7e18f2cf3045eb6c6f7fd))

### Chores

- refactor(android): remove unused interaction listener on BridgeFragment (#3552) ([fae50b6](https://github.com/ionic-team/capacitor/commit/fae50b6)), closes [#3552](https://github.com/ionic-team/capacitor/issues/3552)

## [2.4.6](https://github.com/ionic-team/capacitor/compare/2.4.5...2.4.6) (2021-01-13)

### Bug Fixes

- fix(ios): correctly initialize cordova plugins with webViewEngine (#4039) ([273fab5](https://github.com/ionic-team/capacitor/commit/273fab5)), closes [#4039](https://github.com/ionic-team/capacitor/issues/4039)

## [2.4.5](https://github.com/ionic-team/capacitor/compare/2.4.4...2.4.5) (2020-12-14)

### Bug Fixes

- fix(ios): avoid crash on portrait apps after taking a photo (#3926) ([f182868](https://github.com/ionic-team/capacitor/commit/f182868)), closes [#3926](https://github.com/ionic-team/capacitor/issues/3926)

## [2.4.4](https://github.com/ionic-team/capacitor/compare/2.4.3...2.4.4) (2020-12-01)

### Bug Fixes

- fix: wildcard in allowNavigation (#3833) ([de1eac8](https://github.com/ionic-team/capacitor/commit/de1eac8)), closes [#3833](https://github.com/ionic-team/capacitor/issues/3833)
- fix(android): load local assets when using wildcard on allowNavigation (#3834) ([66f2efb](https://github.com/ionic-team/capacitor/commit/66f2efb)), closes [#3834](https://github.com/ionic-team/capacitor/issues/3834)
- fix(cli): replace AndroidManifest.xml Cordova variables with default value (#3863) ([9965d58](https://github.com/ionic-team/capacitor/commit/9965d58)), closes [#3863](https://github.com/ionic-team/capacitor/issues/3863)

## [2.4.3](https://github.com/ionic-team/capacitor/compare/2.4.2...2.4.3) (2020-11-18)

### Bug Fixes

- fix(ios): Don't get location if permission is not determined (#3802) ([4fb9d348](https://github.com/ionic-team/capacitor/commit/4fb9d348)), closes [#3789](https://github.com/ionic-team/capacitor/issues/3789)
- fix(Filesystem): avoid directory already exists on append (#3629) ([249073d6](https://github.com/ionic-team/capacitor/commit/249073d6)), closes [#3620](https://github.com/ionic-team/capacitor/issues/3620)
- fix(android): Avoid SecurityError on Android 10 file share (#3655) ([1c47e15f](https://github.com/ionic-team/capacitor/commit/1c47e15f)), closes [#3638](https://github.com/ionic-team/capacitor/issues/3638)

## [2.4.2](https://github.com/ionic-team/capacitor/compare/2.4.1...2.4.2) (2020-09-24)

### Bug Fixes

- fix(android): BridgeFragment NullPointerException (#3553) ([5133e2e](https://github.com/ionic-team/capacitor/commit/5133e2e)), closes [#3553](https://github.com/ionic-team/capacitor/issues/3553)
- fix(android): move splash screen trigger before the webview render to prevent flicker (2.x) (#3608) ([cbab54c](https://github.com/ionic-team/capacitor/commit/cbab54c)), closes [#3608](https://github.com/ionic-team/capacitor/issues/3608)
- fix(cli): halt update upon failure (#3595) ([ec086b0](https://github.com/ionic-team/capacitor/commit/ec086b0)), closes [#3595](https://github.com/ionic-team/capacitor/issues/3595)
- fix(ios): iterate listeners to avoid mutated while being enumerated (#3572) ([fbaab54](https://github.com/ionic-team/capacitor/commit/fbaab54)), closes [#3572](https://github.com/ionic-team/capacitor/issues/3572)

### Chores

- refactor(android): remove unused interaction listener on BridgeFragment (#3552) ([fae50b6](https://github.com/ionic-team/capacitor/commit/fae50b6)), closes [#3552](https://github.com/ionic-team/capacitor/issues/3552)

## [2.4.1](https://github.com/ionic-team/capacitor/compare/2.4.0...2.4.1) (2020-09-09)

### Bug Fixes

- fix(cli): replace SDK variables with default values on Cordova plugins (#3525) ([090427a](https://github.com/ionic-team/capacitor/commit/090427a)), closes [#3525](https://github.com/ionic-team/capacitor/issues/3525)
- fix(cordova): add CDVPlugin+Resources category for better plugin support (#3380) ([8d89b91](https://github.com/ionic-team/capacitor/commit/8d89b91)), closes [#3380](https://github.com/ionic-team/capacitor/issues/3380)

### Chores

- chore(cli): remove cordova-plugin-googlemaps from skip list (#3436) ([cfb74af](https://github.com/ionic-team/capacitor/commit/cfb74af)), closes [#3436](https://github.com/ionic-team/capacitor/issues/3436)

## [2.4.0](https://github.com/ionic-team/capacitor/compare/2.3.0...2.4.0) (2020-07-27)

### Bug Fixes

- fix(android): don't return 404 on empty files (#3323) ([cfbd1e3](https://github.com/ionic-team/capacitor/commit/cfbd1e3)), closes [#3323](https://github.com/ionic-team/capacitor/issues/3323)
- fix(android): fix LocalNotification `on` functionality (#3307) ([15af432](https://github.com/ionic-team/capacitor/commit/15af432)), closes [#3307](https://github.com/ionic-team/capacitor/issues/3307)
- fix(android): Provide a file name when an image is saved to the gallery to prevent crash (#3331) ([a7b9320](https://github.com/ionic-team/capacitor/commit/a7b9320)), closes [#3331](https://github.com/ionic-team/capacitor/issues/3331)
- fix(cli): avoid npm gitignore rename on new plugins (#3292) ([2c9b5e1](https://github.com/ionic-team/capacitor/commit/2c9b5e1)), closes [#3292](https://github.com/ionic-team/capacitor/issues/3292)
- fix(ios): only open a URL when the application is active (#3328) ([8d7c58b](https://github.com/ionic-team/capacitor/commit/8d7c58b)), closes [#3328](https://github.com/ionic-team/capacitor/issues/3328)

### Features

- feat(camera): add `preserveAspectRatio` resizing option (#3309) ([27a8bcb](https://github.com/ionic-team/capacitor/commit/27a8bcb)), closes [#3309](https://github.com/ionic-team/capacitor/issues/3309)

### Chores

- chore: bump peerDependencies for 2.4.0 (#3342) ([2ff7bc4](https://github.com/ionic-team/capacitor/commit/2ff7bc4)), closes [#3342](https://github.com/ionic-team/capacitor/issues/3342)
- chore: make deploy script push to 2.x branch (#3337) ([d0d30d6](https://github.com/ionic-team/capacitor/commit/d0d30d6)), closes [#3337](https://github.com/ionic-team/capacitor/issues/3337)
- chore(ci): hook up workflows for 2.x ([89f8ae8](https://github.com/ionic-team/capacitor/commit/89f8ae8))
- chore(readme): add contributors manually ([519ead8](https://github.com/ionic-team/capacitor/commit/519ead8))

## [2.3.0](https://github.com/ionic-team/capacitor/compare/2.2.1...2.3.0) (2020-07-16)

### Bug Fixes

- fix(android): restore local notifications after device reboot (#3027) ([2a39a7d](https://github.com/ionic-team/capacitor/commit/2a39a7d)), closes [#3027](https://github.com/ionic-team/capacitor/issues/3027)
- fix(android): Splash.show not resolving if splash is visible (#3262) ([bfd9884](https://github.com/ionic-team/capacitor/commit/bfd9884)), closes [#3262](https://github.com/ionic-team/capacitor/issues/3262)
- fix(android): use notification sound for notifications, not alarm (#2743) ([b2d50f9](https://github.com/ionic-team/capacitor/commit/b2d50f9)), closes [#2743](https://github.com/ionic-team/capacitor/issues/2743)
- fix(cli): Avoid duplicate usesCleartextTraffic attribute (#3245) ([861874f](https://github.com/ionic-team/capacitor/commit/861874f)), closes [#3245](https://github.com/ionic-team/capacitor/issues/3245)
- fix(cordova): patch usages of webView superview (#3177) ([8241c81](https://github.com/ionic-team/capacitor/commit/8241c81)), closes [#3177](https://github.com/ionic-team/capacitor/issues/3177)

### Features

- feat: add appId and appName to device info (#3244) ([0d5e132](https://github.com/ionic-team/capacitor/commit/0d5e132)), closes [#3244](https://github.com/ionic-team/capacitor/issues/3244)
- feat(android): add ability to share both text and file (#3233) ([4e8b59e](https://github.com/ionic-team/capacitor/commit/4e8b59e)), closes [#3233](https://github.com/ionic-team/capacitor/issues/3233)
- feat(android): add option to make a notification ongoing (#3165) ([1ee51cd](https://github.com/ionic-team/capacitor/commit/1ee51cd)), closes [#3165](https://github.com/ionic-team/capacitor/issues/3165)
- feat(android): start animatable layers when splash drawable is layered (#2733) ([606b59f](https://github.com/ionic-team/capacitor/commit/606b59f)), closes [#2733](https://github.com/ionic-team/capacitor/issues/2733)
- feat(android): update to use androidx.exifinterface.media.ExifInterface ([6196907](https://github.com/ionic-team/capacitor/commit/6196907))
- feat(cli): add hooks to capacitor commands for custom platforms (#3091) ([c2133c5](https://github.com/ionic-team/capacitor/commit/c2133c5)), closes [#3091](https://github.com/ionic-team/capacitor/issues/3091)
- feat(ios): improve initial webview loading appearance (#2933) ([49720a5](https://github.com/ionic-team/capacitor/commit/49720a5)), closes [#2933](https://github.com/ionic-team/capacitor/issues/2933)
- feat(web): add file input method for camera (#1856) ([25505d2](https://github.com/ionic-team/capacitor/commit/25505d2)), closes [#1856](https://github.com/ionic-team/capacitor/issues/1856)

### Chores

- chore: update ios and android peerDependencies (#3274) ([d8ee77b](https://github.com/ionic-team/capacitor/commit/d8ee77b)), closes [#3274](https://github.com/ionic-team/capacitor/issues/3274)
- chore(android): improve error message when Filesystem.copy fails (#3148) ([598d7dc](https://github.com/ionic-team/capacitor/commit/598d7dc)), closes [#3148](https://github.com/ionic-team/capacitor/issues/3148)
- chore(android): make androidx.exifinterface version configurable (#3236) ([3c64162](https://github.com/ionic-team/capacitor/commit/3c64162)), closes [#3236](https://github.com/ionic-team/capacitor/issues/3236)
- chore(cli): add deprecation notice for all electron commands (#3268) ([5e84ce9](https://github.com/ionic-team/capacitor/commit/5e84ce9)), closes [#3268](https://github.com/ionic-team/capacitor/issues/3268)
- chore(cli): add deprecation notice for electron (#3263) ([b7d5639](https://github.com/ionic-team/capacitor/commit/b7d5639)), closes [#3263](https://github.com/ionic-team/capacitor/issues/3263)
- chore(cli): pin cli version instead of latest on plugin generation (#3201) ([8651ef1](https://github.com/ionic-team/capacitor/commit/8651ef1)), closes [#3201](https://github.com/ionic-team/capacitor/issues/3201)
- chore(cli): update plugin generation and plugin template (#3241) ([97a5b9a](https://github.com/ionic-team/capacitor/commit/97a5b9a)), closes [#3241](https://github.com/ionic-team/capacitor/issues/3241)
- chore(cli): use real path to Capacitor iOS Pods (#3249) ([618f9cf](https://github.com/ionic-team/capacitor/commit/618f9cf)), closes [#3249](https://github.com/ionic-team/capacitor/issues/3249)

## [2.2.1](https://github.com/ionic-team/capacitor/compare/2.2.0...2.2.1) (2020-07-01)

### Bug Fixes

- fix: revert static Config class (#3126) ([d104e9a](https://github.com/ionic-team/capacitor/commit/d104e9a)), closes [#3126](https://github.com/ionic-team/capacitor/issues/3126)
- fix(android): LocalNotification action not dismissing notification (#3112) ([6f5504b](https://github.com/ionic-team/capacitor/commit/6f5504b)), closes [#3112](https://github.com/ionic-team/capacitor/issues/3112)
- fix(iOS): Making permissions switch statements exhaustive & supporting new iOS 14 cases (#3160) ([f1d8c8c](https://github.com/ionic-team/capacitor/commit/f1d8c8c)), closes [#3160](https://github.com/ionic-team/capacitor/issues/3160)
- fix(SplashScreen): show method not resolving if autoHide is false (#3144) ([28a0e42](https://github.com/ionic-team/capacitor/commit/28a0e42)), closes [#3144](https://github.com/ionic-team/capacitor/issues/3144)

### Docs

- docs(cli): clarify "missing web assets directory" error message (#3131) ([da8b8a0](https://github.com/ionic-team/capacitor/commit/da8b8a0)), closes [#3131](https://github.com/ionic-team/capacitor/issues/3131)
- docs(contributing): outline difference between issues & discussions (#3083) ([4617908](https://github.com/ionic-team/capacitor/commit/4617908)), closes [#3083](https://github.com/ionic-team/capacitor/issues/3083)

### Chores

- chore: remove package-lock.json files (#3093) ([9cb36bb](https://github.com/ionic-team/capacitor/commit/9cb36bb)), closes [#3093](https://github.com/ionic-team/capacitor/issues/3093)
- chore: update capacitor twitter url (#3099) ([782e57a](https://github.com/ionic-team/capacitor/commit/782e57a)), closes [#3099](https://github.com/ionic-team/capacitor/issues/3099)
- chore: Update changelog for 2.2.0 ([dfe4239](https://github.com/ionic-team/capacitor/commit/dfe4239))
- chore: update ios and android peerDependencies ([12daa6a](https://github.com/ionic-team/capacitor/commit/12daa6a))
- chore: update site links (#3152) ([cdd0337](https://github.com/ionic-team/capacitor/commit/cdd0337)), closes [#3152](https://github.com/ionic-team/capacitor/issues/3152)
- chore: Update the location of capacitor pods for IonicRunner (#3120) ([937e3a2](https://github.com/ionic-team/capacitor/commit/937e3a2)), closes [#3120](https://github.com/ionic-team/capacitor/issues/3120)
- chore(android): update gradle wrapper to 5.6.4 (#3004) ([3a2244c](https://github.com/ionic-team/capacitor/commit/3a2244c)), closes [#3004](https://github.com/ionic-team/capacitor/issues/3004)
- chore(ci): add core to CI tests (#3094) ([26e5e74](https://github.com/ionic-team/capacitor/commit/26e5e74)), closes [#3094](https://github.com/ionic-team/capacitor/issues/3094)
- chore(ci): test multiple xcode versions (#3154) ([7b9ac92](https://github.com/ionic-team/capacitor/commit/7b9ac92)), closes [#3154](https://github.com/ionic-team/capacitor/issues/3154)
- chore(cli): cleanup doctor output (#3096) ([c2adf4c](https://github.com/ionic-team/capacitor/commit/c2adf4c)), closes [#3096](https://github.com/ionic-team/capacitor/issues/3096)
- chore(cli): read plugin podspec values from package.json (#3092) ([2e61a9a](https://github.com/ionic-team/capacitor/commit/2e61a9a)), closes [#3092](https://github.com/ionic-team/capacitor/issues/3092)
- chore(e2e): remove for now (#3086) ([0e33ca4](https://github.com/ionic-team/capacitor/commit/0e33ca4)), closes [#3086](https://github.com/ionic-team/capacitor/issues/3086)
- chore(github): add link to community proposals ([048b07e](https://github.com/ionic-team/capacitor/commit/048b07e))
- chore(github): add needs-reply workflows ([e97fd48](https://github.com/ionic-team/capacitor/commit/e97fd48))
- chore(github): add push handler for capacitor bot ([d2b6513](https://github.com/ionic-team/capacitor/commit/d2b6513))
- chore(github): allow blank issues ([53c0c15](https://github.com/ionic-team/capacitor/commit/53c0c15))
- chore(github): change new contributor commit message ([7e36434](https://github.com/ionic-team/capacitor/commit/7e36434))
- chore(github): checkout for capacitor bot ([d4b8457](https://github.com/ionic-team/capacitor/commit/d4b8457))
- chore(github): exclude Ionitron from contributors script ([fffa487](https://github.com/ionic-team/capacitor/commit/fffa487))
- chore(github): hook up capacitor-bot ([c5878a8](https://github.com/ionic-team/capacitor/commit/c5878a8))
- chore(github): lock in bot for now ([9534707](https://github.com/ionic-team/capacitor/commit/9534707))
- chore(github): remove duplicate section ([615225a](https://github.com/ionic-team/capacitor/commit/615225a))
- chore(github): update needs-reply label name ([9bd353c](https://github.com/ionic-team/capacitor/commit/9bd353c))
- chore(github): use config-based bot ([673344d](https://github.com/ionic-team/capacitor/commit/673344d))
- chore(readme): add new contributor (#3110) ([c04d8c3](https://github.com/ionic-team/capacitor/commit/c04d8c3)), closes [#3110](https://github.com/ionic-team/capacitor/issues/3110)
- chore(readme): add new contributor (#3150) ([0bc0152](https://github.com/ionic-team/capacitor/commit/0bc0152)), closes [#3150](https://github.com/ionic-team/capacitor/issues/3150)
- chore(readme): add new contributor (#3173) ([fe3f552](https://github.com/ionic-team/capacitor/commit/fe3f552)), closes [#3173](https://github.com/ionic-team/capacitor/issues/3173)
- chore(readme): add new contributor (#3185) ([84ca1ed](https://github.com/ionic-team/capacitor/commit/84ca1ed)), closes [#3185](https://github.com/ionic-team/capacitor/issues/3185)
- chore(readme): add new contributor (#3190) ([ce258f2](https://github.com/ionic-team/capacitor/commit/ce258f2)), closes [#3190](https://github.com/ionic-team/capacitor/issues/3190)
- chore(readme): show contributors in readme (#3097) ([c4d749f](https://github.com/ionic-team/capacitor/commit/c4d749f)), closes [#3097](https://github.com/ionic-team/capacitor/issues/3097)
- chore(site): remove from repo (#3138) ([7c82ad3](https://github.com/ionic-team/capacitor/commit/7c82ad3)), closes [#3138](https://github.com/ionic-team/capacitor/issues/3138)
- chore(test): increase timeout ([c501208](https://github.com/ionic-team/capacitor/commit/c501208))
- test(android): add tests for PluginMethodHandler (#3153) ([dd7077e](https://github.com/ionic-team/capacitor/commit/dd7077e)), closes [#3153](https://github.com/ionic-team/capacitor/issues/3153)
- test(android): setup tests, test JSObject (#2508) ([5a37496](https://github.com/ionic-team/capacitor/commit/5a37496)), closes [#2508](https://github.com/ionic-team/capacitor/issues/2508)
- refactor(android): MessageHandler formatting and simplifying (#2510) ([befe798](https://github.com/ionic-team/capacitor/commit/befe798)), closes [#2510](https://github.com/ionic-team/capacitor/issues/2510)

## [2.2.0](https://github.com/ionic-team/capacitor/compare/2.1.2...2.2.0) (2020-06-10)

### Bug Fixes

- fix(cli/cordova): replace $PACKAGE_NAME with ${applicationId} (#3030) ([7a2a45f](https://github.com/ionic-team/capacitor/commit/7a2a45f)), closes [#3030](https://github.com/ionic-team/capacitor/issues/3030)
- fix(android): incorrect keyboard height (#2924) ([035f74e](https://github.com/ionic-team/capacitor/commit/035f74e)), closes [#2924](https://github.com/ionic-team/capacitor/issues/2924)
- fix(android): set cookie on proxied request (#3076) ([9b96edc](https://github.com/ionic-team/capacitor/commit/9b96edc)), closes [#3076](https://github.com/ionic-team/capacitor/issues/3076)
- fix(android): set cookie on proxied request only if exists (#3077) ([766a61d](https://github.com/ionic-team/capacitor/commit/766a61d)), closes [#3077](https://github.com/ionic-team/capacitor/issues/3077)
- fix(ios): update frame immediately when keyboard hides (#3038) ([e538bad](https://github.com/ionic-team/capacitor/commit/e538bad)), closes [#3038](https://github.com/ionic-team/capacitor/issues/3038)

### Features

- feat(core/web): add areEnabled implementation for LocalNotifications (#2900) ([179104c](https://github.com/ionic-team/capacitor/commit/179104c)), closes [#2900](https://github.com/ionic-team/capacitor/issues/2900)
- feat(android): move Config to be per-instance rather than a singleton (#3055) ([b4815a5](https://github.com/ionic-team/capacitor/commit/b4815a5)), closes [#3055](https://github.com/ionic-team/capacitor/issues/3055)
- feat(ios): show toast when loading url in debug mode (#2871) ([171870b](https://github.com/ionic-team/capacitor/commit/171870b)), closes [#2871](https://github.com/ionic-team/capacitor/issues/2871)
- feat(Permissions): allow microphone check (#3068) ([a2f2e4f](https://github.com/ionic-team/capacitor/commit/a2f2e4f)), closes [#3068](https://github.com/ionic-team/capacitor/issues/3068)

### Docs

- docs(push): Add descriptions to push notification methods (#3036) ([a2ea9ce](https://github.com/ionic-team/capacitor/commit/a2ea9ce)), closes [#3036](https://github.com/ionic-team/capacitor/issues/3036)
- docs(share): remove wrong sentence (#3051) ([d7b09c0](https://github.com/ionic-team/capacitor/commit/d7b09c0)), closes [#3051](https://github.com/ionic-team/capacitor/issues/3051)

### Chores

- chore: fix circleci tests (#3025) ([2c4e72f](https://github.com/ionic-team/capacitor/commit/2c4e72f)), closes [#3025](https://github.com/ionic-team/capacitor/issues/3025)
- chore: fix receive spelling (#3035) ([319bd8a](https://github.com/ionic-team/capacitor/commit/319bd8a)), closes [#3035](https://github.com/ionic-team/capacitor/issues/3035)
- chore: missing changes on ios publish (#3034) ([5b1f3fb](https://github.com/ionic-team/capacitor/commit/5b1f3fb)), closes [#3034](https://github.com/ionic-team/capacitor/issues/3034)
- chore: simplify ios publishing (#3028) ([38791a8](https://github.com/ionic-team/capacitor/commit/38791a8)), closes [#3028](https://github.com/ionic-team/capacitor/issues/3028)
- chore: Update changelog for 2.1.2 ([ee919f7](https://github.com/ionic-team/capacitor/commit/ee919f7))
- chore(android): avoid connection on proxy to check the content type (#3078) ([0d2894c](https://github.com/ionic-team/capacitor/commit/0d2894c)), closes [#3078](https://github.com/ionic-team/capacitor/issues/3078)
- chore(android): Fix receive spelling in Javadoc (#3029) ([28c8792](https://github.com/ionic-team/capacitor/commit/28c8792)), closes [#3029](https://github.com/ionic-team/capacitor/issues/3029)
- chore(ci): switch to Github Actions (#3057) ([8aefce0](https://github.com/ionic-team/capacitor/commit/8aefce0)), closes [#3057](https://github.com/ionic-team/capacitor/issues/3057)
- chore(github): important emoji fix (#3081) ([1d7fd2c](https://github.com/ionic-team/capacitor/commit/1d7fd2c)), closes [#3081](https://github.com/ionic-team/capacitor/issues/3081)
- chore(github): issue template cleanup (#3056) ([939ce8b](https://github.com/ionic-team/capacitor/commit/939ce8b)), closes [#3056](https://github.com/ionic-team/capacitor/issues/3056)
- chore(ios): correct plugin descriptions (#3037) ([a8ad95d](https://github.com/ionic-team/capacitor/commit/a8ad95d)), closes [#3037](https://github.com/ionic-team/capacitor/issues/3037)
- chore(readme): revamp (#3058) ([7adde78](https://github.com/ionic-team/capacitor/commit/7adde78)), closes [#3058](https://github.com/ionic-team/capacitor/issues/3058)
- chore(test): increase timeout so integration tests pass (#3079) ([70eff96](https://github.com/ionic-team/capacitor/commit/70eff96)), closes [#3079](https://github.com/ionic-team/capacitor/issues/3079)

## [2.1.2](https://github.com/ionic-team/capacitor/compare/2.1.1...2.1.2) (2020-05-29)

### Bug Fixes

- fix: send error on photos picker dismiss on ios 13 (#3010) ([47f2dd8](https://github.com/ionic-team/capacitor/commit/47f2dd8)), closes [#3010](https://github.com/ionic-team/capacitor/issues/3010)
- fix(android): remove bintray publishing plugin to fix Gradle 6+ issues (#3016) ([b584b00](https://github.com/ionic-team/capacitor/commit/b584b00)), closes [#3016](https://github.com/ionic-team/capacitor/issues/3016)

### Docs

- docs: add information about disabling logs (#3001) ([e9b2c9d](https://github.com/ionic-team/capacitor/commit/e9b2c9d)), closes [#3001](https://github.com/ionic-team/capacitor/issues/3001)
- docs: make links to other pages absolute (#3002) ([22d9a09](https://github.com/ionic-team/capacitor/commit/22d9a09)), closes [#3002](https://github.com/ionic-team/capacitor/issues/3002)

### Chores

- chore: remove redundant checks for android_home and bintray (#3019) ([c407d74](https://github.com/ionic-team/capacitor/commit/c407d74)), closes [#3019](https://github.com/ionic-team/capacitor/issues/3019)
- chore: Update changelog for 2.1.1 ([555f4af](https://github.com/ionic-team/capacitor/commit/555f4af))
- chore(cli): run tests with max workers, not in band (#3018) ([2e6a9c4](https://github.com/ionic-team/capacitor/commit/2e6a9c4)), closes [#3018](https://github.com/ionic-team/capacitor/issues/3018)
- chore(ios): remove pod deployment (#3017) ([8b8c051](https://github.com/ionic-team/capacitor/commit/8b8c051)), closes [#3017](https://github.com/ionic-team/capacitor/issues/3017)

## [2.1.1](https://github.com/ionic-team/capacitor/compare/2.1.0...2.1.1) (2020-05-27)

### Bug Fixes

- fix(core/web): Filesystem.appendFile creating wrong parent folder (#2985) ([3951f6b](https://github.com/ionic-team/capacitor/commit/3951f6b)), closes [#2985](https://github.com/ionic-team/capacitor/issues/2985)
- fix(android): Filesystem.requestPermissions() not working (#2936) ([2a9a95d](https://github.com/ionic-team/capacitor/commit/2a9a95d)), closes [#2936](https://github.com/ionic-team/capacitor/issues/2936)
- fix(android): Prevent Android 10 crash on Filesystem.readdir (#2950) ([0914c23](https://github.com/ionic-team/capacitor/commit/0914c23)), closes [#2950](https://github.com/ionic-team/capacitor/issues/2950)
- fix(android): remember camera prompt selection after permission result (#2903) ([cdd317f](https://github.com/ionic-team/capacitor/commit/cdd317f)), closes [#2903](https://github.com/ionic-team/capacitor/issues/2903)
- fix(cli): Improve plugin.xml framework detection (#2956) ([8736d90](https://github.com/ionic-team/capacitor/commit/8736d90)), closes [#2956](https://github.com/ionic-team/capacitor/issues/2956)
- fix(cordova): Add cordova-support-google-services to incompatible list (#2912) ([58d0768](https://github.com/ionic-team/capacitor/commit/58d0768)), closes [#2912](https://github.com/ionic-team/capacitor/issues/2912)
- fix(cordova): Exclude framework headers (#2972) ([53a6371](https://github.com/ionic-team/capacitor/commit/53a6371)), closes [#2972](https://github.com/ionic-team/capacitor/issues/2972)
- fix(ios): Create tmpWindow when is needed and destroy when not needed (#2995) ([9475129](https://github.com/ionic-team/capacitor/commit/9475129)), closes [#2995](https://github.com/ionic-team/capacitor/issues/2995)
- fix(web): improve Proxy check to avoid SSR problems (#2851) ([7afc9eb](https://github.com/ionic-team/capacitor/commit/7afc9eb)), closes [#2851](https://github.com/ionic-team/capacitor/issues/2851)

### Docs

- docs(ce-plugins) add @byrds/capacitor-contacts plugin (#2939) ([56d4159](https://github.com/ionic-team/capacitor/commit/56d4159)), closes [#2939](https://github.com/ionic-team/capacitor/issues/2939)
- docs: Appflow is now available (#2970) ([516386e](https://github.com/ionic-team/capacitor/commit/516386e)), closes [#2970](https://github.com/ionic-team/capacitor/issues/2970)
- docs(android): Add information about accessing public folders in Android 10 (#2951) ([6d1778b](https://github.com/ionic-team/capacitor/commit/6d1778b)), closes [#2951](https://github.com/ionic-team/capacitor/issues/2951)
- docs(ce-plugins): add capacitor-blob-writer (#2885) ([cacecb4](https://github.com/ionic-team/capacitor/commit/cacecb4)), closes [#2885](https://github.com/ionic-team/capacitor/issues/2885)
- docs(ce-plugins): add capacitor-firebase-crashlytics (#2938) ([cb1e672](https://github.com/ionic-team/capacitor/commit/cb1e672)), closes [#2938](https://github.com/ionic-team/capacitor/issues/2938)
- docs(cordova-migration): Add cordova plugin uninstall details (#2935) ([17bf3ab](https://github.com/ionic-team/capacitor/commit/17bf3ab)), closes [#2935](https://github.com/ionic-team/capacitor/issues/2935)
- docs(deep-links): clarify apple-app-site-association file (#2963) ([ac9c3de](https://github.com/ionic-team/capacitor/commit/ac9c3de)), closes [#2963](https://github.com/ionic-team/capacitor/issues/2963)
- docs(Plugins): add information about how to override navigation (#2923) ([63c8542](https://github.com/ionic-team/capacitor/commit/63c8542)), closes [#2923](https://github.com/ionic-team/capacitor/issues/2923)
- docs(splash): Full Screen & Immersive are android only (#2945) ([b8e7279](https://github.com/ionic-team/capacitor/commit/b8e7279)), closes [#2945](https://github.com/ionic-team/capacitor/issues/2945)
- docs(workflow): change update instructions to get latest version (#2937) ([0c151fc](https://github.com/ionic-team/capacitor/commit/0c151fc)), closes [#2937](https://github.com/ionic-team/capacitor/issues/2937)

### Chores

- chore(dependencies): Update package dependencies to 2.1.0 ([a5fb2bc](https://github.com/ionic-team/capacitor/commit/a5fb2bc))
- chore(site): Update dependencies (#2928) ([a9d4698](https://github.com/ionic-team/capacitor/commit/a9d4698)), closes [#2928](https://github.com/ionic-team/capacitor/issues/2928)
- chore(site): update firebase-tools (#2915) ([bdce166](https://github.com/ionic-team/capacitor/commit/bdce166)), closes [#2915](https://github.com/ionic-team/capacitor/issues/2915)

## (2020-05-07)

## [2.1.0](https://github.com/ionic-team/capacitor/compare/2.0.2...2.1.0) (2020-05-07)

### Bug Fixes

- fix: set launchShowDuration to 0 on new projects only (#2876) ([8de0414](https://github.com/ionic-team/capacitor/commit/8de0414)), closes [#2876](https://github.com/ionic-team/capacitor/issues/2876)
- fix(android): call error on prompt cancel (#2855) ([c86cfb1](https://github.com/ionic-team/capacitor/commit/c86cfb1)), closes [#2855](https://github.com/ionic-team/capacitor/issues/2855)
- fix(android): check if NETWORK_PROVIDER is enabled (#2859) ([f4d5c84](https://github.com/ionic-team/capacitor/commit/f4d5c84)), closes [#2859](https://github.com/ionic-team/capacitor/issues/2859)
- fix(android): make readFile not add newlines on base64 strings (#2857) ([31d65c9](https://github.com/ionic-team/capacitor/commit/31d65c9)), closes [#2857](https://github.com/ionic-team/capacitor/issues/2857)
- fix(cli): avoid infinite loop on scoped dependencies (#2868) ([69d62f7](https://github.com/ionic-team/capacitor/commit/69d62f7)), closes [#2868](https://github.com/ionic-team/capacitor/issues/2868)
- fix(ios): remove thread warning on Haptics.selectionEnd() (#2860) ([471ed0c](https://github.com/ionic-team/capacitor/commit/471ed0c)), closes [#2860](https://github.com/ionic-team/capacitor/issues/2860)
- fix(splash): Make splash launch delay timeout zero to speed up capacitor boot ([b29346b](https://github.com/ionic-team/capacitor/commit/b29346b))

### Features

- feat: Add common hideLogs option (#2865) ([1b3f0ec](https://github.com/ionic-team/capacitor/commit/1b3f0ec)), closes [#2865](https://github.com/ionic-team/capacitor/issues/2865)
- feat: Allow plugins to override navigation (#2872) ([41f9834](https://github.com/ionic-team/capacitor/commit/41f9834)), closes [#2872](https://github.com/ionic-team/capacitor/issues/2872)
- feat(android): add vibration option to notifications channel (#2787) ([2f6f0ba](https://github.com/ionic-team/capacitor/commit/2f6f0ba)), closes [#2787](https://github.com/ionic-team/capacitor/issues/2787)
- feat(android): expose JSON string constructor for JSArray (#2879) ([040bfc8](https://github.com/ionic-team/capacitor/commit/040bfc8)), closes [#2879](https://github.com/ionic-team/capacitor/issues/2879)
- feat(android): hideLogs feature (#2839) ([d60757a](https://github.com/ionic-team/capacitor/commit/d60757a)), closes [#2839](https://github.com/ionic-team/capacitor/issues/2839)
- feat(android): implement selection haptic feedback (#2704) ([34dd280](https://github.com/ionic-team/capacitor/commit/34dd280)), closes [#2704](https://github.com/ionic-team/capacitor/issues/2704)
- feat(camera): make prompt strings localizable (#2631) ([0c09fc8](https://github.com/ionic-team/capacitor/commit/0c09fc8)), closes [#2631](https://github.com/ionic-team/capacitor/issues/2631)
- feat(cordova): Add WK_WEB_VIEW_ONLY=1 preprocessor macro (#2880) ([603b2e3](https://github.com/ionic-team/capacitor/commit/603b2e3)), closes [#2880](https://github.com/ionic-team/capacitor/issues/2880)

### Docs

- docs(browser): Update information for close method (#2796) ([89c64af](https://github.com/ionic-team/capacitor/commit/89c64af)), closes [#2796](https://github.com/ionic-team/capacitor/issues/2796)

## [2.0.2](https://github.com/ionic-team/capacitor/compare/2.0.1...2.0.2) (2020-04-29)

### Bug Fixes

- fix(android) : App can crash on clipboard.read if empty (#2815) ([fc33265](https://github.com/ionic-team/capacitor/commit/fc33265)), closes [#2815](https://github.com/ionic-team/capacitor/issues/2815)
- fix(android): avoid camera crash on photo edit cancel (#2776) ([4b8820d](https://github.com/ionic-team/capacitor/commit/4b8820d)), closes [#2776](https://github.com/ionic-team/capacitor/issues/2776)
- fix(android): don't remove LocalNotification from pending on dismiss (#2809) ([822b140](https://github.com/ionic-team/capacitor/commit/822b140)), closes [#2809](https://github.com/ionic-team/capacitor/issues/2809)
- fix(ios): allow Browser popover presentation if supported (#2784) ([4b40494](https://github.com/ionic-team/capacitor/commit/4b40494)), closes [#2784](https://github.com/ionic-team/capacitor/issues/2784)
- fix(ios): remove applicationState check on keyboard plugin (#2820) ([dbc1da1](https://github.com/ionic-team/capacitor/commit/dbc1da1)), closes [#2820](https://github.com/ionic-team/capacitor/issues/2820)
- fix(web): Gracefully degrade Proxy usage to fix IE11 (#2759) ([b61f909](https://github.com/ionic-team/capacitor/commit/b61f909)), closes [#2759](https://github.com/ionic-team/capacitor/issues/2759)

### Docs

- docs(ios/configuration): Add information on how to rename your app (#2768) ([55c3d52](https://github.com/ionic-team/capacitor/commit/55c3d52)), closes [#2768](https://github.com/ionic-team/capacitor/issues/2768)
- docs: improve visibility of jetifier command (#2844) ([fd28a3a](https://github.com/ionic-team/capacitor/commit/fd28a3a)), closes [#2844](https://github.com/ionic-team/capacitor/issues/2844)
- docs(android): explain where to apply the variables change (#2791) ([e5bd2eb](https://github.com/ionic-team/capacitor/commit/e5bd2eb)), closes [#2791](https://github.com/ionic-team/capacitor/issues/2791)
- docs(ce-plugins): Add capacitor-admob-advanced (#2780) ([9b1593d](https://github.com/ionic-team/capacitor/commit/9b1593d)), closes [#2780](https://github.com/ionic-team/capacitor/issues/2780)
- docs(deep-links): Rename applinks.json to assetlinks.json (#2842) ([53883ce](https://github.com/ionic-team/capacitor/commit/53883ce)), closes [#2842](https://github.com/ionic-team/capacitor/issues/2842)
- docs(firebase pn): Update Push Notifications with Firebase Guide (#2698) ([ee5e283](https://github.com/ionic-team/capacitor/commit/ee5e283)), closes [#2698](https://github.com/ionic-team/capacitor/issues/2698)
- docs(keyboard): Add missing import in example (#2749) ([04fb275](https://github.com/ionic-team/capacitor/commit/04fb275)), closes [#2749](https://github.com/ionic-team/capacitor/issues/2749)
- docs(troubleshooting): Add AndroidX information and workaround (#2832) ([d9cd399](https://github.com/ionic-team/capacitor/commit/d9cd399)), closes [#2832](https://github.com/ionic-team/capacitor/issues/2832)
- docs(updating): Provide a full path to variables.gradle file (#2769) ([3638a89](https://github.com/ionic-team/capacitor/commit/3638a89)), closes [#2769](https://github.com/ionic-team/capacitor/issues/2769)
- docs(updating): Remove duplicate gradle sentence (#2798) ([347029c](https://github.com/ionic-team/capacitor/commit/347029c)), closes [#2798](https://github.com/ionic-team/capacitor/issues/2798)

### Chores

- chore: remove blog (#2813) ([e219e69](https://github.com/ionic-team/capacitor/commit/e219e69)), closes [#2813](https://github.com/ionic-team/capacitor/issues/2813)
- chore: remove electron mentions (#2812) ([4dad4a1](https://github.com/ionic-team/capacitor/commit/4dad4a1)), closes [#2812](https://github.com/ionic-team/capacitor/issues/2812)
- chore(core): update jest (#2843) ([b525c17](https://github.com/ionic-team/capacitor/commit/b525c17)), closes [#2843](https://github.com/ionic-team/capacitor/issues/2843)

## [2.0.1](https://github.com/ionic-team/capacitor/compare/2.0.0...2.0.1) (2020-04-10)

### Bug Fixes

- fix(android): Avoid crash on schedule if LocalNotifications are disabled (#2718) ([aac51fe](https://github.com/ionic-team/capacitor/commit/aac51fe)), closes [#2718](https://github.com/ionic-team/capacitor/issues/2718)
- fix(android): display title on Modals.showActions (#2730) ([c2e0358](https://github.com/ionic-team/capacitor/commit/c2e0358)), closes [#2730](https://github.com/ionic-team/capacitor/issues/2730)
- fix(android): input autofocus and javascript focus not working (#2719) ([e010a28](https://github.com/ionic-team/capacitor/commit/e010a28)), closes [#2719](https://github.com/ionic-team/capacitor/issues/2719)
- fix(android): use proper targetSdkVersion (#2706) ([3cd02e4](https://github.com/ionic-team/capacitor/commit/3cd02e4)), closes [#2706](https://github.com/ionic-team/capacitor/issues/2706)
- fix(cli): avoid error on create command (#2727) ([fefa4b9](https://github.com/ionic-team/capacitor/commit/fefa4b9)), closes [#2727](https://github.com/ionic-team/capacitor/issues/2727)
- fix(cli): match platform version with cli version on add command (#2724) ([6172932](https://github.com/ionic-team/capacitor/commit/6172932)), closes [#2724](https://github.com/ionic-team/capacitor/issues/2724)
- fix(cli): use appName as package.json name on electron project (#2741) ([d6fc2d8](https://github.com/ionic-team/capacitor/commit/d6fc2d8)), closes [#2741](https://github.com/ionic-team/capacitor/issues/2741)
- fix(cli): Warn if core version doesn't match platform version (#2736) ([29a9acf](https://github.com/ionic-team/capacitor/commit/29a9acf)), closes [#2736](https://github.com/ionic-team/capacitor/issues/2736)
- fix(cordova): Don't add as system library if it's a vendored library (#2729) ([404574d](https://github.com/ionic-team/capacitor/commit/404574d)), closes [#2729](https://github.com/ionic-team/capacitor/issues/2729)
- fix(cordova): handle plugin.xml asset tag (#2728) ([8e1abfe](https://github.com/ionic-team/capacitor/commit/8e1abfe)), closes [#2728](https://github.com/ionic-team/capacitor/issues/2728)
- fix(electron): Update Modals Plugin to use new dialog async syntax (#2742) ([4c13fe0](https://github.com/ionic-team/capacitor/commit/4c13fe0)), closes [#2742](https://github.com/ionic-team/capacitor/issues/2742)
- fix(ios): allow access to extension-less files (#2726) ([3baf81b](https://github.com/ionic-team/capacitor/commit/3baf81b)), closes [#2726](https://github.com/ionic-team/capacitor/issues/2726)
- fix(ios): don't use the tmpWindow on popover presentation (#2714) ([327ffc5](https://github.com/ionic-team/capacitor/commit/327ffc5)), closes [#2714](https://github.com/ionic-team/capacitor/issues/2714)
- fix(plugin-template): remove incorrect = from android gradle file (#2689) ([39c8d4a](https://github.com/ionic-team/capacitor/commit/39c8d4a)), closes [#2689](https://github.com/ionic-team/capacitor/issues/2689)

### Docs

- docs(ce-plugins): Remove capacitor-apple-login (#2734) ([b532179](https://github.com/ionic-team/capacitor/commit/b532179)), closes [#2734](https://github.com/ionic-team/capacitor/issues/2734)
- docs(updating): Add 2.0.0 changes for electron (#2708) ([6a03960](https://github.com/ionic-team/capacitor/commit/6a03960)), closes [#2708](https://github.com/ionic-team/capacitor/issues/2708)
- docs(updating): Add some 2.0.0 missing information (#2707) ([46ca030](https://github.com/ionic-team/capacitor/commit/46ca030)), closes [#2707](https://github.com/ionic-team/capacitor/issues/2707)
- docs(updating): modify the guides for 2.0.0 final ([00f6196](https://github.com/ionic-team/capacitor/commit/00f6196))

### Chores

- chore(android): fix release script to use Android X (#2687) ([a63e203](https://github.com/ionic-team/capacitor/commit/a63e203)), closes [#2687](https://github.com/ionic-team/capacitor/issues/2687)
- chore(android): Improve handling of splashImmersive and splashFullScreen preferences (#2705) ([1c633c5](https://github.com/ionic-team/capacitor/commit/1c633c5)), closes [#2705](https://github.com/ionic-team/capacitor/issues/2705)

## [2.0.0](https://github.com/ionic-team/capacitor/compare/1.5.0...2.0.0) (2020-04-03)

### Bug Fixes

- fix(android): allow Share plugin to provide text or url only (#2436) ([b6328f0](https://github.com/ionic-team/capacitor/commit/b6328f0)), closes [#2436](https://github.com/ionic-team/capacitor/issues/2436)
- fix(android): Avoid Accessibility.speak crash (#2554) ([77b59f8](https://github.com/ionic-team/capacitor/commit/77b59f8)), closes [#2554](https://github.com/ionic-team/capacitor/issues/2554)
- fix(android): don't return NO_CAMERA_ERROR if any camera is present (#2558) ([4f6ca98](https://github.com/ionic-team/capacitor/commit/4f6ca98)), closes [#2558](https://github.com/ionic-team/capacitor/issues/2558)
- fix(android): maintain status bar color during splash (#2603) ([59fcf9e](https://github.com/ionic-team/capacitor/commit/59fcf9e)), closes [#2603](https://github.com/ionic-team/capacitor/issues/2603)
- fix(android): make camera work on Android 10 (#2559) ([4a1a7b8](https://github.com/ionic-team/capacitor/commit/4a1a7b8)), closes [#2559](https://github.com/ionic-team/capacitor/issues/2559)
- fix(android): make LocalNotification not crash on showing when (#2677) ([63ecd1c](https://github.com/ionic-team/capacitor/commit/63ecd1c)), closes [#2677](https://github.com/ionic-team/capacitor/issues/2677)
- fix(android): Make Modals.showActions non cancelable (#2504) ([ffdd78c](https://github.com/ionic-team/capacitor/commit/ffdd78c)), closes [#2504](https://github.com/ionic-team/capacitor/issues/2504)
- fix(android): make sure scheduled time is shown in LocalNotifications (#2553) ([448e7b7](https://github.com/ionic-team/capacitor/commit/448e7b7)), closes [#2553](https://github.com/ionic-team/capacitor/issues/2553)
- fix(android): missing AndroidX changes (#2454) ([10acf5c](https://github.com/ionic-team/capacitor/commit/10acf5c)), closes [#2454](https://github.com/ionic-team/capacitor/issues/2454)
- fix(android): plugin retained events not being retained if listeners were empty (#2408) ([b817e83](https://github.com/ionic-team/capacitor/commit/b817e83)), closes [#2408](https://github.com/ionic-team/capacitor/issues/2408)
- fix(android): put google() on top of jcenter() in gradle files (#2461) ([3263dbc](https://github.com/ionic-team/capacitor/commit/3263dbc)), closes [#2461](https://github.com/ionic-team/capacitor/issues/2461)
- fix(android): return original camera image if edition was canceled (#2358) ([ce93ed3](https://github.com/ionic-team/capacitor/commit/ce93ed3)), closes [#2358](https://github.com/ionic-team/capacitor/issues/2358)
- fix(android): support for multi-line text in LocalNotifications (#2552) ([59d02ab](https://github.com/ionic-team/capacitor/commit/59d02ab)), closes [#2552](https://github.com/ionic-team/capacitor/issues/2552)
- fix(android): Use NotificationCompat constant for setting visibility (#2586) ([62b11fd](https://github.com/ionic-team/capacitor/commit/62b11fd)), closes [#2586](https://github.com/ionic-team/capacitor/issues/2586)
- fix(cli): Avoid AndroidManifest.xml not found error on add (#2400) ([120969c](https://github.com/ionic-team/capacitor/commit/120969c)), closes [#2400](https://github.com/ionic-team/capacitor/issues/2400)
- fix(cli): avoid error when config.xml has no preferences (#2627) ([6c0dc4b](https://github.com/ionic-team/capacitor/commit/6c0dc4b)), closes [#2627](https://github.com/ionic-team/capacitor/issues/2627)
- fix(cli): prevent cordova dependency loop if plugin contains @ (#2622) ([9dcb2ff](https://github.com/ionic-team/capacitor/commit/9dcb2ff)), closes [#2622](https://github.com/ionic-team/capacitor/issues/2622)
- fix(cli): properly merge non application config-file (#2478) ([9c589a3](https://github.com/ionic-team/capacitor/commit/9c589a3)), closes [#2478](https://github.com/ionic-team/capacitor/issues/2478)
- fix(cordova): Add lib prefix to .a library names (#2636) ([2be4a92](https://github.com/ionic-team/capacitor/commit/2be4a92)), closes [#2636](https://github.com/ionic-team/capacitor/issues/2636)
- fix(cordova): handle source-file with framework attribute (#2507) ([f7cd4c0](https://github.com/ionic-team/capacitor/commit/f7cd4c0)), closes [#2507](https://github.com/ionic-team/capacitor/issues/2507)
- fix(doctor): add electron checks (#2434) ([d5efb05](https://github.com/ionic-team/capacitor/commit/d5efb05)), closes [#2434](https://github.com/ionic-team/capacitor/issues/2434)
- fix(electron): correct implementation of Filesystem.appendFile (#2567) ([c6a3b3b](https://github.com/ionic-team/capacitor/commit/c6a3b3b)), closes [#2567](https://github.com/ionic-team/capacitor/issues/2567)
- fix(electron): Provide app version in Device.getInfo() (#2521) ([0998ae8](https://github.com/ionic-team/capacitor/commit/0998ae8)), closes [#2521](https://github.com/ionic-team/capacitor/issues/2521)
- fix(electron): various clipboard fixes (#2566) ([2c809ab](https://github.com/ionic-team/capacitor/commit/2c809ab)), closes [#2566](https://github.com/ionic-team/capacitor/issues/2566)
- fix(ios): avoid crash on registerPlugins on Xcode 11.4 (#2414) ([ca8fa9e](https://github.com/ionic-team/capacitor/commit/ca8fa9e)), closes [#2414](https://github.com/ionic-team/capacitor/issues/2414)
- fix(ios): implement statusTap for iOS 13 (#2376) ([7cb77c8](https://github.com/ionic-team/capacitor/commit/7cb77c8)), closes [#2376](https://github.com/ionic-team/capacitor/issues/2376)
- fix(ios): make ActionSheetOptionStyle.Cancel show cancel button (#2496) ([d120021](https://github.com/ionic-team/capacitor/commit/d120021)), closes [#2496](https://github.com/ionic-team/capacitor/issues/2496)
- fix(ios): Make Camera.getPhoto return exif from gallery photos (#2595) ([18f9d81](https://github.com/ionic-team/capacitor/commit/18f9d81)), closes [#2595](https://github.com/ionic-team/capacitor/issues/2595)
- fix(ios): Make Clipboard plugin return errors (#2430) ([6a2ee92](https://github.com/ionic-team/capacitor/commit/6a2ee92)), closes [#2430](https://github.com/ionic-team/capacitor/issues/2430)
- fix(ios): make Clipboard.read return text/plain (#2565) ([078284d](https://github.com/ionic-team/capacitor/commit/078284d)), closes [#2565](https://github.com/ionic-team/capacitor/issues/2565)
- fix(ios): return error if Cancel is selected from Camera.getPhoto() prompt (#2550) ([a015f8f](https://github.com/ionic-team/capacitor/commit/a015f8f)), closes [#2550](https://github.com/ionic-team/capacitor/issues/2550)
- fix(ios): writeFile failing on root folders (#2670) ([f7a800c](https://github.com/ionic-team/capacitor/commit/f7a800c)), closes [#2670](https://github.com/ionic-team/capacitor/issues/2670)
- fix(LocalNotifications): return proper LocalNotificationScheduleResult on schedule (#2490) ([b89fb15](https://github.com/ionic-team/capacitor/commit/b89fb15)), closes [#2490](https://github.com/ionic-team/capacitor/issues/2490)
- fix(modals): make inputPlaceholder set a placeholder and not text (#2474) ([8002791](https://github.com/ionic-team/capacitor/commit/8002791)), closes [#2474](https://github.com/ionic-team/capacitor/issues/2474)
- fix(modals): make showActions work on web and electron (#2501) ([f1204b8](https://github.com/ionic-team/capacitor/commit/f1204b8)), closes [#2501](https://github.com/ionic-team/capacitor/issues/2501)
- fix(toast): unify duration across platforms (#2340) ([717dd0a](https://github.com/ionic-team/capacitor/commit/717dd0a)), closes [#2340](https://github.com/ionic-team/capacitor/issues/2340)

### Features

- feat: add requestPermission to PushNotifications and LocalNotifications (#2516) ([82e38a4](https://github.com/ionic-team/capacitor/commit/82e38a4)), closes [#2516](https://github.com/ionic-team/capacitor/issues/2516)
- feat: Allow plugins to reject with a string code (#2533) ([f93c354](https://github.com/ionic-team/capacitor/commit/f93c354)), closes [#2533](https://github.com/ionic-team/capacitor/issues/2533)
- feat: implement removeAllListeners (#2609) ([ac55d63](https://github.com/ionic-team/capacitor/commit/ac55d63)), closes [#2609](https://github.com/ionic-team/capacitor/issues/2609)
- feat(android): add configurable icon color for local notifications (#2548) ([0bfa0bf](https://github.com/ionic-team/capacitor/commit/0bfa0bf)), closes [#2548](https://github.com/ionic-team/capacitor/issues/2548)
- feat(android): Add immersive configuration to Splash (#2425) ([2605ad6](https://github.com/ionic-team/capacitor/commit/2605ad6)), closes [#2425](https://github.com/ionic-team/capacitor/issues/2425)
- feat(android): Add lights and lightColor to PushNotificationChannel (#2618) ([4c0170c](https://github.com/ionic-team/capacitor/commit/4c0170c)), closes [#2618](https://github.com/ionic-team/capacitor/issues/2618)
- feat(android): Add Statusbar.setOverlaysWebView method (#2597) ([d035939](https://github.com/ionic-team/capacitor/commit/d035939)), closes [#2597](https://github.com/ionic-team/capacitor/issues/2597)
- feat(android): Allow plugin methods to crash (#2512) ([253cdc9](https://github.com/ionic-team/capacitor/commit/253cdc9)), closes [#2512](https://github.com/ionic-team/capacitor/issues/2512)
- feat(android): Allow to configure a default notification sound (#2682) ([93eb9aa](https://github.com/ionic-team/capacitor/commit/93eb9aa)), closes [#2682](https://github.com/ionic-team/capacitor/issues/2682)
- feat(android): avoid app restart on activity resize or uiMode change (#2584) ([4a29ff8](https://github.com/ionic-team/capacitor/commit/4a29ff8)), closes [#2584](https://github.com/ionic-team/capacitor/issues/2584)
- feat(android): Enable AndroidX and use AndroidX dependencies (#2045) ([8b606e9](https://github.com/ionic-team/capacitor/commit/8b606e9)), closes [#2045](https://github.com/ionic-team/capacitor/issues/2045)
- feat(android): Handle onDestroy lifecycle event in plugins (#2421) ([6fe6d25](https://github.com/ionic-team/capacitor/commit/6fe6d25)), closes [#2421](https://github.com/ionic-team/capacitor/issues/2421)
- feat(android): implement BridgeFragment for easier embedding using Fragments (#2666) ([a8d9591](https://github.com/ionic-team/capacitor/commit/a8d9591)), closes [#2666](https://github.com/ionic-team/capacitor/issues/2666)
- feat(android): make AppRestoredResult also returns error info and success boolean (#2497) ([b650880](https://github.com/ionic-team/capacitor/commit/b650880)), closes [#2497](https://github.com/ionic-team/capacitor/issues/2497)
- feat(android): Make Bridge.restoreInstanceState() public (#2538) ([7020f1f](https://github.com/ionic-team/capacitor/commit/7020f1f)), closes [#2538](https://github.com/ionic-team/capacitor/issues/2538)
- feat(android): make JSObject.getString return null instead of 'null' string (#2602) ([52069b7](https://github.com/ionic-team/capacitor/commit/52069b7)), closes [#2602](https://github.com/ionic-team/capacitor/issues/2602)
- feat(android): Make variables.gradle file not mandatory (#2600) ([4fc5039](https://github.com/ionic-team/capacitor/commit/4fc5039)), closes [#2600](https://github.com/ionic-team/capacitor/issues/2600)
- feat(android): provide WebViewClient accessor (#2477) ([dd3875b](https://github.com/ionic-team/capacitor/commit/dd3875b)), closes [#2477](https://github.com/ionic-team/capacitor/issues/2477)
- feat(android): update gradle and dependencies (#2431) ([6598752](https://github.com/ionic-team/capacitor/commit/6598752)), closes [#2431](https://github.com/ionic-team/capacitor/issues/2431)
- feat(android): use common variables for config and dependencies (#2534) ([d1009bb](https://github.com/ionic-team/capacitor/commit/d1009bb)), closes [#2534](https://github.com/ionic-team/capacitor/issues/2534)
- feat(android): use Fused Location Provider on Geolocation plugin (#2409) ([7faec79](https://github.com/ionic-team/capacitor/commit/7faec79)), closes [#2409](https://github.com/ionic-team/capacitor/issues/2409)
- feat(App): Add getState method to check current app state (#2611) ([f20bf29](https://github.com/ionic-team/capacitor/commit/f20bf29)), closes [#2611](https://github.com/ionic-team/capacitor/issues/2611)
- feat(camera): unify saveToGallery behavior (#2671) ([2185833](https://github.com/ionic-team/capacitor/commit/2185833)), closes [#2671](https://github.com/ionic-team/capacitor/issues/2671)
- feat(camera): Unify saveToGallery default value to false (#2557) ([d222226](https://github.com/ionic-team/capacitor/commit/d222226)), closes [#2557](https://github.com/ionic-team/capacitor/issues/2557)
- feat(cli): make init use values from capacitor.config.json as defaults (#2620) ([9157e1f](https://github.com/ionic-team/capacitor/commit/9157e1f)), closes [#2620](https://github.com/ionic-team/capacitor/issues/2620)
- feat(cli): use name from package.json as default name (#2621) ([e9bec42](https://github.com/ionic-team/capacitor/commit/e9bec42)), closes [#2621](https://github.com/ionic-team/capacitor/issues/2621)
- feat(clipboard): allow to write images on web plugin (#2523) ([5ba2a20](https://github.com/ionic-team/capacitor/commit/5ba2a20)), closes [#2523](https://github.com/ionic-team/capacitor/issues/2523)
- feat(clipboard): remove Clipboard.read() options (#2527) ([2209113](https://github.com/ionic-team/capacitor/commit/2209113)), closes [#2527](https://github.com/ionic-team/capacitor/issues/2527)
- feat(Device): Add getBatteryInfo function (#2435) ([0deca04](https://github.com/ionic-team/capacitor/commit/0deca04)), closes [#2435](https://github.com/ionic-team/capacitor/issues/2435)
- feat(electron): Remove injectCapacitor function (#2415) ([d17f0be](https://github.com/ionic-team/capacitor/commit/d17f0be)), closes [#2415](https://github.com/ionic-team/capacitor/issues/2415)
- feat(Filesystem): add recursive option to writeFile (#2487) ([53211a3](https://github.com/ionic-team/capacitor/commit/53211a3)), closes [#2487](https://github.com/ionic-team/capacitor/issues/2487)
- feat(Filesystem): make writeFile return the file uri (#2484) ([e1a00bd](https://github.com/ionic-team/capacitor/commit/e1a00bd)), closes [#2484](https://github.com/ionic-team/capacitor/issues/2484)
- feat(Filesystem): Remove createIntermediateDirectories from MkdirOptions (#2410) ([dae3510](https://github.com/ionic-team/capacitor/commit/dae3510)), closes [#2410](https://github.com/ionic-team/capacitor/issues/2410)
- feat(Filesystem): remove FilesystemDirectory.Application (#2514) ([cd395d2](https://github.com/ionic-team/capacitor/commit/cd395d2)), closes [#2514](https://github.com/ionic-team/capacitor/issues/2514)
- feat(ios): add device name to Device.getInfo() (#2491) ([4fb244d](https://github.com/ionic-team/capacitor/commit/4fb244d)), closes [#2491](https://github.com/ionic-team/capacitor/issues/2491)
- feat(ios): add presentVC and dismissVC methods to bridge (#2678) ([a6c91da](https://github.com/ionic-team/capacitor/commit/a6c91da)), closes [#2678](https://github.com/ionic-team/capacitor/issues/2678)
- feat(ios): allow to set status bar animation style on show and hide (#2587) ([fa6bb3e](https://github.com/ionic-team/capacitor/commit/fa6bb3e)), closes [#2587](https://github.com/ionic-team/capacitor/issues/2587)
- feat(ios): change native location accuracy values (#2420) ([16c3ea1](https://github.com/ionic-team/capacitor/commit/16c3ea1)), closes [#2420](https://github.com/ionic-team/capacitor/issues/2420)
- feat(ios): Update Capacitor project to Swift 5.0 (#2465) ([c895fc4](https://github.com/ionic-team/capacitor/commit/c895fc4)), closes [#2465](https://github.com/ionic-team/capacitor/issues/2465)
- feat(LocalNotifications): add createChannel, deleteChannel and listChannels methods (#2676) ([d72e25d](https://github.com/ionic-team/capacitor/commit/d72e25d)), closes [#2676](https://github.com/ionic-team/capacitor/issues/2676)
- feat(LocalNotifications): Allow to create notifications without activity (#2648) ([a4e5918](https://github.com/ionic-team/capacitor/commit/a4e5918)), closes [#2648](https://github.com/ionic-team/capacitor/issues/2648)
- feat(modals): add inputText property to prompt for prefilled text (#2475) ([a05311d](https://github.com/ionic-team/capacitor/commit/a05311d)), closes [#2475](https://github.com/ionic-team/capacitor/issues/2475)
- feat(PushNotifications): Make register method return if permission was granted (#2324) ([a0bcf5c](https://github.com/ionic-team/capacitor/commit/a0bcf5c)), closes [#2324](https://github.com/ionic-team/capacitor/issues/2324)

### Docs

- updated local notification config docs (#2601) ([9997b3e](https://github.com/ionic-team/capacitor/commit/9997b3e)), closes [#2601](https://github.com/ionic-team/capacitor/issues/2601)
- docs: fix Local Notifications url (#2542) ([a3a19b3](https://github.com/ionic-team/capacitor/commit/a3a19b3)), closes [#2542](https://github.com/ionic-team/capacitor/issues/2542)
- docs: update default cordovaSwiftVersion (#2466) ([4908bbb](https://github.com/ionic-team/capacitor/commit/4908bbb)), closes [#2466](https://github.com/ionic-team/capacitor/issues/2466)
- docs: update Filesystem.writeFile sample (#2568) ([5122527](https://github.com/ionic-team/capacitor/commit/5122527)), closes [#2568](https://github.com/ionic-team/capacitor/issues/2568)
- docs(android): Add update guide for Capacitor 2.0 beta (#2572) ([0f0ed25](https://github.com/ionic-team/capacitor/commit/0f0ed25)), closes [#2572](https://github.com/ionic-team/capacitor/issues/2572)
- docs(camera): add missing usage descriptions needed in iOS (#2633) ([7692ee4](https://github.com/ionic-team/capacitor/commit/7692ee4)), closes [#2633](https://github.com/ionic-team/capacitor/issues/2633)
- docs(ce-guides): Remove dead link (#2418) ([a1b6403](https://github.com/ionic-team/capacitor/commit/a1b6403)), closes [#2418](https://github.com/ionic-team/capacitor/issues/2418)
- docs(ce-plugins): Add capacitor-dark-mode plugin (#2681) ([4fcb725](https://github.com/ionic-team/capacitor/commit/4fcb725)), closes [#2681](https://github.com/ionic-team/capacitor/issues/2681)
- docs(ce-plugins): add capacitor-healthkit (#2489) ([9e356db](https://github.com/ionic-team/capacitor/commit/9e356db)), closes [#2489](https://github.com/ionic-team/capacitor/issues/2489)
- docs(ce-plugins): Add SQLite, SQLite Storage and Video Player plugins (#2589) ([78a28da](https://github.com/ionic-team/capacitor/commit/78a28da)), closes [#2589](https://github.com/ionic-team/capacitor/issues/2589)
- docs(ce-plugins): Remove or replace deprecated plugins (#2419) ([dfc1ed6](https://github.com/ionic-team/capacitor/commit/dfc1ed6)), closes [#2419](https://github.com/ionic-team/capacitor/issues/2419)
- docs(clipboard): update read example removing options (#2564) ([49e9f8d](https://github.com/ionic-team/capacitor/commit/49e9f8d)), closes [#2564](https://github.com/ionic-team/capacitor/issues/2564)
- docs(contributing): Update docs contributing readme (#2592) ([0799d52](https://github.com/ionic-team/capacitor/commit/0799d52)), closes [#2592](https://github.com/ionic-team/capacitor/issues/2592)
- docs(dependencies): update to latest Capacitor (#2599) ([0154f51](https://github.com/ionic-team/capacitor/commit/0154f51)), closes [#2599](https://github.com/ionic-team/capacitor/issues/2599)
- docs(Device): fix getInfo response and add getBatteryInfo example (#2569) ([057512a](https://github.com/ionic-team/capacitor/commit/057512a)), closes [#2569](https://github.com/ionic-team/capacitor/issues/2569)
- docs(firebase-guide): update guide with Capacitor 2.0 changes (#2598) ([4f0e749](https://github.com/ionic-team/capacitor/commit/4f0e749)), closes [#2598](https://github.com/ionic-team/capacitor/issues/2598)
- docs(guides): Add new Deep Links guide (#2581) ([b9e25f3](https://github.com/ionic-team/capacitor/commit/b9e25f3)), closes [#2581](https://github.com/ionic-team/capacitor/issues/2581)
- docs(ios): Add update guide for Capacitor 2.0 beta (#2571) ([ca0baf7](https://github.com/ionic-team/capacitor/commit/ca0baf7)), closes [#2571](https://github.com/ionic-team/capacitor/issues/2571)
- docs(ios): Document hideLogs config option (#2619) ([23b2173](https://github.com/ionic-team/capacitor/commit/23b2173)), closes [#2619](https://github.com/ionic-team/capacitor/issues/2619)
- docs(LocalNotifications): Update schedule sample (#2570) ([00d313f](https://github.com/ionic-team/capacitor/commit/00d313f)), closes [#2570](https://github.com/ionic-team/capacitor/issues/2570)
- docs(network): Remove example guide because of dead link (#2417) ([2364505](https://github.com/ionic-team/capacitor/commit/2364505)), closes [#2417](https://github.com/ionic-team/capacitor/issues/2417)
- docs(permissions): Display permissions page on side menu (#2684) ([1ccc3c0](https://github.com/ionic-team/capacitor/commit/1ccc3c0)), closes [#2684](https://github.com/ionic-team/capacitor/issues/2684)
- docs(site): Add target blank to external links in site header (#2543) ([f6c2288](https://github.com/ionic-team/capacitor/commit/f6c2288)), closes [#2543](https://github.com/ionic-team/capacitor/issues/2543)
- docs(Splash): document splashFullScreen and splashImmersive config options (#2613) ([c381202](https://github.com/ionic-team/capacitor/commit/c381202)), closes [#2613](https://github.com/ionic-team/capacitor/issues/2613)
- docs(StatusBar): Fix typo in setOverlaysWebView usage (#2673) ([05f23fb](https://github.com/ionic-team/capacitor/commit/05f23fb)), closes [#2673](https://github.com/ionic-team/capacitor/issues/2673)
- docs(types): explain FilesystemDirectory types (#2663) ([6a6cd8b](https://github.com/ionic-team/capacitor/commit/6a6cd8b)), closes [#2663](https://github.com/ionic-team/capacitor/issues/2663)
- docs(update guide): fix targetSdkVersion instructions (#2585) ([0b4ade8](https://github.com/ionic-team/capacitor/commit/0b4ade8)), closes [#2585](https://github.com/ionic-team/capacitor/issues/2585)
- docs(updating): Include beta 1 updating steps (#2629) ([ece7c47](https://github.com/ionic-team/capacitor/commit/ece7c47)), closes [#2629](https://github.com/ionic-team/capacitor/issues/2629)

### Chores

- chore: make deploy script publish Android before iOS (#2520) ([08a2ebc](https://github.com/ionic-team/capacitor/commit/08a2ebc)), closes [#2520](https://github.com/ionic-team/capacitor/issues/2520)
- chore: update electron core dependency ([a37d1bf](https://github.com/ionic-team/capacitor/commit/a37d1bf))
- chore(android): remove unused launch_splash.xml (#2411) ([8c9fe93](https://github.com/ionic-team/capacitor/commit/8c9fe93)), closes [#2411](https://github.com/ionic-team/capacitor/issues/2411)
- chore(android): target SDK version 29 (#2433) ([4ff1943](https://github.com/ionic-team/capacitor/commit/4ff1943)), closes [#2433](https://github.com/ionic-team/capacitor/issues/2433)
- chore(android): Update to latest Gradle plugin and wrapper (#2573) ([221ce96](https://github.com/ionic-team/capacitor/commit/221ce96)), closes [#2573](https://github.com/ionic-team/capacitor/issues/2573)
- chore(android): use AndroidX to build ([1480a6f](https://github.com/ionic-team/capacitor/commit/1480a6f))
- chore(circleci): update Xcode and remove install-cocoapods job (#2402) ([599c5c4](https://github.com/ionic-team/capacitor/commit/599c5c4)), closes [#2402](https://github.com/ionic-team/capacitor/issues/2402)
- chore(cli): fix lint errors (#2479) ([f2ff5ab](https://github.com/ionic-team/capacitor/commit/f2ff5ab)), closes [#2479](https://github.com/ionic-team/capacitor/issues/2479)
- chore(cli): fix tests for newer node versions (#2403) ([c40d993](https://github.com/ionic-team/capacitor/commit/c40d993)), closes [#2403](https://github.com/ionic-team/capacitor/issues/2403)
- chore(dependencies): Update package dependencies to 2.0.0 (#2686) ([d708cfd](https://github.com/ionic-team/capacitor/commit/d708cfd)), closes [#2686](https://github.com/ionic-team/capacitor/issues/2686)
- chore(electron): update template to use latest electron (#2492) ([178eb65](https://github.com/ionic-team/capacitor/commit/178eb65)), closes [#2492](https://github.com/ionic-team/capacitor/issues/2492)
- chore(example): Fix Clipboard.read() (#2546) ([6b88ba8](https://github.com/ionic-team/capacitor/commit/6b88ba8)), closes [#2546](https://github.com/ionic-team/capacitor/issues/2546)
- chore(example): update electron project to work with latest capacitor (#2485) ([09fff9b](https://github.com/ionic-team/capacitor/commit/09fff9b)), closes [#2485](https://github.com/ionic-team/capacitor/issues/2485)
- chore(ios): add platform to Podfile (#2463) ([209e649](https://github.com/ionic-team/capacitor/commit/209e649)), closes [#2463](https://github.com/ionic-team/capacitor/issues/2463)
- chore(ios): drop Xcode 10 support (#2472) ([255a046](https://github.com/ionic-team/capacitor/commit/255a046)), closes [#2472](https://github.com/ionic-team/capacitor/issues/2472)
- chore(ios): remove deprecated .swift_version file (#2464) ([63e942e](https://github.com/ionic-team/capacitor/commit/63e942e)), closes [#2464](https://github.com/ionic-team/capacitor/issues/2464)
- chore(ios): Update app template to use iOS 5 (#2467) ([f2facf6](https://github.com/ionic-team/capacitor/commit/f2facf6)), closes [#2467](https://github.com/ionic-team/capacitor/issues/2467)
- chore(ios): update example app to use Swift 5 (#2471) ([afd8554](https://github.com/ionic-team/capacitor/commit/afd8554)), closes [#2471](https://github.com/ionic-team/capacitor/issues/2471)
- chore(ios): Update plugin template to Swift 5 (#2468) ([2f9c8e6](https://github.com/ionic-team/capacitor/commit/2f9c8e6)), closes [#2468](https://github.com/ionic-team/capacitor/issues/2468)
- chore(tests): run lint on circleci (#2480) ([2ec6cf5](https://github.com/ionic-team/capacitor/commit/2ec6cf5)), closes [#2480](https://github.com/ionic-team/capacitor/issues/2480)
