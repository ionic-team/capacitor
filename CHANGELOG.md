## [2.0.0-beta.0](https://github.com/ionic-team/capacitor/compare/1.5.0...2.0.0-beta.0) (2020-03-09)


### Bug Fixes

* fix(android): Make Modals.showActions non cancelable (#2504) ([ffdd78c](https://github.com/ionic-team/capacitor/commit/ffdd78c)), closes [#2504](https://github.com/ionic-team/capacitor/issues/2504)
* fix(android): missing AndroidX changes (#2454) ([10acf5c](https://github.com/ionic-team/capacitor/commit/10acf5c)), closes [#2454](https://github.com/ionic-team/capacitor/issues/2454)
* fix(android): plugin retained events not being retained if listeners were empty (#2408) ([b817e83](https://github.com/ionic-team/capacitor/commit/b817e83)), closes [#2408](https://github.com/ionic-team/capacitor/issues/2408)
* fix(android): put google() on top of jcenter() in gradle files (#2461) ([3263dbc](https://github.com/ionic-team/capacitor/commit/3263dbc)), closes [#2461](https://github.com/ionic-team/capacitor/issues/2461)
* fix(android): return original camera image if edition was canceled (#2358) ([ce93ed3](https://github.com/ionic-team/capacitor/commit/ce93ed3)), closes [#2358](https://github.com/ionic-team/capacitor/issues/2358)
* fix(cli): Avoid AndroidManifest.xml not found error on add (#2400) ([120969c](https://github.com/ionic-team/capacitor/commit/120969c)), closes [#2400](https://github.com/ionic-team/capacitor/issues/2400)
* fix(cli): properly merge non application config-file (#2478) ([9c589a3](https://github.com/ionic-team/capacitor/commit/9c589a3)), closes [#2478](https://github.com/ionic-team/capacitor/issues/2478)
* fix(cordova): handle source-file with framework attribute (#2507) ([f7cd4c0](https://github.com/ionic-team/capacitor/commit/f7cd4c0)), closes [#2507](https://github.com/ionic-team/capacitor/issues/2507)
* fix(doctor): add electron checks (#2434) ([d5efb05](https://github.com/ionic-team/capacitor/commit/d5efb05)), closes [#2434](https://github.com/ionic-team/capacitor/issues/2434)
* fix(ios): avoid crash on registerPlugins on Xcode 11.4 (#2414) ([ca8fa9e](https://github.com/ionic-team/capacitor/commit/ca8fa9e)), closes [#2414](https://github.com/ionic-team/capacitor/issues/2414)
* fix(ios): implement statusTap for iOS 13 (#2376) ([7cb77c8](https://github.com/ionic-team/capacitor/commit/7cb77c8)), closes [#2376](https://github.com/ionic-team/capacitor/issues/2376)
* fix(ios): make ActionSheetOptionStyle.Cancel show cancel button (#2496) ([d120021](https://github.com/ionic-team/capacitor/commit/d120021)), closes [#2496](https://github.com/ionic-team/capacitor/issues/2496)
* fix(ios): Make Clipboard plugin return errors (#2430) ([6a2ee92](https://github.com/ionic-team/capacitor/commit/6a2ee92)), closes [#2430](https://github.com/ionic-team/capacitor/issues/2430)
* fix(LocalNotifications): return proper LocalNotificationScheduleResult on schedule (#2490) ([b89fb15](https://github.com/ionic-team/capacitor/commit/b89fb15)), closes [#2490](https://github.com/ionic-team/capacitor/issues/2490)
* fix(modals): make inputPlaceholder set a placeholder and not text (#2474) ([8002791](https://github.com/ionic-team/capacitor/commit/8002791)), closes [#2474](https://github.com/ionic-team/capacitor/issues/2474)
* fix(modals): make showActions work on web and electron (#2501) ([f1204b8](https://github.com/ionic-team/capacitor/commit/f1204b8)), closes [#2501](https://github.com/ionic-team/capacitor/issues/2501)
* fix(toast): unify duration across platforms (#2340) ([717dd0a](https://github.com/ionic-team/capacitor/commit/717dd0a)), closes [#2340](https://github.com/ionic-team/capacitor/issues/2340)


### Features

* feat: add requestPermission to PushNotifications and LocalNotifications (#2516) ([82e38a4](https://github.com/ionic-team/capacitor/commit/82e38a4)), closes [#2516](https://github.com/ionic-team/capacitor/issues/2516)
* feat: Allow plugins to reject with a string code (#2533) ([f93c354](https://github.com/ionic-team/capacitor/commit/f93c354)), closes [#2533](https://github.com/ionic-team/capacitor/issues/2533)
* feat(android): Allow plugin methods to crash (#2512) ([253cdc9](https://github.com/ionic-team/capacitor/commit/253cdc9)), closes [#2512](https://github.com/ionic-team/capacitor/issues/2512)
* feat(android): Enable AndroidX and use AndroidX dependencies (#2045) ([8b606e9](https://github.com/ionic-team/capacitor/commit/8b606e9)), closes [#2045](https://github.com/ionic-team/capacitor/issues/2045)
* feat(android): Handle onDestroy lifecycle event in plugins (#2421) ([6fe6d25](https://github.com/ionic-team/capacitor/commit/6fe6d25)), closes [#2421](https://github.com/ionic-team/capacitor/issues/2421)
* feat(android): make AppRestoredResult also returns error info and success boolean (#2497) ([b650880](https://github.com/ionic-team/capacitor/commit/b650880)), closes [#2497](https://github.com/ionic-team/capacitor/issues/2497)
* feat(android): Make Bridge.restoreInstanceState() public (#2538) ([7020f1f](https://github.com/ionic-team/capacitor/commit/7020f1f)), closes [#2538](https://github.com/ionic-team/capacitor/issues/2538)
* feat(android): provide WebViewClient accessor (#2477) ([dd3875b](https://github.com/ionic-team/capacitor/commit/dd3875b)), closes [#2477](https://github.com/ionic-team/capacitor/issues/2477)
* feat(android): update gradle and dependencies (#2431) ([6598752](https://github.com/ionic-team/capacitor/commit/6598752)), closes [#2431](https://github.com/ionic-team/capacitor/issues/2431)
* feat(android): use common variables for config and dependencies (#2534) ([d1009bb](https://github.com/ionic-team/capacitor/commit/d1009bb)), closes [#2534](https://github.com/ionic-team/capacitor/issues/2534)
* feat(android): use Fused Location Provider on Geolocation plugin (#2409) ([7faec79](https://github.com/ionic-team/capacitor/commit/7faec79)), closes [#2409](https://github.com/ionic-team/capacitor/issues/2409)
* feat(clipboard): allow to write images on web plugin (#2523) ([5ba2a20](https://github.com/ionic-team/capacitor/commit/5ba2a20)), closes [#2523](https://github.com/ionic-team/capacitor/issues/2523)
* feat(clipboard): remove Clipboard.read() options (#2527) ([2209113](https://github.com/ionic-team/capacitor/commit/2209113)), closes [#2527](https://github.com/ionic-team/capacitor/issues/2527)
* feat(Device): Add getBatteryInfo function (#2435) ([0deca04](https://github.com/ionic-team/capacitor/commit/0deca04)), closes [#2435](https://github.com/ionic-team/capacitor/issues/2435)
* feat(electron): Remove injectCapacitor function (#2415) ([d17f0be](https://github.com/ionic-team/capacitor/commit/d17f0be)), closes [#2415](https://github.com/ionic-team/capacitor/issues/2415)
* feat(Filesystem): add recursive option to writeFile (#2487) ([53211a3](https://github.com/ionic-team/capacitor/commit/53211a3)), closes [#2487](https://github.com/ionic-team/capacitor/issues/2487)
* feat(Filesystem): make writeFile return the file uri (#2484) ([e1a00bd](https://github.com/ionic-team/capacitor/commit/e1a00bd)), closes [#2484](https://github.com/ionic-team/capacitor/issues/2484)
* feat(Filesystem): Remove createIntermediateDirectories from MkdirOptions (#2410) ([dae3510](https://github.com/ionic-team/capacitor/commit/dae3510)), closes [#2410](https://github.com/ionic-team/capacitor/issues/2410)
* feat(Filesystem): remove FilesystemDirectory.Application (#2514) ([cd395d2](https://github.com/ionic-team/capacitor/commit/cd395d2)), closes [#2514](https://github.com/ionic-team/capacitor/issues/2514)
* feat(ios): add device name to Device.getInfo() (#2491) ([4fb244d](https://github.com/ionic-team/capacitor/commit/4fb244d)), closes [#2491](https://github.com/ionic-team/capacitor/issues/2491)
* feat(ios): change native location accuracy values (#2420) ([16c3ea1](https://github.com/ionic-team/capacitor/commit/16c3ea1)), closes [#2420](https://github.com/ionic-team/capacitor/issues/2420)
* feat(ios): Update Capacitor project to Swift 5.0 (#2465) ([c895fc4](https://github.com/ionic-team/capacitor/commit/c895fc4)), closes [#2465](https://github.com/ionic-team/capacitor/issues/2465)
* feat(modals): add inputText property to prompt for prefilled text (#2475) ([a05311d](https://github.com/ionic-team/capacitor/commit/a05311d)), closes [#2475](https://github.com/ionic-team/capacitor/issues/2475)
* feat(PushNotifications): Make register method return if permission was granted (#2324) ([a0bcf5c](https://github.com/ionic-team/capacitor/commit/a0bcf5c)), closes [#2324](https://github.com/ionic-team/capacitor/issues/2324)


### Docs

* docs: fix Local Notifications url (#2542) ([a3a19b3](https://github.com/ionic-team/capacitor/commit/a3a19b3)), closes [#2542](https://github.com/ionic-team/capacitor/issues/2542)
* docs: update default cordovaSwiftVersion (#2466) ([4908bbb](https://github.com/ionic-team/capacitor/commit/4908bbb)), closes [#2466](https://github.com/ionic-team/capacitor/issues/2466)
* docs(ce-guides): Remove dead link (#2418) ([a1b6403](https://github.com/ionic-team/capacitor/commit/a1b6403)), closes [#2418](https://github.com/ionic-team/capacitor/issues/2418)
* docs(ce-plugins): add capacitor-healthkit (#2489) ([9e356db](https://github.com/ionic-team/capacitor/commit/9e356db)), closes [#2489](https://github.com/ionic-team/capacitor/issues/2489)
* docs(ce-plugins): Remove or replace deprecated plugins (#2419) ([dfc1ed6](https://github.com/ionic-team/capacitor/commit/dfc1ed6)), closes [#2419](https://github.com/ionic-team/capacitor/issues/2419)
* docs(network): Remove example guide because of dead link (#2417) ([2364505](https://github.com/ionic-team/capacitor/commit/2364505)), closes [#2417](https://github.com/ionic-team/capacitor/issues/2417)


### Chores

* chore: make deploy script publish Android before iOS (#2520) ([08a2ebc](https://github.com/ionic-team/capacitor/commit/08a2ebc)), closes [#2520](https://github.com/ionic-team/capacitor/issues/2520)
* chore: remove electron from lerna (#2544) ([9610570](https://github.com/ionic-team/capacitor/commit/9610570)), closes [#2544](https://github.com/ionic-team/capacitor/issues/2544)
* chore: Update changelog for 1.5.0 ([cf2f746](https://github.com/ionic-team/capacitor/commit/cf2f746))
* chore(android): remove unused launch_splash.xml (#2411) ([8c9fe93](https://github.com/ionic-team/capacitor/commit/8c9fe93)), closes [#2411](https://github.com/ionic-team/capacitor/issues/2411)
* chore(android): target SDK version 29 (#2433) ([4ff1943](https://github.com/ionic-team/capacitor/commit/4ff1943)), closes [#2433](https://github.com/ionic-team/capacitor/issues/2433)
* chore(circleci): update Xcode and remove install-cocoapods job (#2402) ([599c5c4](https://github.com/ionic-team/capacitor/commit/599c5c4)), closes [#2402](https://github.com/ionic-team/capacitor/issues/2402)
* chore(cli): fix lint errors (#2479) ([f2ff5ab](https://github.com/ionic-team/capacitor/commit/f2ff5ab)), closes [#2479](https://github.com/ionic-team/capacitor/issues/2479)
* chore(cli): fix tests for newer node versions (#2403) ([c40d993](https://github.com/ionic-team/capacitor/commit/c40d993)), closes [#2403](https://github.com/ionic-team/capacitor/issues/2403)
* chore(electron): update template to use latest electron (#2492) ([178eb65](https://github.com/ionic-team/capacitor/commit/178eb65)), closes [#2492](https://github.com/ionic-team/capacitor/issues/2492)
* chore(example): update electron project to work with latest capacitor (#2485) ([09fff9b](https://github.com/ionic-team/capacitor/commit/09fff9b)), closes [#2485](https://github.com/ionic-team/capacitor/issues/2485)
* chore(ios): add platform to Podfile (#2463) ([209e649](https://github.com/ionic-team/capacitor/commit/209e649)), closes [#2463](https://github.com/ionic-team/capacitor/issues/2463)
* chore(ios): drop Xcode 10 support (#2472) ([255a046](https://github.com/ionic-team/capacitor/commit/255a046)), closes [#2472](https://github.com/ionic-team/capacitor/issues/2472)
* chore(ios): remove deprecated .swift_version file (#2464) ([63e942e](https://github.com/ionic-team/capacitor/commit/63e942e)), closes [#2464](https://github.com/ionic-team/capacitor/issues/2464)
* chore(ios): Update app template to use iOS 5 (#2467) ([f2facf6](https://github.com/ionic-team/capacitor/commit/f2facf6)), closes [#2467](https://github.com/ionic-team/capacitor/issues/2467)
* chore(ios): update example app to use Swift 5 (#2471) ([afd8554](https://github.com/ionic-team/capacitor/commit/afd8554)), closes [#2471](https://github.com/ionic-team/capacitor/issues/2471)
* chore(ios): Update plugin template to Swift 5 (#2468) ([2f9c8e6](https://github.com/ionic-team/capacitor/commit/2f9c8e6)), closes [#2468](https://github.com/ionic-team/capacitor/issues/2468)
* chore(tests): run lint on circleci (#2480) ([2ec6cf5](https://github.com/ionic-team/capacitor/commit/2ec6cf5)), closes [#2480](https://github.com/ionic-team/capacitor/issues/2480)