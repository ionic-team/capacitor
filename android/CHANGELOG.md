# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/6.0.0-beta.1...6.0.0-beta.2) (2023-12-14)

**Note:** Version bump only for package @capacitor/android

# [6.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/6.0.0-beta.0...6.0.0-beta.1) (2023-12-14)

**Note:** Version bump only for package @capacitor/android

# [6.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/6.0.0-alpha.2...6.0.0-beta.0) (2023-12-13)

### Bug Fixes

- **http:** parse readablestream data on fetch request objects ([#6919](https://github.com/ionic-team/capacitor/issues/6919)) ([80ec3b7](https://github.com/ionic-team/capacitor/commit/80ec3b73db18b7b6841bf90ed50a67389946ab87))
- **http:** properly write form-urlencoded data on android request body ([#7001](https://github.com/ionic-team/capacitor/issues/7001)) ([a986ee5](https://github.com/ionic-team/capacitor/commit/a986ee541f54a1d3ac637b514fe547b224b36903))

### Features

- support for Amazon Fire WebView ([#6603](https://github.com/ionic-team/capacitor/issues/6603)) ([3cb4eb8](https://github.com/ionic-team/capacitor/commit/3cb4eb89632bce8dc872418fdb130bfd4de40b68))

# [6.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/6.0.0-alpha.1...6.0.0-alpha.2) (2023-11-15)

**Note:** Version bump only for package @capacitor/android

# [6.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/5.2.3...6.0.0-alpha.1) (2023-11-08)

### Bug Fixes

- **android:** handle webview version for developer builds ([#6907](https://github.com/ionic-team/capacitor/issues/6907)) ([88498e6](https://github.com/ionic-team/capacitor/commit/88498e6228492a9ae917d3a7b37c242881f9fe52))
- **android:** make local urls use unpatched fetch ([#6953](https://github.com/ionic-team/capacitor/issues/6953)) ([e50e56c](https://github.com/ionic-team/capacitor/commit/e50e56c5231f230497d1bd420e02e2e065c38f86))
- **android:** Use Logger class instead of Log in CapacitorCookieManager ([#6923](https://github.com/ionic-team/capacitor/issues/6923)) ([8aaa356](https://github.com/ionic-team/capacitor/commit/8aaa356ab1f14b56df821e8ac0bb7e43bfa094fa))
- **cookies:** remove session cookies when initializing the cookie manager ([037863b](https://github.com/ionic-team/capacitor/commit/037863bea6f3a00978125dc2f8ecba1e896c0740))
- **http:** add support for Request objects in fetch ([24b3cc1](https://github.com/ionic-team/capacitor/commit/24b3cc113e3d8aae5d85dbf2d25bec0c35136477))
- **http:** disconnect active connections if call or bridge is destroyed ([a1ed6cc](https://github.com/ionic-team/capacitor/commit/a1ed6cc6f07465d683b95e3796d944f863a7b857))
- **http:** inherit object properties on window.XMLHttpRequest ([91c11d0](https://github.com/ionic-team/capacitor/commit/91c11d06f773c45a10f6f2d52f672ae6f189b162))
- **http:** return numbers and booleans as-is when application/json is the content type ([03dd3f9](https://github.com/ionic-team/capacitor/commit/03dd3f96c7ee75b6fff2b7c40d0c9a58fb04fce5))

### Features

- **android:** allow developers to provide logic for onRenderProcessGone in WebViewListener ([#6966](https://github.com/ionic-team/capacitor/issues/6966)) ([79e17bb](https://github.com/ionic-team/capacitor/commit/79e17bb5e6ccd813bddc626703152d3983f6d93b))

## [5.5.1](https://github.com/ionic-team/capacitor/compare/5.5.0...5.5.1) (2023-10-25)

**Note:** Version bump only for package @capacitor/android

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
- **cookies:** retrieve cookies when using a custom android scheme ([6b5ddad](https://github.com/ionic-team/capacitor/commit/6b5ddad8b36e33ef4171f6da5cc311ed3f634ac6))
- **http:** parse readablestream data on fetch request objects ([3fe0642](https://github.com/ionic-team/capacitor/commit/3fe06426bd20713e2322780b70bc5d97ad371fae))
- **http:** return xhr response headers case insensitive ([687b6b1](https://github.com/ionic-team/capacitor/commit/687b6b1780506c17fb73ed1d9cbf50c1d1e40ef1))

# [5.4.0](https://github.com/ionic-team/capacitor/compare/5.3.0...5.4.0) (2023-09-14)

### Bug Fixes

- **http:** add support for defining xhr and angular http response types ([09bd040](https://github.com/ionic-team/capacitor/commit/09bd040dfe4b8808d7499b6ee592005420406cac))
- **http:** add support for Request objects in fetch ([2fe4535](https://github.com/ionic-team/capacitor/commit/2fe4535e781b1a5cfa0f3359c1afa5c360073b6a))
- **http:** inherit object properties on window.XMLHttpRequest ([5cd3b2f](https://github.com/ionic-team/capacitor/commit/5cd3b2fa6d6936864e1aab2e98963df2d4da3b95))

# [5.3.0](https://github.com/ionic-team/capacitor/compare/5.2.3...5.3.0) (2023-08-23)

### Bug Fixes

- **cookies:** remove session cookies when initializing the cookie manager ([037863b](https://github.com/ionic-team/capacitor/commit/037863bea6f3a00978125dc2f8ecba1e896c0740))
- **http:** disconnect active connections if call or bridge is destroyed ([a1ed6cc](https://github.com/ionic-team/capacitor/commit/a1ed6cc6f07465d683b95e3796d944f863a7b857))
- **http:** return numbers and booleans as-is when application/json is the content type ([03dd3f9](https://github.com/ionic-team/capacitor/commit/03dd3f96c7ee75b6fff2b7c40d0c9a58fb04fce5))

## [5.2.3](https://github.com/ionic-team/capacitor/compare/5.2.2...5.2.3) (2023-08-10)

### Bug Fixes

- **android:** allow single input file selection from samsumg gallery ([#6778](https://github.com/ionic-team/capacitor/issues/6778)) ([3d57ecd](https://github.com/ionic-team/capacitor/commit/3d57ecdf7631d1581047bd5d9f86ea657ecad845))
- **android:** avoid R8 optimizations remove plugin classes ([#6783](https://github.com/ionic-team/capacitor/issues/6783)) ([cc85df5](https://github.com/ionic-team/capacitor/commit/cc85df5f3a6999883623054573bafc30665e41e7))
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

- **cookies:** sanitize url before retrieving/setting cookies ([ca40634](https://github.com/ionic-team/capacitor/commit/ca4063471f215d3f7525e51592d9c72138a52855))
- **http:** fire events in correct order when using xhr ([5ed3617](https://github.com/ionic-team/capacitor/commit/5ed361787596bb5949f6ae5e366495f296352bf3))

### Features

- **http:** support for FormData requests ([#6708](https://github.com/ionic-team/capacitor/issues/6708)) ([849c564](https://github.com/ionic-team/capacitor/commit/849c56458205bea3b078b1ee19807d7fd84c47b1))

## [5.1.1](https://github.com/ionic-team/capacitor/compare/5.1.0...5.1.1) (2023-07-05)

**Note:** Version bump only for package @capacitor/android

# [5.1.0](https://github.com/ionic-team/capacitor/compare/5.0.5...5.1.0) (2023-06-29)

### Bug Fixes

- **android:** Move bridge localUrl initialization to initWebView ([#6685](https://github.com/ionic-team/capacitor/issues/6685)) ([7f5f0ca](https://github.com/ionic-team/capacitor/commit/7f5f0ca4220d40d6a19c778c18f9534ef3b65899))
- **android:** revert cookie manager initialization to plugin load ([53a2d47](https://github.com/ionic-team/capacitor/commit/53a2d4792e026a89723a672a01fc34990add71f0))

### Features

- **android:** add check for excluded domains before ssl request ([7906d36](https://github.com/ionic-team/capacitor/commit/7906d3616e8bfb2e2c1c81ee123424c06fc4e5ab))

## [5.0.5](https://github.com/ionic-team/capacitor/compare/5.0.4...5.0.5) (2023-06-09)

### Bug Fixes

- **http:** don't throw errors when content-type is null on response ([#6627](https://github.com/ionic-team/capacitor/issues/6627)) ([538821f](https://github.com/ionic-team/capacitor/commit/538821f267aa3b79548fed6aaea8880ff949ffdd))

## [5.0.4](https://github.com/ionic-team/capacitor/compare/5.0.3...5.0.4) (2023-05-23)

**Note:** Version bump only for package @capacitor/android

## [5.0.3](https://github.com/ionic-team/capacitor/compare/5.0.2...5.0.3) (2023-05-10)

**Note:** Version bump only for package @capacitor/android

## [5.0.2](https://github.com/ionic-team/capacitor/compare/5.0.1...5.0.2) (2023-05-09)

**Note:** Version bump only for package @capacitor/android

## [5.0.1](https://github.com/ionic-team/capacitor/compare/5.0.0...5.0.1) (2023-05-05)

**Note:** Version bump only for package @capacitor/android

# [5.0.0](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.3...5.0.0) (2023-05-03)

**Note:** Version bump only for package @capacitor/android

# [5.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.2...5.0.0-rc.3) (2023-05-03)

**Note:** Version bump only for package @capacitor/android

# [5.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.1...5.0.0-rc.2) (2023-05-03)

**Note:** Version bump only for package @capacitor/android

# [5.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.0...5.0.0-rc.1) (2023-05-02)

**Note:** Version bump only for package @capacitor/android

# [5.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.3...5.0.0-rc.0) (2023-05-01)

**Note:** Version bump only for package @capacitor/android

# [5.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.2...5.0.0-beta.3) (2023-04-21)

### Bug Fixes

- **cookies:** init cookie manager after server url is set ([0ee772f](https://github.com/ionic-team/capacitor/commit/0ee772ff6456ad0948a0dd025dfcf2658a5563a0))

### Features

- **android:** update gradle to 8.0.2 and gradle plugin to 8.0.0 ([#6497](https://github.com/ionic-team/capacitor/issues/6497)) ([01b5b39](https://github.com/ionic-team/capacitor/commit/01b5b399324ae5d0896989478a6910fb946542d7))

# [5.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.1...5.0.0-beta.2) (2023-04-13)

### Bug Fixes

- **android:** launching intents without host ([#6489](https://github.com/ionic-team/capacitor/issues/6489)) ([95f7474](https://github.com/ionic-team/capacitor/commit/95f747401ac5a666de4338a18666060e9c1ff39e))
- **android:** unify kotlin dependency version ([#6501](https://github.com/ionic-team/capacitor/issues/6501)) ([0a40477](https://github.com/ionic-team/capacitor/commit/0a4047768cbde9bc17d92955e64ab11d2e3b3335))
- **cookies:** check isEnabled before setting cookieHandler ([bb04f24](https://github.com/ionic-team/capacitor/commit/bb04f24f0b4a99e46ed5ca047d3d3df81804d516))
- **ios/android:** copy url from nativeResponse to response ([#6482](https://github.com/ionic-team/capacitor/issues/6482)) ([828fb71](https://github.com/ionic-team/capacitor/commit/828fb71ebb52c0655d5879ad0edaac7368ab2b96))
- remove accept-charset ([#6386](https://github.com/ionic-team/capacitor/issues/6386)) ([bbf6f7e](https://github.com/ionic-team/capacitor/commit/bbf6f7e1af0c49c0bc917942b6715c613be3f557))

# [5.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.0...5.0.0-beta.1) (2023-04-03)

**Note:** Version bump only for package @capacitor/android

# [5.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/5.0.0-alpha.1...5.0.0-beta.0) (2023-03-31)

### Bug Fixes

- 204 http response ([#6266](https://github.com/ionic-team/capacitor/issues/6266)) ([771f6ce](https://github.com/ionic-team/capacitor/commit/771f6ce1f35159848db218a42dc4f56b5106f750))
- **android:** Allow WebView to load data urls ([#6418](https://github.com/ionic-team/capacitor/issues/6418)) ([daf2ec6](https://github.com/ionic-team/capacitor/commit/daf2ec64df0c567c6a42560488e5d2515eff8a33))
- **android:** proper app url check for launching intents ([#6450](https://github.com/ionic-team/capacitor/issues/6450)) ([302ba35](https://github.com/ionic-team/capacitor/commit/302ba353acbd6d67e96e2b28870bc9c5bb4e9af0))
- **android:** remove stored references to bridge that holds it in memory ([#6448](https://github.com/ionic-team/capacitor/issues/6448)) ([4737d2b](https://github.com/ionic-team/capacitor/commit/4737d2b46b480c7c0246ac6414494cbbdac7811b))

### Features

- **android:** Fix for [#6258](https://github.com/ionic-team/capacitor/issues/6258), Add support for modern Huawei devices ([#6402](https://github.com/ionic-team/capacitor/issues/6402)) ([17f2f4a](https://github.com/ionic-team/capacitor/commit/17f2f4ac744a038c1dae3cbd74a670d5ede92ef3))
- retain multiple calls per event until consumed ([#6419](https://github.com/ionic-team/capacitor/issues/6419)) ([5aba2cb](https://github.com/ionic-team/capacitor/commit/5aba2cbe29bdbab2a7af861c65d8323acf9c54a6))

# [5.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/4.7.0...5.0.0-alpha.1) (2023-03-16)

### Bug Fixes

- **android:** handle empty permission list ([#6375](https://github.com/ionic-team/capacitor/issues/6375)) ([b11a9df](https://github.com/ionic-team/capacitor/commit/b11a9df070f18a25364a9109e295556fc75ea7f9))
- **android:** handle null http headers and params ([#6370](https://github.com/ionic-team/capacitor/issues/6370)) ([e486672](https://github.com/ionic-team/capacitor/commit/e486672731818d5c64c50956562aa4766f169d41))
- **android:** solve and/or silence lint errors ([#6358](https://github.com/ionic-team/capacitor/issues/6358)) ([c627415](https://github.com/ionic-team/capacitor/commit/c627415743bec92dcb65ab8b8840003d8c0a5286))

### Features

- **android:** Removing enableJetifier ([#6333](https://github.com/ionic-team/capacitor/issues/6333)) ([fc0b403](https://github.com/ionic-team/capacitor/commit/fc0b403265f63eab35cdb2f262fb1e047db4b6bd))

# [4.7.0](https://github.com/ionic-team/capacitor/compare/4.6.3...4.7.0) (2023-02-22)

### Bug Fixes

- handle fetch headers that are Headers objects ([#6320](https://github.com/ionic-team/capacitor/issues/6320)) ([cb00e49](https://github.com/ionic-team/capacitor/commit/cb00e4952acca8e877555f30b2190f6685d25934))
- **ios:** Correctly Attach Headers to Request ([#6303](https://github.com/ionic-team/capacitor/issues/6303)) ([a3f875c](https://github.com/ionic-team/capacitor/commit/a3f875cf42e111fde07d6e87643264b19ed77573))

### Features

- **android:** add ability to create config from a custom file path ([#6264](https://github.com/ionic-team/capacitor/issues/6264)) ([42b4f0f](https://github.com/ionic-team/capacitor/commit/42b4f0f416c8038ae368860007910bb09c8ec84e))
- **android:** Add SSL Pinning logic ([#6314](https://github.com/ionic-team/capacitor/issues/6314)) ([07f113e](https://github.com/ionic-team/capacitor/commit/07f113e6933e15c45d772f69f7128cbb3706f7b9))
- **android:** enable loading of assets outside of the content web asset directory ([#6301](https://github.com/ionic-team/capacitor/issues/6301)) ([364497d](https://github.com/ionic-team/capacitor/commit/364497d4aca93fc716a0673ef9103479aed791ec))

## [4.6.3](https://github.com/ionic-team/capacitor/compare/4.6.2...4.6.3) (2023-02-03)

### Bug Fixes

- **ios:** crash when http headers contain numbers ([#6251](https://github.com/ionic-team/capacitor/issues/6251)) ([028c556](https://github.com/ionic-team/capacitor/commit/028c556a50b41ee99fe8f4f1aa2f42d3fd57f92d))

## [4.6.2](https://github.com/ionic-team/capacitor/compare/4.6.1...4.6.2) (2023-01-17)

### Bug Fixes

- **android:** get application/x-www-form-urlencoded as string ([#6165](https://github.com/ionic-team/capacitor/issues/6165)) ([0735e89](https://github.com/ionic-team/capacitor/commit/0735e89d48e77a1ddca97a48e3851f4a0a3ea2c1))
- **ios/android:** better http error handling ([#6208](https://github.com/ionic-team/capacitor/issues/6208)) ([7d4d70a](https://github.com/ionic-team/capacitor/commit/7d4d70a0500b7996c710c0762907f44bdf27c92b))

## [4.6.1](https://github.com/ionic-team/capacitor/compare/4.6.0...4.6.1) (2022-12-05)

**Note:** Version bump only for package @capacitor/android

# [4.6.0](https://github.com/ionic-team/capacitor/compare/4.5.0...4.6.0) (2022-12-01)

### Bug Fixes

- **android:** Don't run Cordova plugins on ui thread ([#6108](https://github.com/ionic-team/capacitor/issues/6108)) ([592ee86](https://github.com/ionic-team/capacitor/commit/592ee862a58f5cb0737620a0246fe8ae295d27cf))
- **cookies:** Use Set-Cookie headers to persist cookies ([57f8b39](https://github.com/ionic-team/capacitor/commit/57f8b39d7f4c5ee0e5e5cb316913e9450a81d22b))

### Features

- **android:** Plugin Instance Support ([#6073](https://github.com/ionic-team/capacitor/issues/6073)) ([3d5b7c2](https://github.com/ionic-team/capacitor/commit/3d5b7c2d372cf764c625f46d1e8761e05b8959da))

# [4.5.0](https://github.com/ionic-team/capacitor/compare/4.4.0...4.5.0) (2022-11-16)

### Bug Fixes

- **android:** Silence deprecation warning on handlePermissionResult ([#6092](https://github.com/ionic-team/capacitor/issues/6092)) ([888b13e](https://github.com/ionic-team/capacitor/commit/888b13e89c48dab949b38135a3ec443ac4fd852e))

### Features

- **android/cli:** Allow to use the old addJavascriptInterface bridge ([#6043](https://github.com/ionic-team/capacitor/issues/6043)) ([a6e7c54](https://github.com/ionic-team/capacitor/commit/a6e7c5422687b703492a5fcc49369eacc376143d))
- **cookies:** add get cookies plugin method ([ba1e770](https://github.com/ionic-team/capacitor/commit/ba1e7702a3338714aee24388c0afea39706c9341))

# [4.4.0](https://github.com/ionic-team/capacitor/compare/4.3.0...4.4.0) (2022-10-21)

### Bug Fixes

- **android:** added ServerPath object and building options for setting initial load from portals ([#6008](https://github.com/ionic-team/capacitor/issues/6008)) ([205b6e6](https://github.com/ionic-team/capacitor/commit/205b6e61806158244846608b1e6c0c7b26ee4ab7))
- **cookies:** make document.cookie setter synchronous ([2272abf](https://github.com/ionic-team/capacitor/commit/2272abf3d3d9dc82d9ca0d03b17e2b78f11f61fc))
- **http:** fix exception thrown on 204 responses ([1f6e8be](https://github.com/ionic-team/capacitor/commit/1f6e8be9d8813c4397e2c54ac4c06beb55f97b5f))
- **http:** fix local http requests on native platforms ([c4e040a](https://github.com/ionic-team/capacitor/commit/c4e040a6f8c6b54bac6ae320e5f0f008604fe50f))

# [4.3.0](https://github.com/ionic-team/capacitor/compare/4.2.0...4.3.0) (2022-09-21)

### Bug Fixes

- **android:** open external links in browser ([#5913](https://github.com/ionic-team/capacitor/issues/5913)) ([7553ede](https://github.com/ionic-team/capacitor/commit/7553ede93170971e21ab3dec1798443d084ead2a))
- **android:** set all cookies on proxied requests ([#5781](https://github.com/ionic-team/capacitor/issues/5781)) ([5ef6a38](https://github.com/ionic-team/capacitor/commit/5ef6a3889121dd39a9159ff80250df18854bc557))
- **android:** set WebViewClient on the WebView ([#5919](https://github.com/ionic-team/capacitor/issues/5919)) ([020ed8e](https://github.com/ionic-team/capacitor/commit/020ed8eaeb7864399d4b93f54ab7601c607d8e0d))
- **core:** Exception object was not set on Cap ([#5917](https://github.com/ionic-team/capacitor/issues/5917)) ([9ca27a4](https://github.com/ionic-team/capacitor/commit/9ca27a4f8441b368f8bf9d97dda57b1a55ac0e4e))

### Features

- Capacitor Cookies & Capacitor Http core plugins ([d4047cf](https://github.com/ionic-team/capacitor/commit/d4047cfa947676777f400389a8d65defae140b45))

# [4.2.0](https://github.com/ionic-team/capacitor/compare/4.1.0...4.2.0) (2022-09-08)

**Note:** Version bump only for package @capacitor/android

## [4.1.0](https://github.com/ionic-team/capacitor/compare/4.0.1...4.1.0) (2022-08-18)

**Note:** Version bump only for package @capacitor/android

## [4.0.1](https://github.com/ionic-team/capacitor/compare/4.0.0...4.0.1) (2022-07-28)

**Note:** Version bump only for package @capacitor/android

# [4.0.0](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.2...4.0.0) (2022-07-27)

### Bug Fixes

- **android:** Publish proguard-rules.pro on npm ([#5761](https://github.com/ionic-team/capacitor/issues/5761)) ([df77103](https://github.com/ionic-team/capacitor/commit/df77103ca411fa452239099769289eeeea2404d2))

### Features

- **android:** Add android.minWebviewVersion configuration option ([#5768](https://github.com/ionic-team/capacitor/issues/5768)) ([ad83827](https://github.com/ionic-team/capacitor/commit/ad838279e9cd190ce6f1a020a0ac9e3916786324))
- **android:** Add Optional Data Param for Error Object ([#5719](https://github.com/ionic-team/capacitor/issues/5719)) ([174172b](https://github.com/ionic-team/capacitor/commit/174172b6c64dc9117c48ed0e20c25e0b6c2fb625))
- **android:** Use addWebMessageListener where available ([#5427](https://github.com/ionic-team/capacitor/issues/5427)) ([c2dfe80](https://github.com/ionic-team/capacitor/commit/c2dfe808446717412b35e82713d123b7a052f264))
- Add option for custom error page ([#5723](https://github.com/ionic-team/capacitor/issues/5723)) ([e8bdef3](https://github.com/ionic-team/capacitor/commit/e8bdef3b4634e4ad45fa8fc34c7c0ab8dfa383f3))

# [4.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.1...4.0.0-beta.2) (2022-07-08)

**Note:** Version bump only for package @capacitor/android

# [4.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.0...4.0.0-beta.1) (2022-06-27)

**Note:** Version bump only for package @capacitor/android

# [4.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.6.0...4.0.0-beta.0) (2022-06-17)

### Bug Fixes

- **android:** make removeAllListeners return a promise ([#5527](https://github.com/ionic-team/capacitor/issues/5527)) ([6f4d858](https://github.com/ionic-team/capacitor/commit/6f4d858ea879d97109c0c7da2d664d04806adc2a))
- **android:** prevent app from loading if server.url is invalid ([d4a0dea](https://github.com/ionic-team/capacitor/commit/d4a0deaa37eda4476f0be030e266c2c1260fc6e8))

### Features

- **android:** don't allow server.androidScheme to be set to schemes handled by WebView ([01285ba](https://github.com/ionic-team/capacitor/commit/01285ba253d602b08a41240ad2ccf370730d51a3))
- **android:** set default targetSDK to 31 ([#5442](https://github.com/ionic-team/capacitor/issues/5442)) ([4442459](https://github.com/ionic-team/capacitor/commit/4442459b24cdbac25cb1e4de11583d22c21452b3))
- **android:** set default targetSDK to 32 ([#5611](https://github.com/ionic-team/capacitor/issues/5611)) ([416b966](https://github.com/ionic-team/capacitor/commit/416b9662fbf6233d23216c0c0441862603c3a723))
- **android:** Upgrade gradle to 7.4 ([#5445](https://github.com/ionic-team/capacitor/issues/5445)) ([28eaf18](https://github.com/ionic-team/capacitor/commit/28eaf1851fa7a912917dbb40c68fb4dd583d08ad))
- **android:** Use java 11 ([#5552](https://github.com/ionic-team/capacitor/issues/5552)) ([e47959f](https://github.com/ionic-team/capacitor/commit/e47959fcbd6a89b97b1275a5814fdb4e7ce30672))

# [3.6.0](https://github.com/ionic-team/capacitor/compare/3.5.1...3.6.0) (2022-06-17)

### Features

- **android:** update support for Portals for Capacitor to include Live Updates ([#5660](https://github.com/ionic-team/capacitor/issues/5660)) ([62f0a5e](https://github.com/ionic-team/capacitor/commit/62f0a5eaa40776aad79dbf8f8c0900037d3cc97e))
- **iOS, Android:** add AppUUID Lib for plugins ([#5690](https://github.com/ionic-team/capacitor/issues/5690)) ([05e76cf](https://github.com/ionic-team/capacitor/commit/05e76cf526a44e07fa75f9482fa2223a13918638))

# [4.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.2) (2022-05-12)

### Bug Fixes

- **android:** make removeAllListeners return a promise ([#5527](https://github.com/ionic-team/capacitor/issues/5527)) ([6f4d858](https://github.com/ionic-team/capacitor/commit/6f4d858ea879d97109c0c7da2d664d04806adc2a))
- **android:** prevent app from loading if server.url is invalid ([d4a0dea](https://github.com/ionic-team/capacitor/commit/d4a0deaa37eda4476f0be030e266c2c1260fc6e8))

### Features

- **android:** don't allow server.androidScheme to be set to schemes handled by WebView ([01285ba](https://github.com/ionic-team/capacitor/commit/01285ba253d602b08a41240ad2ccf370730d51a3))
- **android:** set default targetSDK to 31 ([#5442](https://github.com/ionic-team/capacitor/issues/5442)) ([4442459](https://github.com/ionic-team/capacitor/commit/4442459b24cdbac25cb1e4de11583d22c21452b3))
- **android:** Upgrade gradle to 7.4 ([#5445](https://github.com/ionic-team/capacitor/issues/5445)) ([28eaf18](https://github.com/ionic-team/capacitor/commit/28eaf1851fa7a912917dbb40c68fb4dd583d08ad))
- **android:** Use java 11 ([#5552](https://github.com/ionic-team/capacitor/issues/5552)) ([e47959f](https://github.com/ionic-team/capacitor/commit/e47959fcbd6a89b97b1275a5814fdb4e7ce30672))

## [3.5.1](https://github.com/ionic-team/capacitor/compare/3.5.0...3.5.1) (2022-05-04)

### Bug Fixes

- **android:** move initialFocus on webview into config ([#5579](https://github.com/ionic-team/capacitor/issues/5579)) ([8b4e861](https://github.com/ionic-team/capacitor/commit/8b4e861514b0fbe08e9296f49c280234f54742e1))

# [3.5.0](https://github.com/ionic-team/capacitor/compare/3.4.3...3.5.0) (2022-04-22)

### Features

- **android:** Add overridable routing for WebViewLocalServer ([#5553](https://github.com/ionic-team/capacitor/issues/5553)) ([3bb288e](https://github.com/ionic-team/capacitor/commit/3bb288e848c5c0e49c1e58c0782e0b1ffd7b1f31))

# [4.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.1) (2022-03-25)

### Features

- **android:** set default targetSDK to 31 ([#5442](https://github.com/ionic-team/capacitor/issues/5442)) ([4442459](https://github.com/ionic-team/capacitor/commit/4442459b24cdbac25cb1e4de11583d22c21452b3))
- **android:** Upgrade gradle to 7.4 ([#5445](https://github.com/ionic-team/capacitor/issues/5445)) ([28eaf18](https://github.com/ionic-team/capacitor/commit/28eaf1851fa7a912917dbb40c68fb4dd583d08ad))

## [3.4.3](https://github.com/ionic-team/capacitor/compare/3.4.2...3.4.3) (2022-03-04)

**Note:** Version bump only for package @capacitor/android

## [3.4.2](https://github.com/ionic-team/capacitor/compare/3.4.1...3.4.2) (2022-03-03)

**Note:** Version bump only for package @capacitor/android

## [3.4.1](https://github.com/ionic-team/capacitor/compare/3.4.0...3.4.1) (2022-02-09)

**Note:** Version bump only for package @capacitor/android

# [3.4.0](https://github.com/ionic-team/capacitor/compare/3.3.4...3.4.0) (2022-01-19)

### Bug Fixes

- **android:** prevent input file crash if accept has . ([#5363](https://github.com/ionic-team/capacitor/issues/5363)) ([bdacb30](https://github.com/ionic-team/capacitor/commit/bdacb300bb6391dc4b84bb2bab075df993a15cba))

### Features

- **android:** Add getLong helper on PluginCall ([#5235](https://github.com/ionic-team/capacitor/issues/5235)) ([26261fb](https://github.com/ionic-team/capacitor/commit/26261fb49211330c4db72c259359565da7d7bc4b))

## [3.3.4](https://github.com/ionic-team/capacitor/compare/3.3.3...3.3.4) (2022-01-05)

### Bug Fixes

- **android:** Prevent crash if activity killed on input file ([#5328](https://github.com/ionic-team/capacitor/issues/5328)) ([a206841](https://github.com/ionic-team/capacitor/commit/a20684180a9b6fd50547ae578f21531faa116da5))

## [3.3.3](https://github.com/ionic-team/capacitor/compare/3.3.2...3.3.3) (2021-12-08)

### Bug Fixes

- **android:** Prevent crash in restoreInstanceState if bundleData is null ([#5289](https://github.com/ionic-team/capacitor/issues/5289)) ([622d62f](https://github.com/ionic-team/capacitor/commit/622d62fc0d7cd79558bf6f11331bd7d6690aa4f9))

## [3.3.2](https://github.com/ionic-team/capacitor/compare/3.3.1...3.3.2) (2021-11-17)

### Bug Fixes

- **android:** Allow web geolocation if only COARSE_LOCATION is granted ([#5236](https://github.com/ionic-team/capacitor/issues/5236)) ([bc7b24e](https://github.com/ionic-team/capacitor/commit/bc7b24e9b58b194b32b750c5816c8d8ef180834a))

## [3.3.1](https://github.com/ionic-team/capacitor/compare/3.3.0...3.3.1) (2021-11-05)

**Note:** Version bump only for package @capacitor/android

# [3.3.0](https://github.com/ionic-team/capacitor/compare/3.2.5...3.3.0) (2021-11-03)

### Bug Fixes

- **core:** avoid crash on logging circular objects ([#5186](https://github.com/ionic-team/capacitor/issues/5186)) ([1451ec8](https://github.com/ionic-team/capacitor/commit/1451ec850a9ef73267a032638e73f1fc440647b9))

### Features

- **android:** ability to reload the webview ([#5184](https://github.com/ionic-team/capacitor/issues/5184)) ([c495bed](https://github.com/ionic-team/capacitor/commit/c495bed216ddf05450f185d2d3f09b4052b281a8))

## [3.2.5](https://github.com/ionic-team/capacitor/compare/3.2.4...3.2.5) (2021-10-13)

### Bug Fixes

- **android:** Avoid ConcurrentModificationException on notifyListeners ([#5125](https://github.com/ionic-team/capacitor/issues/5125)) ([b82bfe0](https://github.com/ionic-team/capacitor/commit/b82bfe0db2e38fa286eb18391b1d5e2f86a1b35c))
- **android:** Support cordova-android 10 ([#5103](https://github.com/ionic-team/capacitor/issues/5103)) ([e238233](https://github.com/ionic-team/capacitor/commit/e238233dcf34a183af4861176789d1feb1eb51fa))

## [3.2.4](https://github.com/ionic-team/capacitor/compare/3.2.3...3.2.4) (2021-09-27)

### Bug Fixes

- **ios:** show correct line number on console logs ([#5073](https://github.com/ionic-team/capacitor/issues/5073)) ([ec41e74](https://github.com/ionic-team/capacitor/commit/ec41e743aa4ba81e791ad446fac461b7f43b46ed))

## [3.2.3](https://github.com/ionic-team/capacitor/compare/3.2.2...3.2.3) (2021-09-15)

### Bug Fixes

- **android:** proguard rules ([#5048](https://github.com/ionic-team/capacitor/issues/5048)) ([cf15c0f](https://github.com/ionic-team/capacitor/commit/cf15c0fb3bd67315011865fedb4157d5076965fd))
- **android:** save activity result launcher calls ([#5004](https://github.com/ionic-team/capacitor/issues/5004)) ([2c1eb60](https://github.com/ionic-team/capacitor/commit/2c1eb603c79b94f6fcc74f0cbef523590b656a1e))

## [3.2.2](https://github.com/ionic-team/capacitor/compare/3.2.1...3.2.2) (2021-09-02)

**Note:** Version bump only for package @capacitor/android

## [3.2.1](https://github.com/ionic-team/capacitor/compare/3.2.0...3.2.1) (2021-09-01)

**Note:** Version bump only for package @capacitor/android

# [3.2.0](https://github.com/ionic-team/capacitor/compare/3.1.2...3.2.0) (2021-08-18)

### Bug Fixes

- **android:** Don't inject map files into capacitor script ([#4893](https://github.com/ionic-team/capacitor/issues/4893)) ([992bebc](https://github.com/ionic-team/capacitor/commit/992bebce5a54128ec09b4905c4424fbe392719be))

## [3.1.2](https://github.com/ionic-team/capacitor/compare/3.1.1...3.1.2) (2021-07-21)

### Bug Fixes

- **android:** add missing android webview lifecycle events ([6a7c4e3](https://github.com/ionic-team/capacitor/commit/6a7c4e3b3a250270ac5c4b0f09da2a613ef2cf17))
- **android:** Set theme an content view on onCreate ([#4841](https://github.com/ionic-team/capacitor/issues/4841)) ([8950c60](https://github.com/ionic-team/capacitor/commit/8950c600bb6e3804b79c62e83fef2253c2cc2389))

## [3.1.1](https://github.com/ionic-team/capacitor/compare/3.1.0...3.1.1) (2021-07-07)

### Bug Fixes

- fixing peer deps issues in android and ios libs ([310d9f4](https://github.com/ionic-team/capacitor/commit/310d9f486db976cb258fcda5ac893f019667617f))

# [3.1.0](https://github.com/ionic-team/capacitor/compare/3.0.2...3.1.0) (2021-07-07)

**Note:** Version bump only for package @capacitor/android

## [3.0.2](https://github.com/ionic-team/capacitor/compare/3.0.1...3.0.2) (2021-06-23)

### Bug Fixes

- **android:** Set WEBVIEW_SERVER_URL before injecting native-bridge ([#4748](https://github.com/ionic-team/capacitor/issues/4748)) ([5d6b179](https://github.com/ionic-team/capacitor/commit/5d6b17994abc7ad770b95e3a9fc29aecf5d9fc05))
- **core:** cordova events not firing ([#4712](https://github.com/ionic-team/capacitor/issues/4712)) ([ca4e3b6](https://github.com/ionic-team/capacitor/commit/ca4e3b62dba6a40e593a1404ba2fe2b416a4ac14))

## [3.0.1](https://github.com/ionic-team/capacitor/compare/3.0.0...3.0.1) (2021-06-09)

### Bug Fixes

- **android:** Avoid crash on input file ([#4707](https://github.com/ionic-team/capacitor/issues/4707)) ([883c0fe](https://github.com/ionic-team/capacitor/commit/883c0fe4a8a33d2e14894d9b307f4d7ce6d13bad))
- **android:** Make proxy handle user info in server url ([#4699](https://github.com/ionic-team/capacitor/issues/4699)) ([baeed45](https://github.com/ionic-team/capacitor/commit/baeed45038134d446aef7747e5ad5ce4ac07c438))
- **android:** Reset bridge on onPageStarted only ([#4634](https://github.com/ionic-team/capacitor/issues/4634)) ([96e4830](https://github.com/ionic-team/capacitor/commit/96e483046c9128dbcaec21efb0f5d619c6b1185f))
- Make isPluginAvailable available on bridge ([#4589](https://github.com/ionic-team/capacitor/issues/4589)) ([151e7a8](https://github.com/ionic-team/capacitor/commit/151e7a899d9646dbd5625a2539fd3f2297349bc5))

# [3.0.0](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.4...3.0.0) (2021-05-18)

**Note:** Version bump only for package @capacitor/android

# [3.0.0-rc.4](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.3...3.0.0-rc.4) (2021-05-18)

**Note:** Version bump only for package @capacitor/android

# [3.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.2...3.0.0-rc.3) (2021-05-11)

**Note:** Version bump only for package @capacitor/android

# [3.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.1...3.0.0-rc.2) (2021-05-07)

**Note:** Version bump only for package @capacitor/android

# [3.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.0...3.0.0-rc.1) (2021-04-29)

### Bug Fixes

- generate Capacitor.Plugins object ([#4496](https://github.com/ionic-team/capacitor/issues/4496)) ([1c71b7a](https://github.com/ionic-team/capacitor/commit/1c71b7adb2c325e34d980dbf578dc22afb2c332b))
- **android:** Release the call after reject/resolve ([#4318](https://github.com/ionic-team/capacitor/issues/4318)) ([a9f30a8](https://github.com/ionic-team/capacitor/commit/a9f30a88bf3cf239a59c4e901e2a9a2a141a9044))
- **android:** resolve issue with activity result API registration for fragments ([#4402](https://github.com/ionic-team/capacitor/issues/4402)) ([ac6c6bc](https://github.com/ionic-team/capacitor/commit/ac6c6bc031e0c8236004dfb9e1b04f1f849c1519))

### Features

- Unify logging behavior across environments ([#4416](https://github.com/ionic-team/capacitor/issues/4416)) ([bae0f3d](https://github.com/ionic-team/capacitor/commit/bae0f3d2cee84978636d0f589bc7e2f745671baf))
- **android:** ability to add listeners to the Capacitor WebView ([#4405](https://github.com/ionic-team/capacitor/issues/4405)) ([7bdcc15](https://github.com/ionic-team/capacitor/commit/7bdcc15a20248fc17b5867b215bba0c43e29b2c0))

# [3.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.6...3.0.0-rc.0) (2021-03-10)

### Bug Fixes

- **android:** calls re-saved during permission/activity result callbacks were being released ([502a2d1](https://github.com/ionic-team/capacitor/commit/502a2d18ddce870f4caf810b405f7363f2340067))
- **android:** live reload not working when using adb reverse ([362f221](https://github.com/ionic-team/capacitor/commit/362f2219767a5f28e3ce1f6857a0e20024adc6b6))

### Features

- **android:** add configurable app path for embedded capacitor ([#4264](https://github.com/ionic-team/capacitor/issues/4264)) ([e433691](https://github.com/ionic-team/capacitor/commit/e43369144f7f378edc4f5d4f8dbbafe6cff6a70d))
- **android:** Unifying saving plugin calls ([#4254](https://github.com/ionic-team/capacitor/issues/4254)) ([a648c51](https://github.com/ionic-team/capacitor/commit/a648c51588627404b5ad30c35943fed18af4a546))

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

- address bug in `isPluginAvailable()` for web and native ([#4114](https://github.com/ionic-team/capacitor/issues/4114)) ([2fbd954](https://github.com/ionic-team/capacitor/commit/2fbd95465a321b8f4c50d4daf22a63d8043cee9b))
- **android:** get PermissionState enum by state value ([#4100](https://github.com/ionic-team/capacitor/issues/4100)) ([194ae86](https://github.com/ionic-team/capacitor/commit/194ae8699944bf016132fb64fe48010679a6d64e))
- **android:** requestPermission call rejects if permission missing in manifest ([55ef5ff](https://github.com/ionic-team/capacitor/commit/55ef5ff38e87729412c44bfa4b2f29e53044cecc))

### Features

- **android:** activity result use new API and update permission result callbacks to match ([#4127](https://github.com/ionic-team/capacitor/issues/4127)) ([002f1e5](https://github.com/ionic-team/capacitor/commit/002f1e55173a50b9fe918b4eda73b5113b713282))
- **android:** androidxActivityVersion & androidxFragmentVersion gradle variables ([#4103](https://github.com/ionic-team/capacitor/issues/4103)) ([4f77b96](https://github.com/ionic-team/capacitor/commit/4f77b962be85fc6bfc555a106c5b3e6707526626))

# [3.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.0...3.0.0-beta.1) (2021-01-14)

**Note:** Version bump only for package @capacitor/android

# [3.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.14...3.0.0-beta.0) (2021-01-13)

**Note:** Version bump only for package @capacitor/android

# [3.0.0-alpha.14](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.13...3.0.0-alpha.14) (2021-01-13)

### Bug Fixes

- **android:** append missing new lines on injected cordova files ([#4058](https://github.com/ionic-team/capacitor/issues/4058)) ([dbdc78d](https://github.com/ionic-team/capacitor/commit/dbdc78dc08e016dfbc2454d4f53a49f16f744b3e))

### Features

- **android:** method to check permission for an alias ([#4062](https://github.com/ionic-team/capacitor/issues/4062)) ([c88c4b4](https://github.com/ionic-team/capacitor/commit/c88c4b46b949a87c1b89476b75273adef725242b))

# [3.0.0-alpha.12](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.11...3.0.0-alpha.12) (2021-01-08)

### Features

- **android:** switch to new callback-style permission requests ([#4033](https://github.com/ionic-team/capacitor/issues/4033)) ([cc459de](https://github.com/ionic-team/capacitor/commit/cc459de7fc070c0227e066f3e8b92062728ab45d))

# [3.0.0-alpha.11](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.10...3.0.0-alpha.11) (2020-12-26)

### Features

- **android:** expose CapConfig.loadDefault(), deprecate v2 constructor ([#3964](https://github.com/ionic-team/capacitor/issues/3964)) ([94ae977](https://github.com/ionic-team/capacitor/commit/94ae9774d2467fa7ba0336e7183f6d28cae45908))

# [3.0.0-alpha.10](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.9...3.0.0-alpha.10) (2020-12-15)

### Bug Fixes

- **android:** include lint.xml for downstream lint tasks ([efa72f3](https://github.com/ionic-team/capacitor/commit/efa72f38c5f64d3b91cc4c4c7d4d87ab38219893))

# [3.0.0-alpha.9](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.8...3.0.0-alpha.9) (2020-12-15)

### Bug Fixes

- **android:** include lint-baseline.xml for downstream lint tasks ([20ccaa0](https://github.com/ionic-team/capacitor/commit/20ccaa0311dcf8468019325ad976156d92ed0202))

# [3.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.7...3.0.0-alpha.8) (2020-12-15)

### Bug Fixes

- **Android:** Use plugin's getPermissionStates() to support overriding ([#3939](https://github.com/ionic-team/capacitor/issues/3939)) ([855a607](https://github.com/ionic-team/capacitor/commit/855a60711bcf6cff3215a36fac7e5314a2c4d159))

### Features

- **android:** add onConfigurationChanged() activity lifecycle hook ([#3936](https://github.com/ionic-team/capacitor/issues/3936)) ([29e9e2c](https://github.com/ionic-team/capacitor/commit/29e9e2c5c30f23eb3ea2e88b1427eed0636e8125))
- **android:** Add WebColor utility for parsing color ([#3947](https://github.com/ionic-team/capacitor/issues/3947)) ([3746404](https://github.com/ionic-team/capacitor/commit/3746404240459ca9ea8175f2bb241d80746e8328))
- **Android:** Refactoring configuration ([#3778](https://github.com/ionic-team/capacitor/issues/3778)) ([9820a30](https://github.com/ionic-team/capacitor/commit/9820a30688f0a774eced1676f1927cacde53301f))

# [3.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.6...3.0.0-alpha.7) (2020-12-02)

### Bug Fixes

- **android:** dont release calls that are manually saved, eg listeners/watchers ([#3857](https://github.com/ionic-team/capacitor/issues/3857)) ([f1c8fe9](https://github.com/ionic-team/capacitor/commit/f1c8fe9e039d25eff2122fe915f17e84477427eb))
- **android:** fixed breaking change to `handleOnActivityResult` ([#3888](https://github.com/ionic-team/capacitor/issues/3888)) ([5fd60e6](https://github.com/ionic-team/capacitor/commit/5fd60e607b79b46cec08c6af1674305b1199d0a4))
- **android:** resolve undefined for both checkPermissions and requestPermissions by default ([#3855](https://github.com/ionic-team/capacitor/issues/3855)) ([383f62b](https://github.com/ionic-team/capacitor/commit/383f62b2b6531c579aac469e29b7c1c0c1f7540f))

### Features

- automatically import Android plugins ([#3788](https://github.com/ionic-team/capacitor/issues/3788)) ([aa1e1c6](https://github.com/ionic-team/capacitor/commit/aa1e1c604e260cc8babb0e7f5230f692bdcf6f09))
- **android:** Add handlePermissions function for plugins to call ([#3768](https://github.com/ionic-team/capacitor/issues/3768)) ([3a7e282](https://github.com/ionic-team/capacitor/commit/3a7e282a7515784dd343bbf1e3d52e0299bac887))
- **android:** modified plugin annotation format for multi-permissions and empty (auto-grant) ([#3822](https://github.com/ionic-team/capacitor/issues/3822)) ([1b5a3bd](https://github.com/ionic-team/capacitor/commit/1b5a3bdeb1b35612cf04e58bdf2fca68a0832a14))

# [3.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.5...3.0.0-alpha.6) (2020-10-30)

### Bug Fixes

- **android:** avoid crash on input file capture ([#3715](https://github.com/ionic-team/capacitor/issues/3715)) ([f502a99](https://github.com/ionic-team/capacitor/commit/f502a9964e28012980d636014043e86e918031d7))

### Features

- improve permissions ([eec61a6](https://github.com/ionic-team/capacitor/commit/eec61a6d8d8edfe94aea1a361787d1e6c736e20d))
- unified errors and error codes ([#3673](https://github.com/ionic-team/capacitor/issues/3673)) ([f9e0803](https://github.com/ionic-team/capacitor/commit/f9e08038aa88f7453e8235f380d2767a12a7a073))

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

- **android:** add custom plugins to BridgeFragment ([#3280](https://github.com/ionic-team/capacitor/issues/3280)) ([d131a5f](https://github.com/ionic-team/capacitor/commit/d131a5fed2b9ae29b6952397ec2f81104545b749))
