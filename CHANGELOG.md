##  (2020-05-07)

## [2.1.0](https://github.com/ionic-team/capacitor/compare/2.0.2...2.1.0) (2020-05-07)


### Bug Fixes

* fix: set launchShowDuration to 0 on new projects only (#2876) ([8de0414](https://github.com/ionic-team/capacitor/commit/8de0414)), closes [#2876](https://github.com/ionic-team/capacitor/issues/2876)
* fix(android): call error on prompt cancel (#2855) ([c86cfb1](https://github.com/ionic-team/capacitor/commit/c86cfb1)), closes [#2855](https://github.com/ionic-team/capacitor/issues/2855)
* fix(android): check if NETWORK_PROVIDER is enabled (#2859) ([f4d5c84](https://github.com/ionic-team/capacitor/commit/f4d5c84)), closes [#2859](https://github.com/ionic-team/capacitor/issues/2859)
* fix(android): make readFile not add newlines on base64 strings (#2857) ([31d65c9](https://github.com/ionic-team/capacitor/commit/31d65c9)), closes [#2857](https://github.com/ionic-team/capacitor/issues/2857)
* fix(cli): avoid infinite loop on scoped dependencies (#2868) ([69d62f7](https://github.com/ionic-team/capacitor/commit/69d62f7)), closes [#2868](https://github.com/ionic-team/capacitor/issues/2868)
* fix(ios): remove thread warning on Haptics.selectionEnd() (#2860) ([471ed0c](https://github.com/ionic-team/capacitor/commit/471ed0c)), closes [#2860](https://github.com/ionic-team/capacitor/issues/2860)
* fix(splash): Make splash launch delay timeout zero to speed up capacitor boot ([b29346b](https://github.com/ionic-team/capacitor/commit/b29346b))


### Features

* feat: Add common hideLogs option (#2865) ([1b3f0ec](https://github.com/ionic-team/capacitor/commit/1b3f0ec)), closes [#2865](https://github.com/ionic-team/capacitor/issues/2865)
* feat: Allow plugins to override navigation (#2872) ([41f9834](https://github.com/ionic-team/capacitor/commit/41f9834)), closes [#2872](https://github.com/ionic-team/capacitor/issues/2872)
* feat(android): add vibration option to notifications channel (#2787) ([2f6f0ba](https://github.com/ionic-team/capacitor/commit/2f6f0ba)), closes [#2787](https://github.com/ionic-team/capacitor/issues/2787)
* feat(android): expose JSON string constructor for JSArray (#2879) ([040bfc8](https://github.com/ionic-team/capacitor/commit/040bfc8)), closes [#2879](https://github.com/ionic-team/capacitor/issues/2879)
* feat(android): hideLogs feature (#2839) ([d60757a](https://github.com/ionic-team/capacitor/commit/d60757a)), closes [#2839](https://github.com/ionic-team/capacitor/issues/2839)
* feat(android): implement selection haptic feedback (#2704) ([34dd280](https://github.com/ionic-team/capacitor/commit/34dd280)), closes [#2704](https://github.com/ionic-team/capacitor/issues/2704)
* feat(camera): make prompt strings localizable (#2631) ([0c09fc8](https://github.com/ionic-team/capacitor/commit/0c09fc8)), closes [#2631](https://github.com/ionic-team/capacitor/issues/2631)
* feat(cordova): Add WK_WEB_VIEW_ONLY=1 preprocessor macro (#2880) ([603b2e3](https://github.com/ionic-team/capacitor/commit/603b2e3)), closes [#2880](https://github.com/ionic-team/capacitor/issues/2880)


### Docs

* docs(browser): Update information for close method (#2796) ([89c64af](https://github.com/ionic-team/capacitor/commit/89c64af)), closes [#2796](https://github.com/ionic-team/capacitor/issues/2796)



## [2.0.2](https://github.com/ionic-team/capacitor/compare/2.0.1...2.0.2) (2020-04-29)


### Bug Fixes

* fix(android) : App can crash on clipboard.read if empty (#2815) ([fc33265](https://github.com/ionic-team/capacitor/commit/fc33265)), closes [#2815](https://github.com/ionic-team/capacitor/issues/2815)
* fix(android): avoid camera crash on photo edit cancel (#2776) ([4b8820d](https://github.com/ionic-team/capacitor/commit/4b8820d)), closes [#2776](https://github.com/ionic-team/capacitor/issues/2776)
* fix(android): don't remove LocalNotification from pending on dismiss (#2809) ([822b140](https://github.com/ionic-team/capacitor/commit/822b140)), closes [#2809](https://github.com/ionic-team/capacitor/issues/2809)
* fix(ios): allow Browser popover presentation if supported (#2784) ([4b40494](https://github.com/ionic-team/capacitor/commit/4b40494)), closes [#2784](https://github.com/ionic-team/capacitor/issues/2784)
* fix(ios): remove applicationState check on keyboard plugin (#2820) ([dbc1da1](https://github.com/ionic-team/capacitor/commit/dbc1da1)), closes [#2820](https://github.com/ionic-team/capacitor/issues/2820)
* fix(web): Gracefully degrade Proxy usage to fix IE11 (#2759) ([b61f909](https://github.com/ionic-team/capacitor/commit/b61f909)), closes [#2759](https://github.com/ionic-team/capacitor/issues/2759)


### Docs

* docs(ios/configuration): Add information on how to rename your app (#2768) ([55c3d52](https://github.com/ionic-team/capacitor/commit/55c3d52)), closes [#2768](https://github.com/ionic-team/capacitor/issues/2768)
* docs: improve visibility of jetifier command (#2844) ([fd28a3a](https://github.com/ionic-team/capacitor/commit/fd28a3a)), closes [#2844](https://github.com/ionic-team/capacitor/issues/2844)
* docs(android): explain where to apply the variables change (#2791) ([e5bd2eb](https://github.com/ionic-team/capacitor/commit/e5bd2eb)), closes [#2791](https://github.com/ionic-team/capacitor/issues/2791)
* docs(ce-plugins): Add capacitor-admob-advanced (#2780) ([9b1593d](https://github.com/ionic-team/capacitor/commit/9b1593d)), closes [#2780](https://github.com/ionic-team/capacitor/issues/2780)
* docs(deep-links): Rename applinks.json to assetlinks.json (#2842) ([53883ce](https://github.com/ionic-team/capacitor/commit/53883ce)), closes [#2842](https://github.com/ionic-team/capacitor/issues/2842)
* docs(firebase pn): Update Push Notifications with Firebase Guide (#2698) ([ee5e283](https://github.com/ionic-team/capacitor/commit/ee5e283)), closes [#2698](https://github.com/ionic-team/capacitor/issues/2698)
* docs(keyboard): Add missing import in example (#2749) ([04fb275](https://github.com/ionic-team/capacitor/commit/04fb275)), closes [#2749](https://github.com/ionic-team/capacitor/issues/2749)
* docs(troubleshooting): Add AndroidX information and workaround (#2832) ([d9cd399](https://github.com/ionic-team/capacitor/commit/d9cd399)), closes [#2832](https://github.com/ionic-team/capacitor/issues/2832)
* docs(updating): Provide a full path to variables.gradle file (#2769) ([3638a89](https://github.com/ionic-team/capacitor/commit/3638a89)), closes [#2769](https://github.com/ionic-team/capacitor/issues/2769)
* docs(updating): Remove duplicate gradle sentence (#2798) ([347029c](https://github.com/ionic-team/capacitor/commit/347029c)), closes [#2798](https://github.com/ionic-team/capacitor/issues/2798)


### Chores

* chore: remove blog (#2813) ([e219e69](https://github.com/ionic-team/capacitor/commit/e219e69)), closes [#2813](https://github.com/ionic-team/capacitor/issues/2813)
* chore: remove electron mentions (#2812) ([4dad4a1](https://github.com/ionic-team/capacitor/commit/4dad4a1)), closes [#2812](https://github.com/ionic-team/capacitor/issues/2812)
* chore(core): update jest (#2843) ([b525c17](https://github.com/ionic-team/capacitor/commit/b525c17)), closes [#2843](https://github.com/ionic-team/capacitor/issues/2843)



## [2.0.1](https://github.com/ionic-team/capacitor/compare/2.0.0...2.0.1) (2020-04-10)


### Bug Fixes

* fix(android): Avoid crash on schedule if LocalNotifications are disabled (#2718) ([aac51fe](https://github.com/ionic-team/capacitor/commit/aac51fe)), closes [#2718](https://github.com/ionic-team/capacitor/issues/2718)
* fix(android): display title on Modals.showActions (#2730) ([c2e0358](https://github.com/ionic-team/capacitor/commit/c2e0358)), closes [#2730](https://github.com/ionic-team/capacitor/issues/2730)
* fix(android): input autofocus and javascript focus not working (#2719) ([e010a28](https://github.com/ionic-team/capacitor/commit/e010a28)), closes [#2719](https://github.com/ionic-team/capacitor/issues/2719)
* fix(android): use proper targetSdkVersion (#2706) ([3cd02e4](https://github.com/ionic-team/capacitor/commit/3cd02e4)), closes [#2706](https://github.com/ionic-team/capacitor/issues/2706)
* fix(cli): avoid error on create command (#2727) ([fefa4b9](https://github.com/ionic-team/capacitor/commit/fefa4b9)), closes [#2727](https://github.com/ionic-team/capacitor/issues/2727)
* fix(cli): match platform version with cli version on add command (#2724) ([6172932](https://github.com/ionic-team/capacitor/commit/6172932)), closes [#2724](https://github.com/ionic-team/capacitor/issues/2724)
* fix(cli): use appName as package.json name on electron project (#2741) ([d6fc2d8](https://github.com/ionic-team/capacitor/commit/d6fc2d8)), closes [#2741](https://github.com/ionic-team/capacitor/issues/2741)
* fix(cli): Warn if core version doesn't match platform version (#2736) ([29a9acf](https://github.com/ionic-team/capacitor/commit/29a9acf)), closes [#2736](https://github.com/ionic-team/capacitor/issues/2736)
* fix(cordova): Don't add as system library if it's a vendored library (#2729) ([404574d](https://github.com/ionic-team/capacitor/commit/404574d)), closes [#2729](https://github.com/ionic-team/capacitor/issues/2729)
* fix(cordova): handle plugin.xml asset tag (#2728) ([8e1abfe](https://github.com/ionic-team/capacitor/commit/8e1abfe)), closes [#2728](https://github.com/ionic-team/capacitor/issues/2728)
* fix(electron): Update Modals Plugin to use new dialog async syntax (#2742) ([4c13fe0](https://github.com/ionic-team/capacitor/commit/4c13fe0)), closes [#2742](https://github.com/ionic-team/capacitor/issues/2742)
* fix(ios): allow access to extension-less files (#2726) ([3baf81b](https://github.com/ionic-team/capacitor/commit/3baf81b)), closes [#2726](https://github.com/ionic-team/capacitor/issues/2726)
* fix(ios): don't use the tmpWindow on popover presentation (#2714) ([327ffc5](https://github.com/ionic-team/capacitor/commit/327ffc5)), closes [#2714](https://github.com/ionic-team/capacitor/issues/2714)
* fix(plugin-template): remove incorrect = from android gradle file (#2689) ([39c8d4a](https://github.com/ionic-team/capacitor/commit/39c8d4a)), closes [#2689](https://github.com/ionic-team/capacitor/issues/2689)


### Docs

* docs(ce-plugins): Remove capacitor-apple-login (#2734) ([b532179](https://github.com/ionic-team/capacitor/commit/b532179)), closes [#2734](https://github.com/ionic-team/capacitor/issues/2734)
* docs(updating): Add 2.0.0 changes for electron (#2708) ([6a03960](https://github.com/ionic-team/capacitor/commit/6a03960)), closes [#2708](https://github.com/ionic-team/capacitor/issues/2708)
* docs(updating): Add some 2.0.0 missing information (#2707) ([46ca030](https://github.com/ionic-team/capacitor/commit/46ca030)), closes [#2707](https://github.com/ionic-team/capacitor/issues/2707)
* docs(updating): modify the guides for 2.0.0 final ([00f6196](https://github.com/ionic-team/capacitor/commit/00f6196))


### Chores

* chore(android): fix release script to use Android X (#2687) ([a63e203](https://github.com/ionic-team/capacitor/commit/a63e203)), closes [#2687](https://github.com/ionic-team/capacitor/issues/2687)
* chore(android): Improve handling of splashImmersive and splashFullScreen preferences (#2705) ([1c633c5](https://github.com/ionic-team/capacitor/commit/1c633c5)), closes [#2705](https://github.com/ionic-team/capacitor/issues/2705)



## [2.0.0](https://github.com/ionic-team/capacitor/compare/1.5.0...2.0.0) (2020-04-03)


### Bug Fixes

* fix(android): allow Share plugin to provide text or url only (#2436) ([b6328f0](https://github.com/ionic-team/capacitor/commit/b6328f0)), closes [#2436](https://github.com/ionic-team/capacitor/issues/2436)
* fix(android): Avoid Accessibility.speak crash (#2554) ([77b59f8](https://github.com/ionic-team/capacitor/commit/77b59f8)), closes [#2554](https://github.com/ionic-team/capacitor/issues/2554)
* fix(android): don't return NO_CAMERA_ERROR if any camera is present (#2558) ([4f6ca98](https://github.com/ionic-team/capacitor/commit/4f6ca98)), closes [#2558](https://github.com/ionic-team/capacitor/issues/2558)
* fix(android): maintain status bar color during splash (#2603) ([59fcf9e](https://github.com/ionic-team/capacitor/commit/59fcf9e)), closes [#2603](https://github.com/ionic-team/capacitor/issues/2603)
* fix(android): make camera work on Android 10 (#2559) ([4a1a7b8](https://github.com/ionic-team/capacitor/commit/4a1a7b8)), closes [#2559](https://github.com/ionic-team/capacitor/issues/2559)
* fix(android): make LocalNotification not crash on showing when (#2677) ([63ecd1c](https://github.com/ionic-team/capacitor/commit/63ecd1c)), closes [#2677](https://github.com/ionic-team/capacitor/issues/2677)
* fix(android): Make Modals.showActions non cancelable (#2504) ([ffdd78c](https://github.com/ionic-team/capacitor/commit/ffdd78c)), closes [#2504](https://github.com/ionic-team/capacitor/issues/2504)
* fix(android): make sure scheduled time is shown in LocalNotifications (#2553) ([448e7b7](https://github.com/ionic-team/capacitor/commit/448e7b7)), closes [#2553](https://github.com/ionic-team/capacitor/issues/2553)
* fix(android): missing AndroidX changes (#2454) ([10acf5c](https://github.com/ionic-team/capacitor/commit/10acf5c)), closes [#2454](https://github.com/ionic-team/capacitor/issues/2454)
* fix(android): plugin retained events not being retained if listeners were empty (#2408) ([b817e83](https://github.com/ionic-team/capacitor/commit/b817e83)), closes [#2408](https://github.com/ionic-team/capacitor/issues/2408)
* fix(android): put google() on top of jcenter() in gradle files (#2461) ([3263dbc](https://github.com/ionic-team/capacitor/commit/3263dbc)), closes [#2461](https://github.com/ionic-team/capacitor/issues/2461)
* fix(android): return original camera image if edition was canceled (#2358) ([ce93ed3](https://github.com/ionic-team/capacitor/commit/ce93ed3)), closes [#2358](https://github.com/ionic-team/capacitor/issues/2358)
* fix(android): support for multi-line text in LocalNotifications (#2552) ([59d02ab](https://github.com/ionic-team/capacitor/commit/59d02ab)), closes [#2552](https://github.com/ionic-team/capacitor/issues/2552)
* fix(android): Use NotificationCompat constant for setting visibility (#2586) ([62b11fd](https://github.com/ionic-team/capacitor/commit/62b11fd)), closes [#2586](https://github.com/ionic-team/capacitor/issues/2586)
* fix(cli): Avoid AndroidManifest.xml not found error on add (#2400) ([120969c](https://github.com/ionic-team/capacitor/commit/120969c)), closes [#2400](https://github.com/ionic-team/capacitor/issues/2400)
* fix(cli): avoid error when config.xml has no preferences (#2627) ([6c0dc4b](https://github.com/ionic-team/capacitor/commit/6c0dc4b)), closes [#2627](https://github.com/ionic-team/capacitor/issues/2627)
* fix(cli): prevent cordova dependency loop if plugin contains @ (#2622) ([9dcb2ff](https://github.com/ionic-team/capacitor/commit/9dcb2ff)), closes [#2622](https://github.com/ionic-team/capacitor/issues/2622)
* fix(cli): properly merge non application config-file (#2478) ([9c589a3](https://github.com/ionic-team/capacitor/commit/9c589a3)), closes [#2478](https://github.com/ionic-team/capacitor/issues/2478)
* fix(cordova): Add lib prefix to .a library names (#2636) ([2be4a92](https://github.com/ionic-team/capacitor/commit/2be4a92)), closes [#2636](https://github.com/ionic-team/capacitor/issues/2636)
* fix(cordova): handle source-file with framework attribute (#2507) ([f7cd4c0](https://github.com/ionic-team/capacitor/commit/f7cd4c0)), closes [#2507](https://github.com/ionic-team/capacitor/issues/2507)
* fix(doctor): add electron checks (#2434) ([d5efb05](https://github.com/ionic-team/capacitor/commit/d5efb05)), closes [#2434](https://github.com/ionic-team/capacitor/issues/2434)
* fix(electron): correct implementation of Filesystem.appendFile (#2567) ([c6a3b3b](https://github.com/ionic-team/capacitor/commit/c6a3b3b)), closes [#2567](https://github.com/ionic-team/capacitor/issues/2567)
* fix(electron): Provide app version in Device.getInfo() (#2521) ([0998ae8](https://github.com/ionic-team/capacitor/commit/0998ae8)), closes [#2521](https://github.com/ionic-team/capacitor/issues/2521)
* fix(electron): various clipboard fixes (#2566) ([2c809ab](https://github.com/ionic-team/capacitor/commit/2c809ab)), closes [#2566](https://github.com/ionic-team/capacitor/issues/2566)
* fix(ios): avoid crash on registerPlugins on Xcode 11.4 (#2414) ([ca8fa9e](https://github.com/ionic-team/capacitor/commit/ca8fa9e)), closes [#2414](https://github.com/ionic-team/capacitor/issues/2414)
* fix(ios): implement statusTap for iOS 13 (#2376) ([7cb77c8](https://github.com/ionic-team/capacitor/commit/7cb77c8)), closes [#2376](https://github.com/ionic-team/capacitor/issues/2376)
* fix(ios): make ActionSheetOptionStyle.Cancel show cancel button (#2496) ([d120021](https://github.com/ionic-team/capacitor/commit/d120021)), closes [#2496](https://github.com/ionic-team/capacitor/issues/2496)
* fix(ios): Make Camera.getPhoto return exif from gallery photos (#2595) ([18f9d81](https://github.com/ionic-team/capacitor/commit/18f9d81)), closes [#2595](https://github.com/ionic-team/capacitor/issues/2595)
* fix(ios): Make Clipboard plugin return errors (#2430) ([6a2ee92](https://github.com/ionic-team/capacitor/commit/6a2ee92)), closes [#2430](https://github.com/ionic-team/capacitor/issues/2430)
* fix(ios): make Clipboard.read return text/plain (#2565) ([078284d](https://github.com/ionic-team/capacitor/commit/078284d)), closes [#2565](https://github.com/ionic-team/capacitor/issues/2565)
* fix(ios): return error if Cancel is selected from Camera.getPhoto() prompt (#2550) ([a015f8f](https://github.com/ionic-team/capacitor/commit/a015f8f)), closes [#2550](https://github.com/ionic-team/capacitor/issues/2550)
* fix(ios): writeFile failing on root folders (#2670) ([f7a800c](https://github.com/ionic-team/capacitor/commit/f7a800c)), closes [#2670](https://github.com/ionic-team/capacitor/issues/2670)
* fix(LocalNotifications): return proper LocalNotificationScheduleResult on schedule (#2490) ([b89fb15](https://github.com/ionic-team/capacitor/commit/b89fb15)), closes [#2490](https://github.com/ionic-team/capacitor/issues/2490)
* fix(modals): make inputPlaceholder set a placeholder and not text (#2474) ([8002791](https://github.com/ionic-team/capacitor/commit/8002791)), closes [#2474](https://github.com/ionic-team/capacitor/issues/2474)
* fix(modals): make showActions work on web and electron (#2501) ([f1204b8](https://github.com/ionic-team/capacitor/commit/f1204b8)), closes [#2501](https://github.com/ionic-team/capacitor/issues/2501)
* fix(toast): unify duration across platforms (#2340) ([717dd0a](https://github.com/ionic-team/capacitor/commit/717dd0a)), closes [#2340](https://github.com/ionic-team/capacitor/issues/2340)


### Features

* feat: add requestPermission to PushNotifications and LocalNotifications (#2516) ([82e38a4](https://github.com/ionic-team/capacitor/commit/82e38a4)), closes [#2516](https://github.com/ionic-team/capacitor/issues/2516)
* feat: Allow plugins to reject with a string code (#2533) ([f93c354](https://github.com/ionic-team/capacitor/commit/f93c354)), closes [#2533](https://github.com/ionic-team/capacitor/issues/2533)
* feat: implement removeAllListeners (#2609) ([ac55d63](https://github.com/ionic-team/capacitor/commit/ac55d63)), closes [#2609](https://github.com/ionic-team/capacitor/issues/2609)
* feat(android): add configurable icon color for local notifications (#2548) ([0bfa0bf](https://github.com/ionic-team/capacitor/commit/0bfa0bf)), closes [#2548](https://github.com/ionic-team/capacitor/issues/2548)
* feat(android): Add immersive configuration to Splash (#2425) ([2605ad6](https://github.com/ionic-team/capacitor/commit/2605ad6)), closes [#2425](https://github.com/ionic-team/capacitor/issues/2425)
* feat(android): Add lights and lightColor to PushNotificationChannel (#2618) ([4c0170c](https://github.com/ionic-team/capacitor/commit/4c0170c)), closes [#2618](https://github.com/ionic-team/capacitor/issues/2618)
* feat(android): Add Statusbar.setOverlaysWebView method (#2597) ([d035939](https://github.com/ionic-team/capacitor/commit/d035939)), closes [#2597](https://github.com/ionic-team/capacitor/issues/2597)
* feat(android): Allow plugin methods to crash (#2512) ([253cdc9](https://github.com/ionic-team/capacitor/commit/253cdc9)), closes [#2512](https://github.com/ionic-team/capacitor/issues/2512)
* feat(android): Allow to configure a default notification sound (#2682) ([93eb9aa](https://github.com/ionic-team/capacitor/commit/93eb9aa)), closes [#2682](https://github.com/ionic-team/capacitor/issues/2682)
* feat(android): avoid app restart on activity resize or uiMode change (#2584) ([4a29ff8](https://github.com/ionic-team/capacitor/commit/4a29ff8)), closes [#2584](https://github.com/ionic-team/capacitor/issues/2584)
* feat(android): Enable AndroidX and use AndroidX dependencies (#2045) ([8b606e9](https://github.com/ionic-team/capacitor/commit/8b606e9)), closes [#2045](https://github.com/ionic-team/capacitor/issues/2045)
* feat(android): Handle onDestroy lifecycle event in plugins (#2421) ([6fe6d25](https://github.com/ionic-team/capacitor/commit/6fe6d25)), closes [#2421](https://github.com/ionic-team/capacitor/issues/2421)
* feat(android): implement BridgeFragment for easier embedding using Fragments (#2666) ([a8d9591](https://github.com/ionic-team/capacitor/commit/a8d9591)), closes [#2666](https://github.com/ionic-team/capacitor/issues/2666)
* feat(android): make AppRestoredResult also returns error info and success boolean (#2497) ([b650880](https://github.com/ionic-team/capacitor/commit/b650880)), closes [#2497](https://github.com/ionic-team/capacitor/issues/2497)
* feat(android): Make Bridge.restoreInstanceState() public (#2538) ([7020f1f](https://github.com/ionic-team/capacitor/commit/7020f1f)), closes [#2538](https://github.com/ionic-team/capacitor/issues/2538)
* feat(android): make JSObject.getString return null instead of 'null' string (#2602) ([52069b7](https://github.com/ionic-team/capacitor/commit/52069b7)), closes [#2602](https://github.com/ionic-team/capacitor/issues/2602)
* feat(android): Make variables.gradle file not mandatory (#2600) ([4fc5039](https://github.com/ionic-team/capacitor/commit/4fc5039)), closes [#2600](https://github.com/ionic-team/capacitor/issues/2600)
* feat(android): provide WebViewClient accessor (#2477) ([dd3875b](https://github.com/ionic-team/capacitor/commit/dd3875b)), closes [#2477](https://github.com/ionic-team/capacitor/issues/2477)
* feat(android): update gradle and dependencies (#2431) ([6598752](https://github.com/ionic-team/capacitor/commit/6598752)), closes [#2431](https://github.com/ionic-team/capacitor/issues/2431)
* feat(android): use common variables for config and dependencies (#2534) ([d1009bb](https://github.com/ionic-team/capacitor/commit/d1009bb)), closes [#2534](https://github.com/ionic-team/capacitor/issues/2534)
* feat(android): use Fused Location Provider on Geolocation plugin (#2409) ([7faec79](https://github.com/ionic-team/capacitor/commit/7faec79)), closes [#2409](https://github.com/ionic-team/capacitor/issues/2409)
* feat(App): Add getState method to check current app state (#2611) ([f20bf29](https://github.com/ionic-team/capacitor/commit/f20bf29)), closes [#2611](https://github.com/ionic-team/capacitor/issues/2611)
* feat(camera): unify saveToGallery behavior (#2671) ([2185833](https://github.com/ionic-team/capacitor/commit/2185833)), closes [#2671](https://github.com/ionic-team/capacitor/issues/2671)
* feat(camera): Unify saveToGallery default value to false (#2557) ([d222226](https://github.com/ionic-team/capacitor/commit/d222226)), closes [#2557](https://github.com/ionic-team/capacitor/issues/2557)
* feat(cli): make init use values from capacitor.config.json as defaults (#2620) ([9157e1f](https://github.com/ionic-team/capacitor/commit/9157e1f)), closes [#2620](https://github.com/ionic-team/capacitor/issues/2620)
* feat(cli): use name from package.json as default name (#2621) ([e9bec42](https://github.com/ionic-team/capacitor/commit/e9bec42)), closes [#2621](https://github.com/ionic-team/capacitor/issues/2621)
* feat(clipboard): allow to write images on web plugin (#2523) ([5ba2a20](https://github.com/ionic-team/capacitor/commit/5ba2a20)), closes [#2523](https://github.com/ionic-team/capacitor/issues/2523)
* feat(clipboard): remove Clipboard.read() options (#2527) ([2209113](https://github.com/ionic-team/capacitor/commit/2209113)), closes [#2527](https://github.com/ionic-team/capacitor/issues/2527)
* feat(Device): Add getBatteryInfo function (#2435) ([0deca04](https://github.com/ionic-team/capacitor/commit/0deca04)), closes [#2435](https://github.com/ionic-team/capacitor/issues/2435)
* feat(electron): Remove injectCapacitor function (#2415) ([d17f0be](https://github.com/ionic-team/capacitor/commit/d17f0be)), closes [#2415](https://github.com/ionic-team/capacitor/issues/2415)
* feat(Filesystem): add recursive option to writeFile (#2487) ([53211a3](https://github.com/ionic-team/capacitor/commit/53211a3)), closes [#2487](https://github.com/ionic-team/capacitor/issues/2487)
* feat(Filesystem): make writeFile return the file uri (#2484) ([e1a00bd](https://github.com/ionic-team/capacitor/commit/e1a00bd)), closes [#2484](https://github.com/ionic-team/capacitor/issues/2484)
* feat(Filesystem): Remove createIntermediateDirectories from MkdirOptions (#2410) ([dae3510](https://github.com/ionic-team/capacitor/commit/dae3510)), closes [#2410](https://github.com/ionic-team/capacitor/issues/2410)
* feat(Filesystem): remove FilesystemDirectory.Application (#2514) ([cd395d2](https://github.com/ionic-team/capacitor/commit/cd395d2)), closes [#2514](https://github.com/ionic-team/capacitor/issues/2514)
* feat(ios): add device name to Device.getInfo() (#2491) ([4fb244d](https://github.com/ionic-team/capacitor/commit/4fb244d)), closes [#2491](https://github.com/ionic-team/capacitor/issues/2491)
* feat(ios): add presentVC and dismissVC methods to bridge (#2678) ([a6c91da](https://github.com/ionic-team/capacitor/commit/a6c91da)), closes [#2678](https://github.com/ionic-team/capacitor/issues/2678)
* feat(ios): allow to set status bar animation style on show and hide (#2587) ([fa6bb3e](https://github.com/ionic-team/capacitor/commit/fa6bb3e)), closes [#2587](https://github.com/ionic-team/capacitor/issues/2587)
* feat(ios): change native location accuracy values (#2420) ([16c3ea1](https://github.com/ionic-team/capacitor/commit/16c3ea1)), closes [#2420](https://github.com/ionic-team/capacitor/issues/2420)
* feat(ios): Update Capacitor project to Swift 5.0 (#2465) ([c895fc4](https://github.com/ionic-team/capacitor/commit/c895fc4)), closes [#2465](https://github.com/ionic-team/capacitor/issues/2465)
* feat(LocalNotifications): add createChannel, deleteChannel and listChannels methods (#2676) ([d72e25d](https://github.com/ionic-team/capacitor/commit/d72e25d)), closes [#2676](https://github.com/ionic-team/capacitor/issues/2676)
* feat(LocalNotifications): Allow to create notifications without activity (#2648) ([a4e5918](https://github.com/ionic-team/capacitor/commit/a4e5918)), closes [#2648](https://github.com/ionic-team/capacitor/issues/2648)
* feat(modals): add inputText property to prompt for prefilled text (#2475) ([a05311d](https://github.com/ionic-team/capacitor/commit/a05311d)), closes [#2475](https://github.com/ionic-team/capacitor/issues/2475)
* feat(PushNotifications): Make register method return if permission was granted (#2324) ([a0bcf5c](https://github.com/ionic-team/capacitor/commit/a0bcf5c)), closes [#2324](https://github.com/ionic-team/capacitor/issues/2324)


### Docs

* updated local notification config docs (#2601) ([9997b3e](https://github.com/ionic-team/capacitor/commit/9997b3e)), closes [#2601](https://github.com/ionic-team/capacitor/issues/2601)
* docs: fix Local Notifications url (#2542) ([a3a19b3](https://github.com/ionic-team/capacitor/commit/a3a19b3)), closes [#2542](https://github.com/ionic-team/capacitor/issues/2542)
* docs: update default cordovaSwiftVersion (#2466) ([4908bbb](https://github.com/ionic-team/capacitor/commit/4908bbb)), closes [#2466](https://github.com/ionic-team/capacitor/issues/2466)
* docs: update Filesystem.writeFile sample (#2568) ([5122527](https://github.com/ionic-team/capacitor/commit/5122527)), closes [#2568](https://github.com/ionic-team/capacitor/issues/2568)
* docs(android): Add update guide for Capacitor 2.0 beta (#2572) ([0f0ed25](https://github.com/ionic-team/capacitor/commit/0f0ed25)), closes [#2572](https://github.com/ionic-team/capacitor/issues/2572)
* docs(camera): add missing usage descriptions needed in iOS (#2633) ([7692ee4](https://github.com/ionic-team/capacitor/commit/7692ee4)), closes [#2633](https://github.com/ionic-team/capacitor/issues/2633)
* docs(ce-guides): Remove dead link (#2418) ([a1b6403](https://github.com/ionic-team/capacitor/commit/a1b6403)), closes [#2418](https://github.com/ionic-team/capacitor/issues/2418)
* docs(ce-plugins): Add capacitor-dark-mode plugin (#2681) ([4fcb725](https://github.com/ionic-team/capacitor/commit/4fcb725)), closes [#2681](https://github.com/ionic-team/capacitor/issues/2681)
* docs(ce-plugins): add capacitor-healthkit (#2489) ([9e356db](https://github.com/ionic-team/capacitor/commit/9e356db)), closes [#2489](https://github.com/ionic-team/capacitor/issues/2489)
* docs(ce-plugins): Add SQLite, SQLite Storage and Video Player plugins (#2589) ([78a28da](https://github.com/ionic-team/capacitor/commit/78a28da)), closes [#2589](https://github.com/ionic-team/capacitor/issues/2589)
* docs(ce-plugins): Remove or replace deprecated plugins (#2419) ([dfc1ed6](https://github.com/ionic-team/capacitor/commit/dfc1ed6)), closes [#2419](https://github.com/ionic-team/capacitor/issues/2419)
* docs(clipboard): update read example removing options (#2564) ([49e9f8d](https://github.com/ionic-team/capacitor/commit/49e9f8d)), closes [#2564](https://github.com/ionic-team/capacitor/issues/2564)
* docs(contributing): Update docs contributing readme (#2592) ([0799d52](https://github.com/ionic-team/capacitor/commit/0799d52)), closes [#2592](https://github.com/ionic-team/capacitor/issues/2592)
* docs(dependencies): update to latest Capacitor (#2599) ([0154f51](https://github.com/ionic-team/capacitor/commit/0154f51)), closes [#2599](https://github.com/ionic-team/capacitor/issues/2599)
* docs(Device): fix getInfo response and add getBatteryInfo example (#2569) ([057512a](https://github.com/ionic-team/capacitor/commit/057512a)), closes [#2569](https://github.com/ionic-team/capacitor/issues/2569)
* docs(firebase-guide): update guide with Capacitor 2.0 changes (#2598) ([4f0e749](https://github.com/ionic-team/capacitor/commit/4f0e749)), closes [#2598](https://github.com/ionic-team/capacitor/issues/2598)
* docs(guides): Add new Deep Links guide (#2581) ([b9e25f3](https://github.com/ionic-team/capacitor/commit/b9e25f3)), closes [#2581](https://github.com/ionic-team/capacitor/issues/2581)
* docs(ios): Add update guide for Capacitor 2.0 beta (#2571) ([ca0baf7](https://github.com/ionic-team/capacitor/commit/ca0baf7)), closes [#2571](https://github.com/ionic-team/capacitor/issues/2571)
* docs(ios): Document hideLogs config option (#2619) ([23b2173](https://github.com/ionic-team/capacitor/commit/23b2173)), closes [#2619](https://github.com/ionic-team/capacitor/issues/2619)
* docs(LocalNotifications): Update schedule sample (#2570) ([00d313f](https://github.com/ionic-team/capacitor/commit/00d313f)), closes [#2570](https://github.com/ionic-team/capacitor/issues/2570)
* docs(network): Remove example guide because of dead link (#2417) ([2364505](https://github.com/ionic-team/capacitor/commit/2364505)), closes [#2417](https://github.com/ionic-team/capacitor/issues/2417)
* docs(permissions): Display permissions page on side menu (#2684) ([1ccc3c0](https://github.com/ionic-team/capacitor/commit/1ccc3c0)), closes [#2684](https://github.com/ionic-team/capacitor/issues/2684)
* docs(site): Add target blank to external links in site header (#2543) ([f6c2288](https://github.com/ionic-team/capacitor/commit/f6c2288)), closes [#2543](https://github.com/ionic-team/capacitor/issues/2543)
* docs(Splash): document splashFullScreen and splashImmersive config options (#2613) ([c381202](https://github.com/ionic-team/capacitor/commit/c381202)), closes [#2613](https://github.com/ionic-team/capacitor/issues/2613)
* docs(StatusBar): Fix typo in setOverlaysWebView usage (#2673) ([05f23fb](https://github.com/ionic-team/capacitor/commit/05f23fb)), closes [#2673](https://github.com/ionic-team/capacitor/issues/2673)
* docs(types): explain FilesystemDirectory types (#2663) ([6a6cd8b](https://github.com/ionic-team/capacitor/commit/6a6cd8b)), closes [#2663](https://github.com/ionic-team/capacitor/issues/2663)
* docs(update guide): fix targetSdkVersion instructions (#2585) ([0b4ade8](https://github.com/ionic-team/capacitor/commit/0b4ade8)), closes [#2585](https://github.com/ionic-team/capacitor/issues/2585)
* docs(updating): Include beta 1 updating steps (#2629) ([ece7c47](https://github.com/ionic-team/capacitor/commit/ece7c47)), closes [#2629](https://github.com/ionic-team/capacitor/issues/2629)


### Chores

* chore: make deploy script publish Android before iOS (#2520) ([08a2ebc](https://github.com/ionic-team/capacitor/commit/08a2ebc)), closes [#2520](https://github.com/ionic-team/capacitor/issues/2520)
* chore: update electron core dependency ([a37d1bf](https://github.com/ionic-team/capacitor/commit/a37d1bf))
* chore(android): remove unused launch_splash.xml (#2411) ([8c9fe93](https://github.com/ionic-team/capacitor/commit/8c9fe93)), closes [#2411](https://github.com/ionic-team/capacitor/issues/2411)
* chore(android): target SDK version 29 (#2433) ([4ff1943](https://github.com/ionic-team/capacitor/commit/4ff1943)), closes [#2433](https://github.com/ionic-team/capacitor/issues/2433)
* chore(android): Update to latest Gradle plugin and wrapper (#2573) ([221ce96](https://github.com/ionic-team/capacitor/commit/221ce96)), closes [#2573](https://github.com/ionic-team/capacitor/issues/2573)
* chore(android): use AndroidX to build ([1480a6f](https://github.com/ionic-team/capacitor/commit/1480a6f))
* chore(circleci): update Xcode and remove install-cocoapods job (#2402) ([599c5c4](https://github.com/ionic-team/capacitor/commit/599c5c4)), closes [#2402](https://github.com/ionic-team/capacitor/issues/2402)
* chore(cli): fix lint errors (#2479) ([f2ff5ab](https://github.com/ionic-team/capacitor/commit/f2ff5ab)), closes [#2479](https://github.com/ionic-team/capacitor/issues/2479)
* chore(cli): fix tests for newer node versions (#2403) ([c40d993](https://github.com/ionic-team/capacitor/commit/c40d993)), closes [#2403](https://github.com/ionic-team/capacitor/issues/2403)
* chore(dependencies): Update package dependencies to 2.0.0 (#2686) ([d708cfd](https://github.com/ionic-team/capacitor/commit/d708cfd)), closes [#2686](https://github.com/ionic-team/capacitor/issues/2686)
* chore(electron): update template to use latest electron (#2492) ([178eb65](https://github.com/ionic-team/capacitor/commit/178eb65)), closes [#2492](https://github.com/ionic-team/capacitor/issues/2492)
* chore(example): Fix Clipboard.read() (#2546) ([6b88ba8](https://github.com/ionic-team/capacitor/commit/6b88ba8)), closes [#2546](https://github.com/ionic-team/capacitor/issues/2546)
* chore(example): update electron project to work with latest capacitor (#2485) ([09fff9b](https://github.com/ionic-team/capacitor/commit/09fff9b)), closes [#2485](https://github.com/ionic-team/capacitor/issues/2485)
* chore(ios): add platform to Podfile (#2463) ([209e649](https://github.com/ionic-team/capacitor/commit/209e649)), closes [#2463](https://github.com/ionic-team/capacitor/issues/2463)
* chore(ios): drop Xcode 10 support (#2472) ([255a046](https://github.com/ionic-team/capacitor/commit/255a046)), closes [#2472](https://github.com/ionic-team/capacitor/issues/2472)
* chore(ios): remove deprecated .swift_version file (#2464) ([63e942e](https://github.com/ionic-team/capacitor/commit/63e942e)), closes [#2464](https://github.com/ionic-team/capacitor/issues/2464)
* chore(ios): Update app template to use iOS 5 (#2467) ([f2facf6](https://github.com/ionic-team/capacitor/commit/f2facf6)), closes [#2467](https://github.com/ionic-team/capacitor/issues/2467)
* chore(ios): update example app to use Swift 5 (#2471) ([afd8554](https://github.com/ionic-team/capacitor/commit/afd8554)), closes [#2471](https://github.com/ionic-team/capacitor/issues/2471)
* chore(ios): Update plugin template to Swift 5 (#2468) ([2f9c8e6](https://github.com/ionic-team/capacitor/commit/2f9c8e6)), closes [#2468](https://github.com/ionic-team/capacitor/issues/2468)
* chore(tests): run lint on circleci (#2480) ([2ec6cf5](https://github.com/ionic-team/capacitor/commit/2ec6cf5)), closes [#2480](https://github.com/ionic-team/capacitor/issues/2480)