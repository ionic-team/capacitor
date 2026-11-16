## [9.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/8.6.2...9.0.0-rc.0) (2026-11-13)

## [9.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/8.6.0...9.0.0-rc.0) (2026-11-12)

### Features

* **cli:** enable the local network permission for live reload on Android 17 ([#8706](https://github.com/ionic-team/capacitor/issues/8706)) ([9eea5bb](https://github.com/ionic-team/capacitor/commit/9eea5bbc7ee10fb947b1176ba84789e6a90d926e))
* **cli:** support ES module syntax in capacitor.config ([#8687](https://github.com/ionic-team/capacitor/issues/8687)) ([224bc89](https://github.com/ionic-team/capacitor/commit/224bc89a030ec20f1e249c34e0cea60e6aaac314))

### Bug Fixes

* **android:** skip lifecycle events when the Capacitor bridge is not present ([#8684](https://github.com/ionic-team/capacitor/issues/8684)) ([06b62bd](https://github.com/ionic-team/capacitor/commit/06b62bd7305c47323825ea6c1942b8a87e99fbbf))
* **cli:** update AGP before the Gradle wrapper in migrate ([fbb2a9a](https://github.com/ionic-team/capacitor/commit/fbb2a9a9f3a659bbecfdc3251192e7415d193298))
* **ios:** read CapacitorCookies/CapacitorHttp isEnabled from injected global ([#8689](https://github.com/ionic-team/capacitor/issues/8689)) ([1ae2b31](https://github.com/ionic-team/capacitor/commit/1ae2b31e7106a23d757c00318b9ce39b0edad289))
* native android publishing compatibility with Gradle 9 / AGP 9 ([#8695](https://github.com/ionic-team/capacitor/issues/8695)) ([02de32b](https://github.com/ionic-team/capacitor/commit/02de32bb7b3fd13c2d1d444cbfd4f326b046dc69))

## [9.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.8...9.0.0-beta.0) (2026-10-28)

### ⚠ BREAKING CHANGES

* **cli:** collect telemetry from agent-driven runs ([#8673](https://github.com/ionic-team/capacitor/issues/8673))
* **android:** enable R8 by default in release builds
* **ios:** remove CAPACITOR_DEBUG ([#8643](https://github.com/ionic-team/capacitor/issues/8643))
* **android-template:** Upgrade AGP to 9.4.1 and Gradle to 9.8.2 ([#8667](https://github.com/ionic-team/capacitor/issues/8667))

### Features

* add migration to recommended project settings ([#8679](https://github.com/ionic-team/capacitor/issues/8679)) ([295b10b](https://github.com/ionic-team/capacitor/commit/295b10b39f26150ff47361ff17d423586a330d50))
* **android-template:** Upgrade AGP to 9.4.1 and Gradle to 9.8.2 ([#8667](https://github.com/ionic-team/capacitor/issues/8667)) ([d58c032](https://github.com/ionic-team/capacitor/commit/d58c032e4c54e9907fd0bc984fd24a9a4373bff7))
* **android:** enable R8 by default in release builds ([6983d3a](https://github.com/ionic-team/capacitor/commit/6983d3a8942e83503347f393cb215dac08bfb2df))
* **android:** Upgrade AGP to 9.4.1 and Gradle to 9.8.2 ([#8668](https://github.com/ionic-team/capacitor/issues/8668)) ([3ccf568](https://github.com/ionic-team/capacitor/commit/3ccf568d7a97c2e3b832cc21e31c097c1dad5b75))
* **cli:** add /Package.resolved to CapApp-SPM/.gitignore during migration ([#8686](https://github.com/ionic-team/capacitor/issues/8686)) ([ed4a5cc](https://github.com/ionic-team/capacitor/commit/ed4a5cc943199433b760bf4294c40c41a16c48b7))
* **cli:** collect telemetry from agent-driven runs ([#8673](https://github.com/ionic-team/capacitor/issues/8673)) ([1ecbb87](https://github.com/ionic-team/capacitor/commit/1ecbb874af26a71b9a6c3732f6f02f7a3bc62d5b))
* **cli:** finish the SwiftUI entry-point conversion in cap migrate ([#8647](https://github.com/ionic-team/capacitor/issues/8647)) ([ffb509f](https://github.com/ionic-team/capacitor/commit/ffb509ff32b4bffcdea5a368db5678bcffcfd1e1))
* **cli:** resolve the iOS Swift package from NPM package ([#8644](https://github.com/ionic-team/capacitor/issues/8644)) ([f3d894b](https://github.com/ionic-team/capacitor/commit/f3d894b9bf11bb24808d6e212262c4259aa4c689))

### Bug Fixes

* **android:** keep Cordova's config.xml when shrinking resources ([fd17329](https://github.com/ionic-team/capacitor/commit/fd17329f196338d8e382bdabb08e383d67826ef9))
* **cli:** apply cleartext to the app module and merge with existing network-security-config ([#8671](https://github.com/ionic-team/capacitor/issues/8671)) ([19567bb](https://github.com/ionic-team/capacitor/commit/19567bbd47562fbf8395391ef0c0190c3f6cf668))
* **cli:** drop unused catch bindings in npm util ([#8681](https://github.com/ionic-team/capacitor/issues/8681)) ([3726d8a](https://github.com/ionic-team/capacitor/commit/3726d8a8a5cb2229f0eac62e2afdf9dd8ab91937))
* **cli:** make migrate update androidxCoreKTXVersion ([#8656](https://github.com/ionic-team/capacitor/issues/8656)) ([e427037](https://github.com/ionic-team/capacitor/commit/e4270379d9cc050f10ae2e6d0c264d60edd9a926))
* **ios:** keep ScreenOrientation locks with the SwiftUI app template ([#8680](https://github.com/ionic-team/capacitor/issues/8680)) ([cd93355](https://github.com/ionic-team/capacitor/commit/cd933557e48d24effbd387a5eee98d3b06bee611))

### Code Refactoring

* **ios:** remove CAPACITOR_DEBUG ([#8643](https://github.com/ionic-team/capacitor/issues/8643)) ([45bbabc](https://github.com/ionic-team/capacitor/commit/45bbabc374938caf6c88bb467ea1d253e4f15d6d))

## [9.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/8.5.3...9.0.0-alpha.8) (2026-10-07)

### Bug Fixes

* **cli:** Patch Package.swift deploymentTarget for Capacitor and Cordova Plugins ([#8641](https://github.com/ionic-team/capacitor/issues/8641)) ([a808398](https://github.com/ionic-team/capacitor/commit/a8083981356a6b47483c4903f4b740dcaed14678))

## [9.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/8.5.2...9.0.0-alpha.7) (2026-09-18)

### ⚠ BREAKING CHANGES

* **ios:** convert the iOS platform to a source-first Swift package ([#8588](https://github.com/ionic-team/capacitor/issues/8588))
* **android:** drop legacy @NativePlugin annotation support ([#8563](https://github.com/ionic-team/capacitor/issues/8563))
* **android:** remove deprecated APIs orphaned by @NativePlugin drop ([#8564](https://github.com/ionic-team/capacitor/issues/8564))
* **android:** remove deprecated Java APIs for Capacitor 9 ([#8553](https://github.com/ionic-team/capacitor/issues/8553))
* **ios:** remove deprecated Swift and Obj-C APIs for Capacitor 9 ([#8551](https://github.com/ionic-team/capacitor/issues/8551))
* **cli:** require node >= 24 ([#8556](https://github.com/ionic-team/capacitor/issues/8556))

### Features

* **cli:** add android edge-to-edge settings to migrator ([#8604](https://github.com/ionic-team/capacitor/issues/8604)) ([ee131fa](https://github.com/ionic-team/capacitor/commit/ee131fafa4027ede6d4e1147f34829a69b0d9db1))
* include option to force cordova inclusion ([#8576](https://github.com/ionic-team/capacitor/issues/8576)) ([638fe4d](https://github.com/ionic-team/capacitor/commit/638fe4dde67d238f5e55de72aefbad7b4c3fc538))
* **SystemBars:** set default insets handling to 'native' ([#8599](https://github.com/ionic-team/capacitor/issues/8599)) ([f9e2395](https://github.com/ionic-team/capacitor/commit/f9e2395ec26b8980f269697d3fc903520479aaa6))

### Bug Fixes

* **android-template:** declare app/build.gradle dependency versions explicitly ([#8567](https://github.com/ionic-team/capacitor/issues/8567)) ([86f9dfd](https://github.com/ionic-team/capacitor/commit/86f9dfd5b998e70e640e1e74e26655aa897e729b))
* **android:** stop using deprecated hasPermission to read Cordova prefs ([#8550](https://github.com/ionic-team/capacitor/issues/8550)) ([7e240f2](https://github.com/ionic-team/capacitor/commit/7e240f23cad0e81fe490245c7e2e93afa5d072bf))
* block navigation to the internal HTTP proxy path ([a4e946b](https://github.com/ionic-team/capacitor/commit/a4e946bb6d7b6ca0e0e231e653c4245ff0ab16de))
* block the HTTP proxy path in subframes ([49b65c5](https://github.com/ionic-team/capacitor/commit/49b65c50bdc4077e4ecd43dee21f583ce0169170))
* **cli:** declare app/build.gradle dependency versions in cap migrate ([#8570](https://github.com/ionic-team/capacitor/issues/8570)) ([6ec449e](https://github.com/ionic-team/capacitor/commit/6ec449eda133787198b5abdbcd19dc1b464e0f7b))
* **cli:** remove AGP 9 property shims and jcenter() in cap migrate ([#8584](https://github.com/ionic-team/capacitor/issues/8584)) ([8ac467a](https://github.com/ionic-team/capacitor/commit/8ac467aee9ce30bf755b957199b34562294fa6dd))
* **cli:** replace usesCleartextTraffic with network-security-config ([#8572](https://github.com/ionic-team/capacitor/issues/8572)) ([f39dd91](https://github.com/ionic-team/capacitor/commit/f39dd91e96e16c0ddc69e14d0963c0c4886b0fe8))
* **cli:** restore Cordova Package.swift generator for Cap 9 ([#8580](https://github.com/ionic-team/capacitor/issues/8580)) ([09431bc](https://github.com/ionic-team/capacitor/commit/09431bc23ce4f656a25bd42c4abc424011b80858))
* **cli:** run gradle wrapper after settings.gradle migration to fix first-run failure ([#8543](https://github.com/ionic-team/capacitor/issues/8543)) ([9b68494](https://github.com/ionic-team/capacitor/commit/9b684944b22a8ff2e634b6c16fef192375d98c61))
* **cli:** run gradle wrapper before root build.gradle migration ([#8579](https://github.com/ionic-team/capacitor/issues/8579)) ([3a82c57](https://github.com/ionic-team/capacitor/commit/3a82c576fc9ba72d24bb55eb8a722514c21cca1c))
* **cli:** update gradle-wrapper.properties version to avoid JDK 25 problems ([#8594](https://github.com/ionic-team/capacitor/issues/8594)) ([60dd0b6](https://github.com/ionic-team/capacitor/commit/60dd0b60c3fd42089296435795e8bb3becc00d33))
* **iOS:** make permission functions override-able (open) ([#8602](https://github.com/ionic-team/capacitor/issues/8602)) ([0b369e7](https://github.com/ionic-team/capacitor/commit/0b369e7a85f864676f7262eb5bf8c1a0a5593d52))
* **ios:** replace deprecated languageCode/regionCode with iOS 16 Locale APIs ([#8548](https://github.com/ionic-team/capacitor/issues/8548)) ([9f13fa6](https://github.com/ionic-team/capacitor/commit/9f13fa688c4170b816c9af72662369b8a776dc4a))

### Miscellaneous Chores

* **cli:** require node >= 24 ([#8556](https://github.com/ionic-team/capacitor/issues/8556)) ([753e7a7](https://github.com/ionic-team/capacitor/commit/753e7a70a5bf58a49119acc7c3b5fd557a7478c9))

### Code Refactoring

* **android:** drop legacy @NativePlugin annotation support ([#8563](https://github.com/ionic-team/capacitor/issues/8563)) ([b310594](https://github.com/ionic-team/capacitor/commit/b31059409da8adc35812178ccf064b7d4c7c9f58))
* **android:** remove deprecated APIs orphaned by @NativePlugin drop ([#8564](https://github.com/ionic-team/capacitor/issues/8564)) ([7b53880](https://github.com/ionic-team/capacitor/commit/7b538804fc23d8cce0b320af8ee572d1a75f3457))
* **android:** remove deprecated Java APIs for Capacitor 9 ([#8553](https://github.com/ionic-team/capacitor/issues/8553)) ([c6f5754](https://github.com/ionic-team/capacitor/commit/c6f5754c507482ff637ff1400a385b3e454d18ef))
* **ios:** convert the iOS platform to a source-first Swift package ([#8588](https://github.com/ionic-team/capacitor/issues/8588)) ([14d1748](https://github.com/ionic-team/capacitor/commit/14d17488526452b4b061c08de9c474a1f79117cd))
* **ios:** remove deprecated Swift and Obj-C APIs for Capacitor 9 ([#8551](https://github.com/ionic-team/capacitor/issues/8551)) ([191d3b4](https://github.com/ionic-team/capacitor/commit/191d3b472cf3c5707e0c4acbe5c86fff52c00025))

## [9.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/8.4.2...9.0.0-alpha.6) (2026-07-14)

### Bug Fixes

* **cli:** Don't add kotlin plugin for Cordova plugins ([#8518](https://github.com/ionic-team/capacitor/issues/8518)) ([9a2d3e6](https://github.com/ionic-team/capacitor/commit/9a2d3e65a616366b42dbcc2ffa40790b9f102722))
* **ios:** remove Cordova.framework from Capacitor project ([#8524](https://github.com/ionic-team/capacitor/issues/8524)) ([bfae960](https://github.com/ionic-team/capacitor/commit/bfae9602d039cd283b00eceddea246e6aed146b8))

## [9.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/8.4.1...9.0.0-alpha.5) (2026-06-23)

### Bug Fixes

* add missing logic from merge ([#8515](https://github.com/ionic-team/capacitor/issues/8515)) ([356cafa](https://github.com/ionic-team/capacitor/commit/356cafa7a06dd4a2b6d535f421ddc62132b34343))
* **android:** restore verify script ([#8513](https://github.com/ionic-team/capacitor/issues/8513)) ([0585c18](https://github.com/ionic-team/capacitor/commit/0585c180843064d4f704f38710bd0db5050b70b1))
* **cli:** Add missing imports ([#8512](https://github.com/ionic-team/capacitor/issues/8512)) ([904b22e](https://github.com/ionic-team/capacitor/commit/904b22e69f4f750ed0b2e006157baaa0c7fc2a7f))

## [9.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.3...9.0.0-alpha.4) (2026-06-19)

### ⚠ BREAKING CHANGES

* **android:** bump AGP to 9.2.1 and Gradle to 9.5.1 ([#8498](https://github.com/ionic-team/capacitor/issues/8498))
* **android:** bump compile/targetSdkVersion to 37 ([#8496](https://github.com/ionic-team/capacitor/issues/8496))
* **cli:** bump compile/targetSdkVersion to 37 ([#8497](https://github.com/ionic-team/capacitor/issues/8497))
* **android:** bump minSdkVersion to 26 ([#8500](https://github.com/ionic-team/capacitor/issues/8500))
* **cli:** bump minSdkVersion to 26 ([#8501](https://github.com/ionic-team/capacitor/issues/8501))
* **android-template:** bump minSdkVersion to 26 ([#8502](https://github.com/ionic-team/capacitor/issues/8502))

### Bug Fixes

* **ios:** eliminate double comma in SPM generation ([#8505](https://github.com/ionic-team/capacitor/issues/8505)) ([1a5543f](https://github.com/ionic-team/capacitor/commit/1a5543fbfcf4ba911270002d573275342f680bde))

### Miscellaneous Chores

* **android-template:** bump minSdkVersion to 26 ([#8502](https://github.com/ionic-team/capacitor/issues/8502)) ([c43cb8f](https://github.com/ionic-team/capacitor/commit/c43cb8fb17aede606077fe46fc70990195d1cc53))
* **android:** bump AGP to 9.2.1 and Gradle to 9.5.1 ([#8498](https://github.com/ionic-team/capacitor/issues/8498)) ([11f3c83](https://github.com/ionic-team/capacitor/commit/11f3c83f0883a1400e14c538f9040e13f7e0dbfc))
* **android:** bump compile/targetSdkVersion to 37 ([#8496](https://github.com/ionic-team/capacitor/issues/8496)) ([3d77cc2](https://github.com/ionic-team/capacitor/commit/3d77cc20d94ee020f27ca224653121c791edf919))
* **android:** bump minSdkVersion to 26 ([#8500](https://github.com/ionic-team/capacitor/issues/8500)) ([fe6a83b](https://github.com/ionic-team/capacitor/commit/fe6a83b4eb0b4ceacf3b566f3e262fc792001e58))
* **cli:** bump compile/targetSdkVersion to 37 ([#8497](https://github.com/ionic-team/capacitor/issues/8497)) ([1c3a28d](https://github.com/ionic-team/capacitor/commit/1c3a28d480c4acc1ae2e2aba0a6a902aabf540a7))
* **cli:** bump minSdkVersion to 26 ([#8501](https://github.com/ionic-team/capacitor/issues/8501)) ([753c97c](https://github.com/ionic-team/capacitor/commit/753c97cac2c2b8ce862e5866b9feb03a47b62c27))

## [9.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/8.4.0...9.0.0-alpha.3) (2026-06-02)

### ⚠ BREAKING CHANGES

* **ios:** bump minimum deployment target to 16 ([#8491](https://github.com/ionic-team/capacitor/issues/8491))
* **cli:** merge live-reload options into `--url` ([#8468](https://github.com/ionic-team/capacitor/issues/8468))

### Features

* **cli:** merge live-reload options into `--url` ([#8468](https://github.com/ionic-team/capacitor/issues/8468)) ([e307730](https://github.com/ionic-team/capacitor/commit/e30773039c0ac249d13780be9d958104cc420cb5))
* **ios:** bump minimum deployment target to 16 ([#8491](https://github.com/ionic-team/capacitor/issues/8491)) ([c4f4e4b](https://github.com/ionic-team/capacitor/commit/c4f4e4beb562ca9f2d05f4da3573018c9d3cb986))

## [9.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/8.3.4...9.0.0-alpha.2) (2026-05-12)

## [9.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/8.3.3...9.0.0-alpha.1) (2026-05-08)

## [9.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/8.3.2...9.0.0-alpha.0) (2026-05-07)

### ⚠ BREAKING CHANGES

* make Cordova support optional ([#8328](https://github.com/ionic-team/capacitor/issues/8328))
* **android-template:** remove capacitor-cordova-android-plugins module ([#8446](https://github.com/ionic-team/capacitor/issues/8446))
* **cli:** Remove default port for --live-reload ([#8376](https://github.com/ionic-team/capacitor/issues/8376))
* **android:** Remove deprecated `PathHandler#getResponseHeaders` ([#8374](https://github.com/ionic-team/capacitor/issues/8374))
* **ios:** remove deprecated tmpWindow/TmpViewController ([#8362](https://github.com/ionic-team/capacitor/issues/8362))
* **cli:** Remove unused livereload method and parameter ([#8350](https://github.com/ionic-team/capacitor/issues/8350))
* **spm-template:** replace deprecated @UIApplicationMain with [@main](https://github.com/main) ([#8349](https://github.com/ionic-team/capacitor/issues/8349))
* replace deprecated `@UIApplicationMain` with `@main` ([#8346](https://github.com/ionic-team/capacitor/issues/8346))
* **android-template:** update Android template to support AGP 9.0 ([#8318](https://github.com/ionic-team/capacitor/issues/8318))

### Features

* **android-template:** update Android template to support AGP 9.0 ([#8318](https://github.com/ionic-team/capacitor/issues/8318)) ([0594ac5](https://github.com/ionic-team/capacitor/commit/0594ac541ea07817e0aa298e847097d89dfd6094))
* make Cordova support optional ([#8328](https://github.com/ionic-team/capacitor/issues/8328)) ([9b0f1c8](https://github.com/ionic-team/capacitor/commit/9b0f1c8dc21ab7ed19c9c77294128eba6b94b06f))

### Bug Fixes

* **android:** conditionally add Cordova ([#8453](https://github.com/ionic-team/capacitor/issues/8453)) ([e136b3f](https://github.com/ionic-team/capacitor/commit/e136b3f0cdd1437cac5234576301ed388edf85e7))
* **android:** Handle activity result without plugin handle ([#8436](https://github.com/ionic-team/capacitor/issues/8436)) ([65ad1fd](https://github.com/ionic-team/capacitor/commit/65ad1fd55b9793a3e078e4a837a00e2f28c75c17))
* **cli:** conditionally add capacitor-cordova-android-plugins module ([#8449](https://github.com/ionic-team/capacitor/issues/8449)) ([9e85905](https://github.com/ionic-team/capacitor/commit/9e85905bf36c1e2300994e231cf10e829f2074ed))
* **cli:** Remove default port for --live-reload ([#8376](https://github.com/ionic-team/capacitor/issues/8376)) ([05730de](https://github.com/ionic-team/capacitor/commit/05730dedb2283d7a4d03ece908711e822e91dde4))
* **http:** handle URL objects on fetch ([#8386](https://github.com/ionic-team/capacitor/issues/8386)) ([0aac1f0](https://github.com/ionic-team/capacitor/commit/0aac1f0aee8083dc5013f0d8e3c180eb02f21141))
* **ios:** make getArray accesible on Objective-C plugins ([#8392](https://github.com/ionic-team/capacitor/issues/8392)) ([ef57c77](https://github.com/ionic-team/capacitor/commit/ef57c773e70af6b94685a2dc0f808db3ed4cda6e))
* replace deprecated `@UIApplicationMain` with `@main` ([#8346](https://github.com/ionic-team/capacitor/issues/8346)) ([639d406](https://github.com/ionic-team/capacitor/commit/639d406789fb77f60cb355a5a9e791864580249b))
* **spm-template:** replace deprecated @UIApplicationMain with [@main](https://github.com/main) ([#8349](https://github.com/ionic-team/capacitor/issues/8349)) ([d5c129f](https://github.com/ionic-team/capacitor/commit/d5c129ff938b4b798d9ce112630cf10b92ad293d))
* **SystemBars:** use native safe area insets on Android ([#8384](https://github.com/ionic-team/capacitor/issues/8384)) ([d55f4f8](https://github.com/ionic-team/capacitor/commit/d55f4f859bd88fa5617699e874c48c451bcb5e5f))

### Miscellaneous Chores

* **cli:** Remove unused livereload method and parameter ([#8350](https://github.com/ionic-team/capacitor/issues/8350)) ([bb55698](https://github.com/ionic-team/capacitor/commit/bb5569848d305f6f05a2de69bdc7ce682a469031))

### Code Refactoring

* **android-template:** remove capacitor-cordova-android-plugins module ([#8446](https://github.com/ionic-team/capacitor/issues/8446)) ([e37aad8](https://github.com/ionic-team/capacitor/commit/e37aad87bb22afc6d974190e0a59221dcc863b5b))
* **android:** Remove deprecated `PathHandler#getResponseHeaders` ([#8374](https://github.com/ionic-team/capacitor/issues/8374)) ([b5e61da](https://github.com/ionic-team/capacitor/commit/b5e61daecf67047ff76345841c14fb4a919a3db2))
* **ios:** remove deprecated tmpWindow/TmpViewController ([#8362](https://github.com/ionic-team/capacitor/issues/8362)) ([07439cf](https://github.com/ionic-team/capacitor/commit/07439cf63cc6ecc366eba9a741e62fc252cf6596))

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [9.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/8.6.0...9.0.0-rc.0) (2026-11-12)

### Bug Fixes

- **ios:** read CapacitorCookies/CapacitorHttp isEnabled from injected global ([#8688](https://github.com/ionic-team/capacitor/issues/8688)) ([8b89254](https://github.com/ionic-team/capacitor/commit/8b89254e21d7af2f22067c61efa9612456a9479d))
- **ios:** read CapacitorCookies/CapacitorHttp isEnabled from injected global ([#8689](https://github.com/ionic-team/capacitor/issues/8689)) ([1ae2b31](https://github.com/ionic-team/capacitor/commit/1ae2b31e7106a23d757c00318b9ce39b0edad289))

# [9.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.8...9.0.0-beta.0) (2026-10-28)

# [9.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/8.5.3...9.0.0-alpha.8) (2026-10-07)

# [9.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/8.5.2...9.0.0-alpha.7) (2026-09-18)

### Features

- **SystemBars:** set default insets handling to 'native' ([#8599](https://github.com/ionic-team/capacitor/issues/8599)) ([f9e2395](https://github.com/ionic-team/capacitor/commit/f9e2395ec26b8980f269697d3fc903520479aaa6))

# [9.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/8.4.2...9.0.0-alpha.6) (2026-07-14)

# [9.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/8.4.1...9.0.0-alpha.5) (2026-06-23)

# [9.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.3...9.0.0-alpha.4) (2026-06-19)

# [9.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/8.4.0...9.0.0-alpha.3) (2026-06-02)

# [9.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/8.3.4...9.0.0-alpha.2) (2026-05-12)

# [9.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/8.3.3...9.0.0-alpha.1) (2026-05-08)

# [9.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/8.3.2...9.0.0-alpha.0) (2026-05-07)

### Bug Fixes

- **http:** handle URL objects on fetch ([#8386](https://github.com/ionic-team/capacitor/issues/8386)) ([0aac1f0](https://github.com/ionic-team/capacitor/commit/0aac1f0aee8083dc5013f0d8e3c180eb02f21141))
- **SystemBars:** use native safe area insets on Android ([#8384](https://github.com/ionic-team/capacitor/issues/8384)) ([d55f4f8](https://github.com/ionic-team/capacitor/commit/d55f4f859bd88fa5617699e874c48c451bcb5e5f))

# [9.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.8...9.0.0-beta.0) (2026-10-28)

# [8.6.0](https://github.com/ionic-team/capacitor/compare/8.5.3...8.6.0) (2026-10-28)

## [8.5.3](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.7...8.5.3) (2026-10-07)

**Note:** Version bump only for package @capacitor/core

# [9.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.7...9.0.0-alpha.8) (2026-10-07)

## [8.5.3](https://github.com/ionic-team/capacitor/compare/8.5.2...8.5.3) (2026-10-07)

## [8.5.2](https://github.com/ionic-team/capacitor/compare/8.5.1...8.5.2) (2026-09-11)

**Note:** Version bump only for package @capacitor/core

# [9.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/8.5.1...9.0.0-alpha.7) (2026-09-18)

### Bug Fixes

- resolve issues with safe area / systembars plugin ([#8535](https://github.com/ionic-team/capacitor/issues/8535)) ([e37d9c6](https://github.com/ionic-team/capacitor/commit/e37d9c60785368acf2a83cfd4c20f47076672bdd))

### Features

- **SystemBars:** set default insets handling to 'native' ([#8599](https://github.com/ionic-team/capacitor/issues/8599)) ([f9e2395](https://github.com/ionic-team/capacitor/commit/f9e2395ec26b8980f269697d3fc903520479aaa6))

# [9.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/8.4.2...9.0.0-alpha.6) (2026-07-14)

# [9.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/8.4.1...9.0.0-alpha.5) (2026-06-23)

# [9.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.3...9.0.0-alpha.4) (2026-06-19)

# [9.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/8.4.0...9.0.0-alpha.3) (2026-06-02)

# [9.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/8.3.4...9.0.0-alpha.2) (2026-05-12)

# [9.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/8.3.3...9.0.0-alpha.1) (2026-05-08)

# [9.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/8.3.2...9.0.0-alpha.0) (2026-05-07)

### Bug Fixes

- **http:** handle URL objects on fetch ([#8386](https://github.com/ionic-team/capacitor/issues/8386)) ([0aac1f0](https://github.com/ionic-team/capacitor/commit/0aac1f0aee8083dc5013f0d8e3c180eb02f21141))
- **SystemBars:** use native safe area insets on Android ([#8384](https://github.com/ionic-team/capacitor/issues/8384)) ([d55f4f8](https://github.com/ionic-team/capacitor/commit/d55f4f859bd88fa5617699e874c48c451bcb5e5f))

## [8.5.2](https://github.com/ionic-team/capacitor/compare/8.5.1...8.5.2) (2026-09-11)

### Bug Fixes

- resolve issues with safe area / systembars plugin ([#8535](https://github.com/ionic-team/capacitor/issues/8535)) ([e37d9c6](https://github.com/ionic-team/capacitor/commit/e37d9c60785368acf2a83cfd4c20f47076672bdd))

## [8.5.1](https://github.com/ionic-team/capacitor/compare/8.5.0...8.5.1) (2026-08-31)

### Bug Fixes

- **core:** prevent removeListener from removing wrong listener ([#8271](https://github.com/ionic-team/capacitor/issues/8271)) ([5ac4dd6](https://github.com/ionic-team/capacitor/commit/5ac4dd613ae989d8dc8738ea25b77efbd4fa21fe))

# [8.5.0](https://github.com/ionic-team/capacitor/compare/8.4.2...8.5.0) (2026-07-31)

**Note:** Version bump only for package @capacitor/core

# [9.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.5...9.0.0-alpha.6) (2026-07-14)

## [8.4.2](https://github.com/ionic-team/capacitor/compare/8.4.1...8.4.2) (2026-07-14)

**Note:** Version bump only for package @capacitor/core

# [9.0.0-alpha.5](https://github.com/ionic-team/capacitor/compare/8.4.1...9.0.0-alpha.5) (2026-06-23)

## [8.4.1](https://github.com/ionic-team/capacitor/compare/8.4.0...8.4.1) (2026-06-19)

**Note:** Version bump only for package @capacitor/core

# [9.0.0-alpha.4](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.3...9.0.0-alpha.4) (2026-06-19)

# [9.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/8.4.0...9.0.0-alpha.3) (2026-06-02)

# [8.4.0](https://github.com/ionic-team/capacitor/compare/8.3.4...8.4.0) (2026-06-02)

# [9.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.1...9.0.0-alpha.2) (2026-05-12)

**Note:** Version bump only for package @capacitor/core

## [8.3.4](https://github.com/ionic-team/capacitor/compare/8.3.3...8.3.4) (2026-05-12)

**Note:** Version bump only for package @capacitor/core

# [9.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/9.0.0-alpha.0...9.0.0-alpha.1) (2026-05-08)

**Note:** Version bump only for package @capacitor/core

## [8.3.3](https://github.com/ionic-team/capacitor/compare/8.3.2...8.3.3) (2026-05-08)

**Note:** Version bump only for package @capacitor/core

# [9.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/8.3.2...9.0.0-alpha.0) (2026-05-07)

### Bug Fixes

- **http:** handle URL objects on fetch ([#8386](https://github.com/ionic-team/capacitor/issues/8386)) ([0aac1f0](https://github.com/ionic-team/capacitor/commit/0aac1f0aee8083dc5013f0d8e3c180eb02f21141))
- **SystemBars:** use native safe area insets on Android ([#8384](https://github.com/ionic-team/capacitor/issues/8384)) ([d55f4f8](https://github.com/ionic-team/capacitor/commit/d55f4f859bd88fa5617699e874c48c451bcb5e5f))

## [8.3.2](https://github.com/ionic-team/capacitor/compare/8.3.1...8.3.2) (2026-05-07)

**Note:** Version bump only for package @capacitor/core

## [8.3.1](https://github.com/ionic-team/capacitor/compare/8.3.0...8.3.1) (2026-04-16)

**Note:** Version bump only for package @capacitor/core

# [8.3.0](https://github.com/ionic-team/capacitor/compare/8.2.0...8.3.0) (2026-03-25)

### Bug Fixes

- **http:** handle URL objects on fetch ([#8386](https://github.com/ionic-team/capacitor/issues/8386)) ([003099a](https://github.com/ionic-team/capacitor/commit/003099aef246adfd76d890074d46b1484951824b))
- **SystemBars:** use native safe area insets on Android ([#8384](https://github.com/ionic-team/capacitor/issues/8384)) ([4e99598](https://github.com/ionic-team/capacitor/commit/4e99598a2a57ee97e82be1aaa09492744622fa60))

# [8.2.0](https://github.com/ionic-team/capacitor/compare/8.1.0...8.2.0) (2026-03-06)

**Note:** Version bump only for package @capacitor/core

# [8.1.0](https://github.com/ionic-team/capacitor/compare/8.0.2...8.1.0) (2026-02-11)

### Bug Fixes

- **cookies:** only send expires param on web if a date is set ([b10cd7f](https://github.com/ionic-team/capacitor/commit/b10cd7ff15b010a76802374214f4e0cbd04abdab))

### Reverts

- revert version bump from [#8319](https://github.com/ionic-team/capacitor/issues/8319) and [#8320](https://github.com/ionic-team/capacitor/issues/8320) ([a48ebb6](https://github.com/ionic-team/capacitor/commit/a48ebb622ea4ebe92927bf1756a4d8ac6012884b))

## [8.0.2](https://github.com/ionic-team/capacitor/compare/8.0.1...8.0.2) (2026-01-27)

### Bug Fixes

- **core:** make SystemBars hide and show options optional ([#8305](https://github.com/ionic-team/capacitor/issues/8305)) ([95dc7d8](https://github.com/ionic-team/capacitor/commit/95dc7d8ace3aabdda7e325c4a8ef7d1432ad37e9))

## [8.0.1](https://github.com/ionic-team/capacitor/compare/8.0.0...8.0.1) (2026-01-13)

**Note:** Version bump only for package @capacitor/core

# [8.0.0](https://github.com/ionic-team/capacitor/compare/8.0.0-beta.0...8.0.0) (2025-12-08)

### Features

- **android:** Improving SystemBars inset handling ([#8268](https://github.com/ionic-team/capacitor/issues/8268)) ([81ae30a](https://github.com/ionic-team/capacitor/commit/81ae30a503797e417dd125b06262dabc4696c88a))

# [8.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/8.0.0-alpha.3...8.0.0-beta.0) (2025-11-14)

### Bug Fixes

- make Plugin.resolve act consistently ([#8225](https://github.com/ionic-team/capacitor/issues/8225)) ([06aeb9e](https://github.com/ionic-team/capacitor/commit/06aeb9e85d162d6be9d96820edcb2008cd74da84))

### Features

- System Bars Plugin ([#8180](https://github.com/ionic-team/capacitor/issues/8180)) ([a32216a](https://github.com/ionic-team/capacitor/commit/a32216ac0607172a3a9c7ae5cdbfc598769294a6))

# [8.0.0-alpha.3](https://github.com/ionic-team/capacitor/compare/8.0.0-alpha.2...8.0.0-alpha.3) (2025-10-22)

**Note:** Version bump only for package @capacitor/core

# [8.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/8.0.0-alpha.1...8.0.0-alpha.2) (2025-08-20)

**Note:** Version bump only for package @capacitor/core

# [8.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/7.4.2...8.0.0-alpha.1) (2025-08-20)

### Bug Fixes

- http content headers not sent when using axios ([#8039](https://github.com/ionic-team/capacitor/issues/8039)) ([67cac40](https://github.com/ionic-team/capacitor/commit/67cac40660b3e8cc78d1d228b7c6915450948ef1))

## [7.4.2](https://github.com/ionic-team/capacitor/compare/7.4.1...7.4.2) (2025-07-10)

**Note:** Version bump only for package @capacitor/core

## [7.4.1](https://github.com/ionic-team/capacitor/compare/7.4.0...7.4.1) (2025-07-03)

**Note:** Version bump only for package @capacitor/core

# [7.4.0](https://github.com/ionic-team/capacitor/compare/7.3.0...7.4.0) (2025-06-18)

**Note:** Version bump only for package @capacitor/core

# [7.3.0](https://github.com/ionic-team/capacitor/compare/7.2.0...7.3.0) (2025-06-05)

### Bug Fixes

- **core:** Prevent error when hasListeners is empty ([#7975](https://github.com/ionic-team/capacitor/issues/7975)) ([a4a0942](https://github.com/ionic-team/capacitor/commit/a4a0942eddba068e078bd782bb093ed1ecff9e00))

# [7.2.0](https://github.com/ionic-team/capacitor/compare/7.1.0...7.2.0) (2025-03-31)

### Features

- **http:** Apply overrideUserAgent to requests ([#7906](https://github.com/ionic-team/capacitor/issues/7906)) ([52482c9](https://github.com/ionic-team/capacitor/commit/52482c9d3c575b737054b41f9d1730c70cc5f471))

# [7.1.0](https://github.com/ionic-team/capacitor/compare/7.0.1...7.1.0) (2025-03-12)

### Bug Fixes

- **core:** use getPlatform instead of platform in cordova.js ([#7902](https://github.com/ionic-team/capacitor/issues/7902)) ([277db7b](https://github.com/ionic-team/capacitor/commit/277db7b48caaf870eefdf701ea99332c4338d7ed))
- **http:** boundary not added for Request objects ([#7897](https://github.com/ionic-team/capacitor/issues/7897)) ([bdaa6f3](https://github.com/ionic-team/capacitor/commit/bdaa6f3c38c33f3a021ac61f2de89101a5b66cff))

## [7.0.1](https://github.com/ionic-team/capacitor/compare/7.0.0...7.0.1) (2025-01-21)

**Note:** Version bump only for package @capacitor/core

# [7.0.0](https://github.com/ionic-team/capacitor/compare/7.0.0-rc.1...7.0.0) (2025-01-20)

**Note:** Version bump only for package @capacitor/core

# [7.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/7.0.0-rc.0...7.0.0-rc.1) (2025-01-20)

**Note:** Version bump only for package @capacitor/core

# [7.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/7.0.0-beta.0...7.0.0-rc.0) (2024-12-20)

**Note:** Version bump only for package @capacitor/core

# [7.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/7.0.0-alpha.2...7.0.0-beta.0) (2024-12-20)

**Note:** Version bump only for package @capacitor/core

# [7.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/7.0.0-alpha.1...7.0.0-alpha.2) (2024-11-19)

**Note:** Version bump only for package @capacitor/core

# [7.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/6.1.2...7.0.0-alpha.1) (2024-10-14)

**Note:** Version bump only for package @capacitor/core

## [6.1.2](https://github.com/ionic-team/capacitor/compare/6.1.1...6.1.2) (2024-08-07)

### Bug Fixes

- **http:** pass original url as query param on the proxy url ([#7527](https://github.com/ionic-team/capacitor/issues/7527)) ([1da06e6](https://github.com/ionic-team/capacitor/commit/1da06e66cb9cfbf5a5cc48ba6c23cdbe18bc8fc0))

## [6.1.1](https://github.com/ionic-team/capacitor/compare/6.1.0...6.1.1) (2024-07-17)

### Bug Fixes

- **http:** handle UInt8Array on body ([#7546](https://github.com/ionic-team/capacitor/issues/7546)) ([cfb9ce1](https://github.com/ionic-team/capacitor/commit/cfb9ce175615f69fe86b61af6d51ec2044d147cd))

# [6.1.0](https://github.com/ionic-team/capacitor/compare/6.0.0...6.1.0) (2024-06-11)

### Bug Fixes

- **http:** don't override readyState for non POST requests ([#7488](https://github.com/ionic-team/capacitor/issues/7488)) ([30c13a8](https://github.com/ionic-team/capacitor/commit/30c13a865e7710e6dc5f0ee014e951d52d030795))

# [6.0.0](https://github.com/ionic-team/capacitor/compare/6.0.0-rc.2...6.0.0) (2024-04-15)

### Bug Fixes

- **http:** Add URLSearchParams support ([#7374](https://github.com/ionic-team/capacitor/issues/7374)) ([9367ecc](https://github.com/ionic-team/capacitor/commit/9367ecc56a0c78249dccdf95dca5006422144289))
- **http:** prevent POST request from being proxied ([#7395](https://github.com/ionic-team/capacitor/issues/7395)) ([7b8c352](https://github.com/ionic-team/capacitor/commit/7b8c3523decd5610dcf09e926640bf35b382d61d))

# [6.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/6.0.0-rc.1...6.0.0-rc.2) (2024-03-25)

### Bug Fixes

- **http:** change proxy url generation ([#7354](https://github.com/ionic-team/capacitor/issues/7354)) ([318c316](https://github.com/ionic-team/capacitor/commit/318c316847c5b059fb88b46d4acd31e1ced477e5))
- vue 3 log warning causes error on iOS ([#6993](https://github.com/ionic-team/capacitor/issues/6993)) ([87271e2](https://github.com/ionic-team/capacitor/commit/87271e2671013ad35d13b22f2e96d4fe8f4eeaf0))

# [6.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/6.0.0-rc.0...6.0.0-rc.1) (2024-03-15)

### Bug Fixes

- **core:** make 'content-type' header count for XMLHttpRequest patch ([#7161](https://github.com/ionic-team/capacitor/issues/7161)) ([26d7f68](https://github.com/ionic-team/capacitor/commit/26d7f688284914c6ef795564ba424119efc32a1c))
- **http:** handle proxy urls with port ([#7273](https://github.com/ionic-team/capacitor/issues/7273)) ([514409a](https://github.com/ionic-team/capacitor/commit/514409aeb93ad65be105bbe2da8d2cd86ff159b0))
- **http:** keep original URL properties on proxy ([#7329](https://github.com/ionic-team/capacitor/issues/7329)) ([cbb6407](https://github.com/ionic-team/capacitor/commit/cbb6407225b42a0d9db4f335a9766f119501021d))
- **http:** Make proxy work with Request objects ([#7348](https://github.com/ionic-team/capacitor/issues/7348)) ([7e68725](https://github.com/ionic-team/capacitor/commit/7e6872573df03ab5cdc10a1a27db3e9fe81a141d))
- **http:** route get requests through custom handler ([#6818](https://github.com/ionic-team/capacitor/issues/6818)) ([b853d06](https://github.com/ionic-team/capacitor/commit/b853d065055b5a819949551be58b62d40b52e37c))
- **http:** set port for proxy url ([#7341](https://github.com/ionic-team/capacitor/issues/7341)) ([a3059dc](https://github.com/ionic-team/capacitor/commit/a3059dca4a7746d9fb7102a7d41f4da80e2f48b4))

### Features

- **webview:** add setServerAssetPath method ([881235b](https://github.com/ionic-team/capacitor/commit/881235b14de23ef988746bfb89a5a0fc3c8d8466))

# [6.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/6.0.0-beta.2...6.0.0-rc.0) (2024-01-23)

### Bug Fixes

- **web:** Implement `retainUntilConsumed` on notifyListeners ([#7127](https://github.com/ionic-team/capacitor/issues/7127)) ([526292e](https://github.com/ionic-team/capacitor/commit/526292eb273ee7d8fa9a9912ce3b59e9a104c19e))

# [6.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/6.0.0-beta.1...6.0.0-beta.2) (2023-12-14)

**Note:** Version bump only for package @capacitor/core

# [6.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/6.0.0-beta.0...6.0.0-beta.1) (2023-12-14)

**Note:** Version bump only for package @capacitor/core

# [6.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/6.0.0-alpha.2...6.0.0-beta.0) (2023-12-13)

### Bug Fixes

- **http:** parse readablestream data on fetch request objects ([#6919](https://github.com/ionic-team/capacitor/issues/6919)) ([80ec3b7](https://github.com/ionic-team/capacitor/commit/80ec3b73db18b7b6841bf90ed50a67389946ab87))
- **http:** set formdata boundary and body when content-type not explicitly set ([0c2ccd9](https://github.com/ionic-team/capacitor/commit/0c2ccd910a92ce3deaa67eb1819a4faa39c6af6e))

# [6.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/6.0.0-alpha.1...6.0.0-alpha.2) (2023-11-15)

**Note:** Version bump only for package @capacitor/core

# [6.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/5.2.3...6.0.0-alpha.1) (2023-11-08)

### Bug Fixes

- **android:** make local urls use unpatched fetch ([#6953](https://github.com/ionic-team/capacitor/issues/6953)) ([e50e56c](https://github.com/ionic-team/capacitor/commit/e50e56c5231f230497d1bd420e02e2e065c38f86))
- **http:** add support for Request objects in fetch ([24b3cc1](https://github.com/ionic-team/capacitor/commit/24b3cc113e3d8aae5d85dbf2d25bec0c35136477))
- **http:** inherit object properties on window.XMLHttpRequest ([91c11d0](https://github.com/ionic-team/capacitor/commit/91c11d06f773c45a10f6f2d52f672ae6f189b162))

# [5.6.0](https://github.com/ionic-team/capacitor/compare/5.5.1...5.6.0) (2023-12-14)

### Bug Fixes

- **http:** set formdata boundary and body when content-type not explicitly set ([#7133](https://github.com/ionic-team/capacitor/issues/7133)) ([3862d6e](https://github.com/ionic-team/capacitor/commit/3862d6e6721793d78add9acf5b14fd9a8f7a5b60))

## [5.5.1](https://github.com/ionic-team/capacitor/compare/5.5.0...5.5.1) (2023-10-25)

**Note:** Version bump only for package @capacitor/core

# [5.5.0](https://github.com/ionic-team/capacitor/compare/5.4.2...5.5.0) (2023-10-11)

**Note:** Version bump only for package @capacitor/core

## [5.4.2](https://github.com/ionic-team/capacitor/compare/5.4.1...5.4.2) (2023-10-04)

### Bug Fixes

- **android:** make local urls use unpatched fetch ([#6954](https://github.com/ionic-team/capacitor/issues/6954)) ([56fb853](https://github.com/ionic-team/capacitor/commit/56fb8536af53f4f4ee49b9394fd966ad514b9458))

## [5.4.1](https://github.com/ionic-team/capacitor/compare/5.4.0...5.4.1) (2023-09-21)

### Bug Fixes

- **http:** parse readablestream data on fetch request objects ([3fe0642](https://github.com/ionic-team/capacitor/commit/3fe06426bd20713e2322780b70bc5d97ad371fae))
- **http:** return xhr response headers case insensitive ([687b6b1](https://github.com/ionic-team/capacitor/commit/687b6b1780506c17fb73ed1d9cbf50c1d1e40ef1))

# [5.4.0](https://github.com/ionic-team/capacitor/compare/5.3.0...5.4.0) (2023-09-14)

### Bug Fixes

- **http:** add support for defining xhr and angular http response types ([09bd040](https://github.com/ionic-team/capacitor/commit/09bd040dfe4b8808d7499b6ee592005420406cac))
- **http:** add support for Request objects in fetch ([2fe4535](https://github.com/ionic-team/capacitor/commit/2fe4535e781b1a5cfa0f3359c1afa5c360073b6a))
- **http:** inherit object properties on window.XMLHttpRequest ([5cd3b2f](https://github.com/ionic-team/capacitor/commit/5cd3b2fa6d6936864e1aab2e98963df2d4da3b95))

# [5.3.0](https://github.com/ionic-team/capacitor/compare/5.2.3...5.3.0) (2023-08-23)

**Note:** Version bump only for package @capacitor/core

## [5.2.3](https://github.com/ionic-team/capacitor/compare/5.2.2...5.2.3) (2023-08-10)

### Bug Fixes

- **cli:** signing type option issue ([#6716](https://github.com/ionic-team/capacitor/issues/6716)) ([ee0f745](https://github.com/ionic-team/capacitor/commit/ee0f7457e458ca4bb4eb74f67552ac2ace76016b))
- **cookies:** hide httpOnly cookies from client ([0cc927e](https://github.com/ionic-team/capacitor/commit/0cc927ef5f0f7076a6d486d666d78483f1d71c54))
- **http:** return valid response for relative url xhr requests ([bde6569](https://github.com/ionic-team/capacitor/commit/bde65696218f97a8328041f137457f46e5eb766a))

## [5.2.2](https://github.com/ionic-team/capacitor/compare/5.2.1...5.2.2) (2023-07-19)

### Bug Fixes

- add http method to prototype.open ([#6740](https://github.com/ionic-team/capacitor/issues/6740)) ([1fd2d87](https://github.com/ionic-team/capacitor/commit/1fd2d8762ff2341a8fe20eec9e774c6a29576e88))

## [5.2.1](https://github.com/ionic-team/capacitor/compare/5.2.0...5.2.1) (2023-07-13)

**Note:** Version bump only for package @capacitor/core

# [5.2.0](https://github.com/ionic-team/capacitor/compare/5.1.1...5.2.0) (2023-07-12)

### Bug Fixes

- **http:** fire events in correct order when using xhr ([5ed3617](https://github.com/ionic-team/capacitor/commit/5ed361787596bb5949f6ae5e366495f296352bf3))

### Features

- **http:** support for FormData requests ([#6708](https://github.com/ionic-team/capacitor/issues/6708)) ([849c564](https://github.com/ionic-team/capacitor/commit/849c56458205bea3b078b1ee19807d7fd84c47b1))

## [5.1.1](https://github.com/ionic-team/capacitor/compare/5.1.0...5.1.1) (2023-07-05)

**Note:** Version bump only for package @capacitor/core

# [5.1.0](https://github.com/ionic-team/capacitor/compare/5.0.5...5.1.0) (2023-06-29)

### Features

- export buildRequestInit function so we can use for downloadFile ([95b0575](https://github.com/ionic-team/capacitor/commit/95b0575e3fbc1b1408aa69b61c58e18bf8882cea)

  )

## [5.0.5](https://github.com/ionic-team/capacitor/compare/5.0.4...5.0.5) (2023-06-09)

### Bug Fixes

- **http:** don't throw errors when content-type is null on response ([#6627](https://github.com/ionic-team/capacitor/issues/6627)) ([538821f](https://github.com/ionic-team/capacitor/commit/538821f267aa3b79548fed6aaea8880ff949ffdd))

## [5.0.4](https://github.com/ionic-team/capacitor/compare/5.0.3...5.0.4) (2023-05-23)

**Note:** Version bump only for package @capacitor/core

## [5.0.3](https://github.com/ionic-team/capacitor/compare/5.0.2...5.0.3) (2023-05-10)

**Note:** Version bump only for package @capacitor/core

## [5.0.2](https://github.com/ionic-team/capacitor/compare/5.0.1...5.0.2) (2023-05-09)

**Note:** Version bump only for package @capacitor/core

## [5.0.1](https://github.com/ionic-team/capacitor/compare/5.0.0...5.0.1) (2023-05-05)

**Note:** Version bump only for package @capacitor/core

# [5.0.0](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.3...5.0.0) (2023-05-03)

**Note:** Version bump only for package @capacitor/core

# [5.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.2...5.0.0-rc.3) (2023-05-03)

**Note:** Version bump only for package @capacitor/core

# [5.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.1...5.0.0-rc.2) (2023-05-03)

**Note:** Version bump only for package @capacitor/core

# [5.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/5.0.0-rc.0...5.0.0-rc.1) (2023-05-02)

**Note:** Version bump only for package @capacitor/core

# [5.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.3...5.0.0-rc.0) (2023-05-01)

**Note:** Version bump only for package @capacitor/core

# [5.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.2...5.0.0-beta.3) (2023-04-21)

**Note:** Version bump only for package @capacitor/core

# [5.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.1...5.0.0-beta.2) (2023-04-13)

**Note:** Version bump only for package @capacitor/core

# [5.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/5.0.0-beta.0...5.0.0-beta.1) (2023-04-03)

### Bug Fixes

- copy url from nativeResponse to response in native-bridge.ts ([#6397](https://github.com/ionic-team/capacitor/issues/6397)) ([e81a2ff](https://github.com/ionic-team/capacitor/commit/e81a2ff42ddd446f3004ab5af6e74209f7ff076a))

# [5.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/5.0.0-alpha.1...5.0.0-beta.0) (2023-03-31)

### Bug Fixes

- 204 http response ([#6266](https://github.com/ionic-team/capacitor/issues/6266)) ([771f6ce](https://github.com/ionic-team/capacitor/commit/771f6ce1f35159848db218a42dc4f56b5106f750))

### Features

- Upgrade to Typescript 5.x ([#6433](https://github.com/ionic-team/capacitor/issues/6433)) ([88d0ded](https://github.com/ionic-team/capacitor/commit/88d0ded9e7356531ffc4563b9b81a0f3f069484b))

# [5.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/4.7.0...5.0.0-alpha.1) (2023-03-16)

**Note:** Version bump only for package @capacitor/core

# [4.7.0](https://github.com/ionic-team/capacitor/compare/4.6.3...4.7.0) (2023-02-22)

### Bug Fixes

- handle fetch headers that are Headers objects ([#6320](https://github.com/ionic-team/capacitor/issues/6320)) ([cb00e49](https://github.com/ionic-team/capacitor/commit/cb00e4952acca8e877555f30b2190f6685d25934))
- **ios:** Correctly Attach Headers to Request ([#6303](https://github.com/ionic-team/capacitor/issues/6303)) ([a3f875c](https://github.com/ionic-team/capacitor/commit/a3f875cf42e111fde07d6e87643264b19ed77573))

## [4.6.3](https://github.com/ionic-team/capacitor/compare/4.6.2...4.6.3) (2023-02-03)

### Bug Fixes

- **ios:** crash when http headers contain numbers ([#6251](https://github.com/ionic-team/capacitor/issues/6251)) ([028c556](https://github.com/ionic-team/capacitor/commit/028c556a50b41ee99fe8f4f1aa2f42d3fd57f92d))

## [4.6.2](https://github.com/ionic-team/capacitor/compare/4.6.1...4.6.2) (2023-01-17)

**Note:** Version bump only for package @capacitor/core

## [4.6.1](https://github.com/ionic-team/capacitor/compare/4.6.0...4.6.1) (2022-12-05)

**Note:** Version bump only for package @capacitor/core

# [4.6.0](https://github.com/ionic-team/capacitor/compare/4.5.0...4.6.0) (2022-12-01)

### Bug Fixes

- **cookies:** Use Set-Cookie headers to persist cookies ([57f8b39](https://github.com/ionic-team/capacitor/commit/57f8b39d7f4c5ee0e5e5cb316913e9450a81d22b))

# [4.5.0](https://github.com/ionic-team/capacitor/compare/4.4.0...4.5.0) (2022-11-16)

### Features

- **cookies:** add get cookies plugin method ([ba1e770](https://github.com/ionic-team/capacitor/commit/ba1e7702a3338714aee24388c0afea39706c9341))

# [4.4.0](https://github.com/ionic-team/capacitor/compare/4.3.0...4.4.0) (2022-10-21)

### Bug Fixes

- **cookies:** make document.cookie setter synchronous ([2272abf](https://github.com/ionic-team/capacitor/commit/2272abf3d3d9dc82d9ca0d03b17e2b78f11f61fc))
- **http:** fix local http requests on native platforms ([c4e040a](https://github.com/ionic-team/capacitor/commit/c4e040a6f8c6b54bac6ae320e5f0f008604fe50f))

# [4.3.0](https://github.com/ionic-team/capacitor/compare/4.2.0...4.3.0) (2022-09-21)

### Bug Fixes

- **core:** Exception object was not set on Cap ([#5917](https://github.com/ionic-team/capacitor/issues/5917)) ([9ca27a4](https://github.com/ionic-team/capacitor/commit/9ca27a4f8441b368f8bf9d97dda57b1a55ac0e4e))

### Features

- Capacitor Cookies & Capacitor Http core plugins ([d4047cf](https://github.com/ionic-team/capacitor/commit/d4047cfa947676777f400389a8d65defae140b45))

# [4.2.0](https://github.com/ionic-team/capacitor/compare/4.1.0...4.2.0) (2022-09-08)

**Note:** Version bump only for package @capacitor/core

# [4.1.0](https://github.com/ionic-team/capacitor/compare/4.0.1...4.1.0) (2022-08-18)

**Note:** Version bump only for package @capacitor/core

## [4.0.1](https://github.com/ionic-team/capacitor/compare/4.0.0...4.0.1) (2022-07-28)

**Note:** Version bump only for package @capacitor/core

# [4.0.0](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.2...4.0.0) (2022-07-27)

### Features

- **android:** Add Optional Data Param for Error Object ([#5719](https://github.com/ionic-team/capacitor/issues/5719)) ([174172b](https://github.com/ionic-team/capacitor/commit/174172b6c64dc9117c48ed0e20c25e0b6c2fb625))
- **android:** Use addWebMessageListener where available ([#5427](https://github.com/ionic-team/capacitor/issues/5427)) ([c2dfe80](https://github.com/ionic-team/capacitor/commit/c2dfe808446717412b35e82713d123b7a052f264))

# [4.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.1...4.0.0-beta.2) (2022-07-08)

**Note:** Version bump only for package @capacitor/core

# [4.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/4.0.0-beta.0...4.0.0-beta.1) (2022-06-27)

**Note:** Version bump only for package @capacitor/core

# [4.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.6.0...4.0.0-beta.0) (2022-06-17)

**Note:** Version bump only for package @capacitor/core

# [3.6.0](https://github.com/ionic-team/capacitor/compare/3.5.1...3.6.0) (2022-06-17)

**Note:** Version bump only for package @capacitor/core

# [4.0.0-alpha.2](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.2) (2022-05-12)

**Note:** Version bump only for package @capacitor/core

## [3.5.1](https://github.com/ionic-team/capacitor/compare/3.5.0...3.5.1) (2022-05-04)

### Bug Fixes

- **core:** Make cordova bridge use Promise instead of setTimeout ([#5586](https://github.com/ionic-team/capacitor/issues/5586)) ([f35d96b](https://github.com/ionic-team/capacitor/commit/f35d96b185f5890600a64b78e6bf939c336cbb2d))

# [3.5.0](https://github.com/ionic-team/capacitor/compare/3.4.3...3.5.0) (2022-04-22)

**Note:** Version bump only for package @capacitor/core

# [4.0.0-alpha.1](https://github.com/ionic-team/capacitor/compare/3.4.1...4.0.0-alpha.1) (2022-03-25)

**Note:** Version bump only for package @capacitor/core

## [3.4.3](https://github.com/ionic-team/capacitor/compare/3.4.2...3.4.3) (2022-03-04)

**Note:** Version bump only for package @capacitor/core

## [3.4.2](https://github.com/ionic-team/capacitor/compare/3.4.1...3.4.2) (2022-03-03)

**Note:** Version bump only for package @capacitor/core

## [3.4.1](https://github.com/ionic-team/capacitor/compare/3.4.0...3.4.1) (2022-02-09)

**Note:** Version bump only for package @capacitor/core

# [3.4.0](https://github.com/ionic-team/capacitor/compare/3.3.4...3.4.0) (2022-01-19)

**Note:** Version bump only for package @capacitor/core

## [3.3.4](https://github.com/ionic-team/capacitor/compare/3.3.3...3.3.4) (2022-01-05)

**Note:** Version bump only for package @capacitor/core

## [3.3.3](https://github.com/ionic-team/capacitor/compare/3.3.2...3.3.3) (2021-12-08)

**Note:** Version bump only for package @capacitor/core

## [3.3.2](https://github.com/ionic-team/capacitor/compare/3.3.1...3.3.2) (2021-11-17)

**Note:** Version bump only for package @capacitor/core

## [3.3.1](https://github.com/ionic-team/capacitor/compare/3.3.0...3.3.1) (2021-11-05)

**Note:** Version bump only for package @capacitor/core

# [3.3.0](https://github.com/ionic-team/capacitor/compare/3.2.5...3.3.0) (2021-11-03)

### Bug Fixes

- **core:** avoid crash on logging circular objects ([#5186](https://github.com/ionic-team/capacitor/issues/5186)) ([1451ec8](https://github.com/ionic-team/capacitor/commit/1451ec850a9ef73267a032638e73f1fc440647b9))

## [3.2.5](https://github.com/ionic-team/capacitor/compare/3.2.4...3.2.5) (2021-10-13)

**Note:** Version bump only for package @capacitor/core

## [3.2.4](https://github.com/ionic-team/capacitor/compare/3.2.3...3.2.4) (2021-09-27)

### Bug Fixes

- **ios:** show correct line number on console logs ([#5073](https://github.com/ionic-team/capacitor/issues/5073)) ([ec41e74](https://github.com/ionic-team/capacitor/commit/ec41e743aa4ba81e791ad446fac461b7f43b46ed))

## [3.2.3](https://github.com/ionic-team/capacitor/compare/3.2.2...3.2.3) (2021-09-15)

**Note:** Version bump only for package @capacitor/core

## [3.2.2](https://github.com/ionic-team/capacitor/compare/3.2.1...3.2.2) (2021-09-02)

**Note:** Version bump only for package @capacitor/core

## [3.2.1](https://github.com/ionic-team/capacitor/compare/3.2.0...3.2.1) (2021-09-01)

**Note:** Version bump only for package @capacitor/core

# [3.2.0](https://github.com/ionic-team/capacitor/compare/3.1.2...3.2.0) (2021-08-18)

### Features

- **core:** implement CapacitorCustomPlatform for 3rd party platforms ([#4771](https://github.com/ionic-team/capacitor/issues/4771)) ([12c6294](https://github.com/ionic-team/capacitor/commit/12c6294b9eb82976b1322f00da9ba5a6004f7977))

## [3.1.2](https://github.com/ionic-team/capacitor/compare/3.1.1...3.1.2) (2021-07-21)

### Bug Fixes

- **core:** handle toJSON() in plugin objects ([#4823](https://github.com/ionic-team/capacitor/issues/4823)) ([0479822](https://github.com/ionic-team/capacitor/commit/04798221666437408f22947253a18ccb4f9e409e))
- **core:** Modify safeStringify to allow multiple null values ([#4853](https://github.com/ionic-team/capacitor/issues/4853)) ([854539b](https://github.com/ionic-team/capacitor/commit/854539b62a658e484954edbe38b25eea1b0b6f10))

## [3.1.1](https://github.com/ionic-team/capacitor/compare/3.1.0...3.1.1) (2021-07-07)

**Note:** Version bump only for package @capacitor/core

# [3.1.0](https://github.com/ionic-team/capacitor/compare/3.0.2...3.1.0) (2021-07-07)

**Note:** Version bump only for package @capacitor/core

## [3.0.2](https://github.com/ionic-team/capacitor/compare/3.0.1...3.0.2) (2021-06-23)

### Bug Fixes

- **core:** cordova events not firing ([#4712](https://github.com/ionic-team/capacitor/issues/4712)) ([ca4e3b6](https://github.com/ionic-team/capacitor/commit/ca4e3b62dba6a40e593a1404ba2fe2b416a4ac14))

## [3.0.1](https://github.com/ionic-team/capacitor/compare/3.0.0...3.0.1) (2021-06-09)

### Bug Fixes

- Make isPluginAvailable available on bridge ([#4589](https://github.com/ionic-team/capacitor/issues/4589)) ([151e7a8](https://github.com/ionic-team/capacitor/commit/151e7a899d9646dbd5625a2539fd3f2297349bc5))

# [3.0.0](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.4...3.0.0) (2021-05-18)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-rc.4](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.3...3.0.0-rc.4) (2021-05-18)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-rc.3](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.2...3.0.0-rc.3) (2021-05-11)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-rc.2](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.1...3.0.0-rc.2) (2021-05-07)

### Bug Fixes

- **bridge:** Fix type errors with new Platforms API ([#4524](https://github.com/ionic-team/capacitor/issues/4524)) ([7bbaea8](https://github.com/ionic-team/capacitor/commit/7bbaea85494c53a950abab40bb77f37087e22abe))
- **bridge:** Safely JSON.Stringify circular json on log ([#4507](https://github.com/ionic-team/capacitor/issues/4507)) ([e4c8fe4](https://github.com/ionic-team/capacitor/commit/e4c8fe41ec3992df5c20e4d0d3b69240ce672e44)), closes [#4506](https://github.com/ionic-team/capacitor/issues/4506)

### Features

- **core:** platforms api ([#4255](https://github.com/ionic-team/capacitor/issues/4255)) ([7d62713](https://github.com/ionic-team/capacitor/commit/7d6271369cb15eeab07c0bc7f606de6447a17cd4))

# [3.0.0-rc.1](https://github.com/ionic-team/capacitor/compare/3.0.0-rc.0...3.0.0-rc.1) (2021-04-29)

### Bug Fixes

- **core:** Call native implementation before web implementation ([#4493](https://github.com/ionic-team/capacitor/issues/4493)) ([febd606](https://github.com/ionic-team/capacitor/commit/febd60617ab60a3b34132f68f212e9a867d1b434))
- **core:** Use web listener if there is no native implementation ([#4488](https://github.com/ionic-team/capacitor/issues/4488)) ([196d843](https://github.com/ionic-team/capacitor/commit/196d843a3c9442c5dc6cf61bfe3494fa399dec4f))

### Features

- Unify logging behavior across environments ([#4416](https://github.com/ionic-team/capacitor/issues/4416)) ([bae0f3d](https://github.com/ionic-team/capacitor/commit/bae0f3d2cee84978636d0f589bc7e2f745671baf))

# [3.0.0-rc.0](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.6...3.0.0-rc.0) (2021-03-10)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-beta.6](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.5...3.0.0-beta.6) (2021-02-27)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-beta.5](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.4...3.0.0-beta.5) (2021-02-27)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-beta.3](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.2...3.0.0-beta.3) (2021-02-18)

### Bug Fixes

- **core:** do not add window.cordova on web apps ([#4214](https://github.com/ionic-team/capacitor/issues/4214)) ([6d673ef](https://github.com/ionic-team/capacitor/commit/6d673ef7076f00c37eac0f801c4c487415df6d4d))

# [3.0.0-beta.2](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.1...3.0.0-beta.2) (2021-02-08)

### Bug Fixes

- **core:** handle js.error messages to fix window error handler ([#4124](https://github.com/ionic-team/capacitor/issues/4124)) ([c0deb1d](https://github.com/ionic-team/capacitor/commit/c0deb1de349f5631af08eecbffc0ea4dea97c60d))
- address bug in `isPluginAvailable()` for web and native ([#4114](https://github.com/ionic-team/capacitor/issues/4114)) ([2fbd954](https://github.com/ionic-team/capacitor/commit/2fbd95465a321b8f4c50d4daf22a63d8043cee9b))
- **core:** fix another $$typeof issue ([#4113](https://github.com/ionic-team/capacitor/issues/4113)) ([4cbae41](https://github.com/ionic-team/capacitor/commit/4cbae41908670ab843bea5850da7a2cf1082afdb))

# [3.0.0-beta.1](https://github.com/ionic-team/capacitor/compare/3.0.0-beta.0...3.0.0-beta.1) (2021-01-14)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.14...3.0.0-beta.0) (2021-01-13)

### Features

- **core:** add commonjs output format ([#4064](https://github.com/ionic-team/capacitor/issues/4064)) ([74b7be8](https://github.com/ionic-team/capacitor/commit/74b7be89ef1bbf13ccd103410037cfe81c8fc124))

# [3.0.0-alpha.12](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.11...3.0.0-alpha.12) (2021-01-08)

### Bug Fixes

- **core:** fix $$typeof() not implemented error ([#4013](https://github.com/ionic-team/capacitor/issues/4013)) ([c7f80b5](https://github.com/ionic-team/capacitor/commit/c7f80b577c1de60cd0a105f3aaf0d1c314f3150d))

# [3.0.0-alpha.9](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.8...3.0.0-alpha.9) (2020-12-15)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-alpha.8](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.7...3.0.0-alpha.8) (2020-12-15)

**Note:** Version bump only for package @capacitor/core

# [3.0.0-alpha.7](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.6...3.0.0-alpha.7) (2020-12-02)

### Bug Fixes

- **core:** export PermissionState ([#3775](https://github.com/ionic-team/capacitor/issues/3775)) ([2d5ac96](https://github.com/ionic-team/capacitor/commit/2d5ac963d131a704628f8a421be8429b9f63cf61))

# [3.0.0-alpha.6](https://github.com/ionic-team/capacitor/compare/3.0.0-alpha.5...3.0.0-alpha.6) (2020-10-30)

### Features

- improve permissions ([eec61a6](https://github.com/ionic-team/capacitor/commit/eec61a6d8d8edfe94aea1a361787d1e6c736e20d))
- unified errors and error codes ([#3673](https://github.com/ionic-team/capacitor/issues/3673)) ([f9e0803](https://github.com/ionic-team/capacitor/commit/f9e08038aa88f7453e8235f380d2767a12a7a073))

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

- **core:** provide mock implementation for unimplemented platforms ([#3352](https://github.com/ionic-team/capacitor/issues/3352)) ([befe230](https://github.com/ionic-team/capacitor/commit/befe2300435dbd54b22882fb6586c722f5ef466d))
- **core:** use more explicit result for Browser plugin events ([#3349](https://github.com/ionic-team/capacitor/issues/3349)) ([75f99d4](https://github.com/ionic-team/capacitor/commit/75f99d4de62a6afb2da0ff876ed3b0d351040184))
- **core:** use own type for backButton event result ([#3348](https://github.com/ionic-team/capacitor/issues/3348)) ([05d0e45](https://github.com/ionic-team/capacitor/commit/05d0e457eb69d5d39c8bb1d0117bc3d31afdca93))

### Features

- **core:** add unsupported browser exception ([#3389](https://github.com/ionic-team/capacitor/issues/3389)) ([c51e8f8](https://github.com/ionic-team/capacitor/commit/c51e8f8960c795421b35ad1fdd1cd6afbd7a7dfc))

# [3.0.0-alpha.0](https://github.com/ionic-team/capacitor/compare/2.3.0...3.0.0-alpha.0) (2020-07-23)

### Features

- **core:** add `registerPlugin` for importing from plugin packages ([#3305](https://github.com/ionic-team/capacitor/issues/3305)) ([95475cc](https://github.com/ionic-team/capacitor/commit/95475cceb4cbd5be2cc7e18f2cf3045eb6c6f7fd))
