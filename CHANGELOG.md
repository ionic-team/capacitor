## [1.5.0](https://github.com/ionic-team/capacitor/compare/1.4.0...1.5.0) (2020-02-03)

### Bug Fixes

* fix(web/clipboard): allow writing empty string (#2371) ([4a41922](https://github.com/ionic-team/capacitor/commit/4a41922)), closes [#2371](https://github.com/ionic-team/capacitor/issues/2371)
* fix(android): add missing GPS tags to exif data (#2284) ([3b43df1](https://github.com/ionic-team/capacitor/commit/3b43df1)), closes [#2284](https://github.com/ionic-team/capacitor/issues/2284)
* fix(android): implement getDeliveredNotifications and removeDeliveredNotifications (#2266) ([d942523](https://github.com/ionic-team/capacitor/commit/d942523)), closes [#2266](https://github.com/ionic-team/capacitor/issues/2266)
* fix(android): make Browser plugin fire browserFinished (#2332) ([4f5a4fc](https://github.com/ionic-team/capacitor/commit/4f5a4fc)), closes [#2332](https://github.com/ionic-team/capacitor/issues/2332)
* fix(android): make Share properly share file urls (#2338) ([9226d77](https://github.com/ionic-team/capacitor/commit/9226d77)), closes [#2338](https://github.com/ionic-team/capacitor/issues/2338)
* fix(cli): handle edit-config with merge mode on application object (#2322) ([9e56701](https://github.com/ionic-team/capacitor/commit/9e56701)), closes [#2322](https://github.com/ionic-team/capacitor/issues/2322)
* fix(cli): linux not showing error message on open (#2336) ([72d07e0](https://github.com/ionic-team/capacitor/commit/72d07e0)), closes [#2336](https://github.com/ionic-team/capacitor/issues/2336)
* fix(cli): move Android Studio detection to avoid displaying registry errors (#2364) ([60cd80b](https://github.com/ionic-team/capacitor/commit/60cd80b)), closes [#2364](https://github.com/ionic-team/capacitor/issues/2364)
* fix(cli): use proper kebab-case name for npm package (#2276) ([c9f1511](https://github.com/ionic-team/capacitor/commit/c9f1511)), closes [#2276](https://github.com/ionic-team/capacitor/issues/2276)
* fix(cli): use rimraf instead of rm -rf (#2285) ([ec458c8](https://github.com/ionic-team/capacitor/commit/ec458c8)), closes [#2285](https://github.com/ionic-team/capacitor/issues/2285)
* fix(cordova): add new iOS Swift CDVCommandStatus enums (#2328) ([45244d6](https://github.com/ionic-team/capacitor/commit/45244d6)), closes [#2328](https://github.com/ionic-team/capacitor/issues/2328)
* fix(cordova): avoid build failure if plugin uses viewController.webView (#2330) ([69f589b](https://github.com/ionic-team/capacitor/commit/69f589b)), closes [#2330](https://github.com/ionic-team/capacitor/issues/2330)
* fix(cordova): patch CDVCapture bundle path (#2342) ([3f4bd1a](https://github.com/ionic-team/capacitor/commit/3f4bd1a)), closes [#2342](https://github.com/ionic-team/capacitor/issues/2342)
* fix(ios): avoid lock of subsequent plugin calls (#2317) ([02da187](https://github.com/ionic-team/capacitor/commit/02da187)), closes [#2317](https://github.com/ionic-team/capacitor/issues/2317)
* fix(ios): fire appStateChange in incoming calls (#2282) ([7fd0c7c](https://github.com/ionic-team/capacitor/commit/7fd0c7c)), closes [#2282](https://github.com/ionic-team/capacitor/issues/2282)
* fix(ios): incorrect behavior of appendingPathComponent when framework is present (#2309) ([0a25cce](https://github.com/ionic-team/capacitor/commit/0a25cce)), closes [#2309](https://github.com/ionic-team/capacitor/issues/2309)


### Features

* feat(ios/android): allow to position Toast (#2337) ([a1384d5](https://github.com/ionic-team/capacitor/commit/a1384d5)), closes [#2337](https://github.com/ionic-team/capacitor/issues/2337)
* feat(android): add group and groupSummary to LocalNotifications (#2385) ([8e8a157](https://github.com/ionic-team/capacitor/commit/8e8a157)), closes [#2385](https://github.com/ionic-team/capacitor/issues/2385)
* feat(android): add splashFullScreen configuration option (#2302) ([9521e0a](https://github.com/ionic-team/capacitor/commit/9521e0a)), closes [#2302](https://github.com/ionic-team/capacitor/issues/2302)
* feat(android): add support to custom sound on Push Notifications (#2362) ([284d4b2](https://github.com/ionic-team/capacitor/commit/284d4b2)), closes [#2362](https://github.com/ionic-team/capacitor/issues/2362)
* feat(cli): allow to modify cleartext setting from capacitor.config.json (#2397) ([181d564](https://github.com/ionic-team/capacitor/commit/181d564)), closes [#2397](https://github.com/ionic-team/capacitor/issues/2397)
* feat(ios): add configuration option for allowsLinkPreview (#2382) ([47b4d66](https://github.com/ionic-team/capacitor/commit/47b4d66)), closes [#2382](https://github.com/ionic-team/capacitor/issues/2382)
* feat(ios): add threadIdentifier and summaryArgument to LocalNotification (#2396) ([7c5f30b](https://github.com/ionic-team/capacitor/commit/7c5f30b)), closes [#2396](https://github.com/ionic-team/capacitor/issues/2396)
* feat(ios): Allow to configure WebView's ScrollView's content insets (#2392) ([1f7e40d](https://github.com/ionic-team/capacitor/commit/1f7e40d)), closes [#2392](https://github.com/ionic-team/capacitor/issues/2392)


### Docs

* site updates ([64286f8](https://github.com/ionic-team/capacitor/commit/64286f8))
* docs: add allowsLinkPreview configuration information (#2387) ([e603032](https://github.com/ionic-team/capacitor/commit/e603032)), closes [#2387](https://github.com/ionic-team/capacitor/issues/2387)
* docs: Add how to determine installed plugin version in project (#2319) ([580a236](https://github.com/ionic-team/capacitor/commit/580a236)), closes [#2319](https://github.com/ionic-team/capacitor/issues/2319)
* docs: fix broken link to Cordova project description (#2277) ([88ce7db](https://github.com/ionic-team/capacitor/commit/88ce7db)), closes [#2277](https://github.com/ionic-team/capacitor/issues/2277)
* docs(android-guide): fix typo (#2343) ([4475ed5](https://github.com/ionic-team/capacitor/commit/4475ed5)), closes [#2343](https://github.com/ionic-team/capacitor/issues/2343)
* docs(ce-plugins): add @rdlabo/capacitor-codescanner (#2344) ([b2522ca](https://github.com/ionic-team/capacitor/commit/b2522ca)), closes [#2344](https://github.com/ionic-team/capacitor/issues/2344)
* docs(ce-plugins): add Apple Login Plugin (#2267) ([663657d](https://github.com/ionic-team/capacitor/commit/663657d)), closes [#2267](https://github.com/ionic-team/capacitor/issues/2267)
* docs(ce-plugins): Add capacitor UDP plugin (#2314) ([e904eaa](https://github.com/ionic-team/capacitor/commit/e904eaa)), closes [#2314](https://github.com/ionic-team/capacitor/issues/2314)
* docs(ce-plugins): add capacitor-voice-recorder (#2378) ([9836d05](https://github.com/ionic-team/capacitor/commit/9836d05)), closes [#2378](https://github.com/ionic-team/capacitor/issues/2378)
* docs(ce-plugins): Update capacitor-admob plugin note (#2335) ([5aeb4e6](https://github.com/ionic-team/capacitor/commit/5aeb4e6)), closes [#2335](https://github.com/ionic-team/capacitor/issues/2335)
* docs(core): show array type instead of any (#2318) ([2b9fb4d](https://github.com/ionic-team/capacitor/commit/2b9fb4d)), closes [#2318](https://github.com/ionic-team/capacitor/issues/2318)
* docs(keyboard): Add Keyboard config info (#2245) ([3344af2](https://github.com/ionic-team/capacitor/commit/3344af2)), closes [#2245](https://github.com/ionic-team/capacitor/issues/2245) [#2243](https://github.com/ionic-team/capacitor/issues/2243)
* docs(readme): update for 2020 (#2341) ([2e24d8d](https://github.com/ionic-team/capacitor/commit/2e24d8d)), closes [#2341](https://github.com/ionic-team/capacitor/issues/2341)


### Chores

* chore(cli): add interface for new plugin answers and use arrow function for input validation (#2286) ([0d2826e](https://github.com/ionic-team/capacitor/commit/0d2826e)), closes [#2286](https://github.com/ionic-team/capacitor/issues/2286)



## [1.4.0](https://github.com/ionic-team/capacitor/compare/1.3.0...1.4.0) (2019-12-12)


### Bug Fixes

* fix(cordova/ios): patch usage of NSBundle bundleForClass in plugins (#2111) ([a2a1165](https://github.com/ionic-team/capacitor/commit/a2a1165)), closes [#2111](https://github.com/ionic-team/capacitor/issues/2111)
* fix(cordova/ios): post CDVPluginHandleOpenURLNotification (#2198) ([2972661](https://github.com/ionic-team/capacitor/commit/2972661)), closes [#2198](https://github.com/ionic-team/capacitor/issues/2198)
* fix(core/web): make LocalNotifications.requestPermissions() work on Safari (#2205) ([af306ff](https://github.com/ionic-team/capacitor/commit/af306ff)), closes [#2205](https://github.com/ionic-team/capacitor/issues/2205)
* fix(plugin/camera): Fix scaling when setting only height (#2123) ([0bc0039](https://github.com/ionic-team/capacitor/commit/0bc0039)), closes [#2123](https://github.com/ionic-team/capacitor/issues/2123)
* fix(android): avoid crash on SplashScreen.show() (#2213) ([d200727](https://github.com/ionic-team/capacitor/commit/d200727)), closes [#2213](https://github.com/ionic-team/capacitor/issues/2213)
* fix(android): Ensure appStateChange doesn't fire on startup (#2179) ([77a04c5](https://github.com/ionic-team/capacitor/commit/77a04c5)), closes [#2179](https://github.com/ionic-team/capacitor/issues/2179)
* fix(android): proper parsing of plugin integers and doubles (#2234) ([7fc4b5d](https://github.com/ionic-team/capacitor/commit/7fc4b5d)), closes [#2234](https://github.com/ionic-team/capacitor/issues/2234)
* fix(android): properly proxy requests to domains in allowNavigation (#2146) ([4a1c19f](https://github.com/ionic-team/capacitor/commit/4a1c19f)), closes [#2146](https://github.com/ionic-team/capacitor/issues/2146)
* fix(android): Send cookies on proxied requests (#2151) ([fbe0b9d](https://github.com/ionic-team/capacitor/commit/fbe0b9d)), closes [#2151](https://github.com/ionic-team/capacitor/issues/2151)
* fix(core): improve Filesystem parameter descriptions (#2023) ([21914e9](https://github.com/ionic-team/capacitor/commit/21914e9)), closes [#2023](https://github.com/ionic-team/capacitor/issues/2023)
* fix(electron): make apps work on electron 7 (#2084) ([046aad2](https://github.com/ionic-team/capacitor/commit/046aad2)), closes [#2084](https://github.com/ionic-team/capacitor/issues/2084)
* fix(ios): make getFloat work on plugins (#2235) ([99996e2](https://github.com/ionic-team/capacitor/commit/99996e2)), closes [#2235](https://github.com/ionic-team/capacitor/issues/2235)
* fix(ios): mitigate memory usage of media files (#2115) ([4b8fc3e](https://github.com/ionic-team/capacitor/commit/4b8fc3e)), closes [#2115](https://github.com/ionic-team/capacitor/issues/2115)
* fix(ios): set camera configuration in main thread (#2167) ([c57da0e](https://github.com/ionic-team/capacitor/commit/c57da0e)), closes [#2167](https://github.com/ionic-team/capacitor/issues/2167)
* fix(ios): set dark statusbar style if defined in plist (#2098) ([2529015](https://github.com/ionic-team/capacitor/commit/2529015)), closes [#2098](https://github.com/ionic-team/capacitor/issues/2098)


### Features

* feat(cli/cordova): add support for source-file compiler-flags attribute (#2237) ([8549141](https://github.com/ionic-team/capacitor/commit/8549141)), closes [#2237](https://github.com/ionic-team/capacitor/issues/2237)
* feat: make possible to configure userAgent (#2140) ([8952ed1](https://github.com/ionic-team/capacitor/commit/8952ed1)), closes [#2140](https://github.com/ionic-team/capacitor/issues/2140)
* feat(cli): Add --deployment option for update and sync commands (#2222) ([a4b12ee](https://github.com/ionic-team/capacitor/commit/a4b12ee)), closes [#2222](https://github.com/ionic-team/capacitor/issues/2222)
* feat(device): Add operatingSystem field (#2086) ([dcdf675](https://github.com/ionic-team/capacitor/commit/dcdf675)), closes [#2086](https://github.com/ionic-team/capacitor/issues/2086)
* feat(ios): make didRegisterForRemoteNotificationsWithDeviceToken handle Data and String push tokens  ([94879b3](https://github.com/ionic-team/capacitor/commit/94879b3)), closes [#2078](https://github.com/ionic-team/capacitor/issues/2078)
* feat(LocalNotifications): Add support for count to work with every on LocalNotificationSchedule (#21 ([473a50e](https://github.com/ionic-team/capacitor/commit/473a50e)), closes [#2124](https://github.com/ionic-team/capacitor/issues/2124)


### Docs

* docs: Added JS example to iOS custom-code section (#2015) ([c1a7e20](https://github.com/ionic-team/capacitor/commit/c1a7e20)), closes [#2015](https://github.com/ionic-team/capacitor/issues/2015)
* docs: reword the Periodic Maintenance section (#2071) ([7009d37](https://github.com/ionic-team/capacitor/commit/7009d37)), closes [#2071](https://github.com/ionic-team/capacitor/issues/2071)
* docs: Update Storage code example to be accurate (#2112) ([2ecea21](https://github.com/ionic-team/capacitor/commit/2ecea21)), closes [#2112](https://github.com/ionic-team/capacitor/issues/2112)
* docs(ce-plugins): add cap-sensing-kit (#2206) ([e5c54e0](https://github.com/ionic-team/capacitor/commit/e5c54e0)), closes [#2206](https://github.com/ionic-team/capacitor/issues/2206)
* docs(ce-plugins): add capacitor-google-fit (#2228) ([fd28a2c](https://github.com/ionic-team/capacitor/commit/fd28a2c)), closes [#2228](https://github.com/ionic-team/capacitor/issues/2228)
* docs(ce-plugins): add capacitor-navigationbar to community plugins (#2116) ([b941e88](https://github.com/ionic-team/capacitor/commit/b941e88)), closes [#2116](https://github.com/ionic-team/capacitor/issues/2116)
* docs(ce-plugins): Add capacitor-stripe-terminal (#2102) ([0961345](https://github.com/ionic-team/capacitor/commit/0961345)), closes [#2102](https://github.com/ionic-team/capacitor/issues/2102)
* docs(ce-plugins): add keep screen on plugin (#2180) ([80b4cde](https://github.com/ionic-team/capacitor/commit/80b4cde)), closes [#2180](https://github.com/ionic-team/capacitor/issues/2180)
* docs(Filesystem): use await in writeFile example (#2087) ([e374f2e](https://github.com/ionic-team/capacitor/commit/e374f2e)), closes [#2087](https://github.com/ionic-team/capacitor/issues/2087)
* docs(ios-plugin-guide): Change getBoolean to getBool (#2221) ([bae2a8d](https://github.com/ionic-team/capacitor/commit/bae2a8d)), closes [#2221](https://github.com/ionic-team/capacitor/issues/2221)
* docs(updating): add 1.4.0 recommended changes (#2238) ([849eb8f](https://github.com/ionic-team/capacitor/commit/849eb8f)), closes [#2238](https://github.com/ionic-team/capacitor/issues/2238)


### Chores

* chore(android): Add JSArray constructor to handle Collection types (#2233) ([0cc877f](https://github.com/ionic-team/capacitor/commit/0cc877f)), closes [#2233](https://github.com/ionic-team/capacitor/issues/2233)
* chore(cli): fix lint problems in code (#2170) ([2ee8dbd](https://github.com/ionic-team/capacitor/commit/2ee8dbd)), closes [#2170](https://github.com/ionic-team/capacitor/issues/2170)
* chore(core): Add lint script and fix lint issues (#2168) ([f08e4a4](https://github.com/ionic-team/capacitor/commit/f08e4a4)), closes [#2168](https://github.com/ionic-team/capacitor/issues/2168)
* chore(deps): bump mixin-deep from 1.3.1 to 1.3.2 in /cli (#2144) ([5e9ce8c](https://github.com/ionic-team/capacitor/commit/5e9ce8c)), closes [#2144](https://github.com/ionic-team/capacitor/issues/2144)
* chore(deps): bump mixin-deep from 1.3.1 to 1.3.2 in /core (#2142) ([34fe999](https://github.com/ionic-team/capacitor/commit/34fe999)), closes [#2142](https://github.com/ionic-team/capacitor/issues/2142)
* chore(deps): bump mixin-deep from 1.3.1 to 1.3.2 in /example (#2143) ([ef5c137](https://github.com/ionic-team/capacitor/commit/ef5c137)), closes [#2143](https://github.com/ionic-team/capacitor/issues/2143)
* chore(deps): bump mixin-deep from 1.3.1 to 1.3.2 in /site (#2145) ([05f3d37](https://github.com/ionic-team/capacitor/commit/05f3d37)), closes [#2145](https://github.com/ionic-team/capacitor/issues/2145)
* chore(deps): remove unused lerna-changelog (#2159) ([fab99de](https://github.com/ionic-team/capacitor/commit/fab99de)), closes [#2159](https://github.com/ionic-team/capacitor/issues/2159)
* chore(example): remove unused dependencies (#2164) ([52f2bc6](https://github.com/ionic-team/capacitor/commit/52f2bc6)), closes [#2164](https://github.com/ionic-team/capacitor/issues/2164)



## [1.3.0](https://github.com/ionic-team/capacitor/compare/1.2.1...1.3.0) (2019-10-24)


### Bug Fixes

* fix(ios/Camera): implement saveToGallery (#2081) ([871651b](https://github.com/ionic-team/capacitor/commit/871651b)), closes [#2081](https://github.com/ionic-team/capacitor/issues/2081)
* fix(ios/Modals): Don't success until dismissed (#2080) ([64aa6c7](https://github.com/ionic-team/capacitor/commit/64aa6c7)), closes [#2080](https://github.com/ionic-team/capacitor/issues/2080)
* fix(android template): drop orphaned file provider authority variable (#1975) ([ed6647b](https://github.com/ionic-team/capacitor/commit/ed6647b)), closes [#1975](https://github.com/ionic-team/capacitor/issues/1975)
* fix(android): allow fetch to local files on livereload (#2067) ([ccc00b3](https://github.com/ionic-team/capacitor/commit/ccc00b3)), closes [#2067](https://github.com/ionic-team/capacitor/issues/2067)
* fix(android): don't patch console object (#1991) ([8964a4a](https://github.com/ionic-team/capacitor/commit/8964a4a)), closes [#1991](https://github.com/ionic-team/capacitor/issues/1991)
* fix(android): handle input file when accept have file extensions (#1990) ([9fc348a](https://github.com/ionic-team/capacitor/commit/9fc348a)), closes [#1990](https://github.com/ionic-team/capacitor/issues/1990)
* fix(android): handle input file with multiple accept mimetypes (#1988) ([52f083d](https://github.com/ionic-team/capacitor/commit/52f083d)), closes [#1988](https://github.com/ionic-team/capacitor/issues/1988)
* fix(android): return empty string if appVersion or appBuild fail (#2002) ([5bb526a](https://github.com/ionic-team/capacitor/commit/5bb526a)), closes [#2002](https://github.com/ionic-team/capacitor/issues/2002)
* fix(android): return proper mimeType for .mjs files (#2017) ([b7fc6c8](https://github.com/ionic-team/capacitor/commit/b7fc6c8)), closes [#2017](https://github.com/ionic-team/capacitor/issues/2017)
* fix(android): when saving picture to gallery make sure the folder exist (#2016) ([aa5ecbb](https://github.com/ionic-team/capacitor/commit/aa5ecbb)), closes [#2016](https://github.com/ionic-team/capacitor/issues/2016)
* fix(Browser): avoid crash when using invalid urls (#2056) ([2e4d8b1](https://github.com/ionic-team/capacitor/commit/2e4d8b1)), closes [#2056](https://github.com/ionic-team/capacitor/issues/2056)
* fix(cli): skip incompatible enterprise plugins (#2018) ([5446fc3](https://github.com/ionic-team/capacitor/commit/5446fc3)), closes [#2018](https://github.com/ionic-team/capacitor/issues/2018)
* fix(core): remove data url header on writeFile if no encoding is passed (#1909) ([6a4de97](https://github.com/ionic-team/capacitor/commit/6a4de97)), closes [#1909](https://github.com/ionic-team/capacitor/issues/1909)
* fix(core): return proper Error objects from native (#1950) ([2fa29e3](https://github.com/ionic-team/capacitor/commit/2fa29e3)), closes [#1950](https://github.com/ionic-team/capacitor/issues/1950)
* fix(core): update FileWriteOptions and FileAppendOptions encoding description (#2003) ([e7bd634](https://github.com/ionic-team/capacitor/commit/e7bd634)), closes [#2003](https://github.com/ionic-team/capacitor/issues/2003)
* fix(electron): Check whether the splash screen is already destroyed on close (#2044) ([455c6e9](https://github.com/ionic-team/capacitor/commit/455c6e9)), closes [#2044](https://github.com/ionic-team/capacitor/issues/2044)
* fix(electron): use proper quotes on splashHtml style font (#2083) ([7bb4404](https://github.com/ionic-team/capacitor/commit/7bb4404)), closes [#2083](https://github.com/ionic-team/capacitor/issues/2083)
* fix(ios): event listener is not retained if was removed and added again (#2095) ([fb97d06](https://github.com/ionic-team/capacitor/commit/fb97d06)), closes [#2095](https://github.com/ionic-team/capacitor/issues/2095)
* fix(ios): make programmatically focus work on iOS 13 (#1995) ([069b248](https://github.com/ionic-team/capacitor/commit/069b248)), closes [#1995](https://github.com/ionic-team/capacitor/issues/1995)
* fix(ios): make StatusBar Light style work on Dark mode (#1996) ([ab1ffd5](https://github.com/ionic-team/capacitor/commit/ab1ffd5)), closes [#1996](https://github.com/ionic-team/capacitor/issues/1996)


### Features

* feat(cordova): move Cordova prefs from config.xml to capacitor.config.json (#1977) ([2655f0f](https://github.com/ionic-team/capacitor/commit/2655f0f)), closes [#1977](https://github.com/ionic-team/capacitor/issues/1977)
* feat(core): add appBuild to device getInfo (#1994) ([c2d7d9a](https://github.com/ionic-team/capacitor/commit/c2d7d9a)), closes [#1994](https://github.com/ionic-team/capacitor/issues/1994)
* feat(Filesystem): Deprecate createIntermediateDirectories in mkdir (#2004) ([d67d460](https://github.com/ionic-team/capacitor/commit/d67d460)), closes [#2004](https://github.com/ionic-team/capacitor/issues/2004)


### Docs

* docs(android/types): Add note about backbutton listener behaviour (#2026) ([14cc338](https://github.com/ionic-team/capacitor/commit/14cc338)), closes [#2026](https://github.com/ionic-team/capacitor/issues/2026)
* docs: Add information about Cordova plugin preferences (#1999) ([fbd1b47](https://github.com/ionic-team/capacitor/commit/fbd1b47)), closes [#1999](https://github.com/ionic-team/capacitor/issues/1999)
* docs: add note on plugins that require PWA Elements (#1998) ([0408df7](https://github.com/ionic-team/capacitor/commit/0408df7)), closes [#1998](https://github.com/ionic-team/capacitor/issues/1998)
* docs: add reasoning for cordova plugin incompatibility (#2000) ([29087ec](https://github.com/ionic-team/capacitor/commit/29087ec)), closes [#2000](https://github.com/ionic-team/capacitor/issues/2000)
* docs: document cordova-plugin-googlemaps as incompatible for iOS (#2072) ([470147a](https://github.com/ionic-team/capacitor/commit/470147a)), closes [#2072](https://github.com/ionic-team/capacitor/issues/2072)
* docs: improve Android custom code section (#1857) ([557dfb1](https://github.com/ionic-team/capacitor/commit/557dfb1)), closes [#1857](https://github.com/ionic-team/capacitor/issues/1857)
* docs(android): improve plugin development guide (#2066) ([219c885](https://github.com/ionic-team/capacitor/commit/219c885)), closes [#2066](https://github.com/ionic-team/capacitor/issues/2066)
* docs(ce-guides): Add tutorial for capacitor music playback (#1993) ([6791b04](https://github.com/ionic-team/capacitor/commit/6791b04)), closes [#1993](https://github.com/ionic-team/capacitor/issues/1993)
* docs(ce-guides): Add tutorial for Facebook login (#2029) ([9b77835](https://github.com/ionic-team/capacitor/commit/9b77835)), closes [#2029](https://github.com/ionic-team/capacitor/issues/2029)
* docs(ce-guides): add tutorials for Google and Twitter Login (#2061) ([97d738d](https://github.com/ionic-team/capacitor/commit/97d738d)), closes [#2061](https://github.com/ionic-team/capacitor/issues/2061)
* docs(ce-plugins): add capacitor-biometric-auth (#2049) ([e10661d](https://github.com/ionic-team/capacitor/commit/e10661d)), closes [#2049](https://github.com/ionic-team/capacitor/issues/2049)
* docs(ce-plugins): add capacitor-branch-deep-links plugin (#2041) ([f2a5240](https://github.com/ionic-team/capacitor/commit/f2a5240)), closes [#2041](https://github.com/ionic-team/capacitor/issues/2041)
* docs(ce-plugins): add capacitor-camera-preview (#2009) ([6e0d8ba](https://github.com/ionic-team/capacitor/commit/6e0d8ba)), closes [#2009](https://github.com/ionic-team/capacitor/issues/2009)
* docs(ce-plugins): add face id plugin (#1964) ([7b4c097](https://github.com/ionic-team/capacitor/commit/7b4c097)), closes [#1964](https://github.com/ionic-team/capacitor/issues/1964)
* docs(ce-plugins): add Install Referrer plugin (#1935) ([40f4aac](https://github.com/ionic-team/capacitor/commit/40f4aac)), closes [#1935](https://github.com/ionic-team/capacitor/issues/1935)
* docs(ce-plugins): capacitor-rate-app plugin (#1970) ([e1ab364](https://github.com/ionic-team/capacitor/commit/e1ab364)), closes [#1970](https://github.com/ionic-team/capacitor/issues/1970)
* docs(ios): Fix minor typo in index.md (#2070) ([83ac295](https://github.com/ionic-team/capacitor/commit/83ac295)), closes [#2070](https://github.com/ionic-team/capacitor/issues/2070)
* docs(splash screen): fix typo for options (#1976) ([a932267](https://github.com/ionic-team/capacitor/commit/a932267)), closes [#1976](https://github.com/ionic-team/capacitor/issues/1976)
* docs(Storage): explain what the plugin uses under the hood (#2058) ([64cc133](https://github.com/ionic-team/capacitor/commit/64cc133)), closes [#2058](https://github.com/ionic-team/capacitor/issues/2058)
* docs(community): fix layout (#2057) ([667c331](https://github.com/ionic-team/capacitor/commit/667c331)), closes [#2057](https://github.com/ionic-team/capacitor/issues/2057)


### Chores

* chore: make @capacitor/core peerDependency of ios/android ([844c0fe](https://github.com/ionic-team/capacitor/commit/844c0fe))
* chore(github): Update issue submission templates (#2012) ([df6bd87](https://github.com/ionic-team/capacitor/commit/df6bd87)), closes [#2012](https://github.com/ionic-team/capacitor/issues/2012)



## [1.2.1](https://github.com/ionic-team/capacitor/compare/1.2.0...1.2.1) (2019-09-17)


### Bug Fixes

* fix(cli): mimic cordova's js-module logic when no name attribute ([#1959](https://github.com/ionic-team/capacitor/pull/1959))
* fix(ios): call webview.load on main thread on setServerBasePath ([#1967](https://github.com/ionic-team/capacitor/pull/1967))
* fix(ios): reset server path on app updates ([#1968](https://github.com/ionic-team/capacitor/pull/1968))
* fix(android): reset server path on app updates ([#1969](https://github.com/ionic-team/capacitor/pull/1969))



## [1.2.0](https://github.com/ionic-team/capacitor/compare/1.1.1...1.2.0) (2019-09-04)


### Bug Fixes

* fix(core/web): avoid appendFile/writeFile to overwrite existing directory entry ([#1782](https://github.com/ionic-team/capacitor/pull/1782))
* fix(cli): properly handle edit-config tag target ([#1794](https://github.com/ionic-team/capacitor/pull/1794))
* fix(android): remove new line characters from camera base64 results ([#1800](https://github.com/ionic-team/capacitor/pull/1800))
* fix(android): add missing format field in CameraPhoto ([#1798](https://github.com/ionic-team/capacitor/pull/1798))
* fix(ios): don't override notification delegate if already set ([#1805](https://github.com/ionic-team/capacitor/pull/1805))
* fix(core/global): ensure window is not used in ssr environment ([#1804](https://github.com/ionic-team/capacitor/pull/1804))
* fix(electron): createIntermediateDirectories option not being used in mkdir ([#1812](https://github.com/ionic-team/capacitor/pull/1812))
* fix(core/Filesystem): allow readdir on root directories ([#1818](https://github.com/ionic-team/capacitor/pull/1818))
* fix(ios/Filesystem): make readdir return only content names ([#1819](https://github.com/ionic-team/capacitor/pull/1819))
* fix(ios): improve CAPLog variadic logging ([#1824](https://github.com/ionic-team/capacitor/pull/1824))
* fix(cordova): return proper pathForResource in CDVCommandDelegate ([#1826](https://github.com/ionic-team/capacitor/pull/1826))
* fix(cli): remove deprecated dependencies ([#1827](https://github.com/ionic-team/capacitor/pull/1827))
* fix(android): not override console so it shows proper line ([#1832](https://github.com/ionic-team/capacitor/pull/1832))
* fix(android): make freeSavedCall also be released from the bridge ([#1862](https://github.com/ionic-team/capacitor/pull/1862))
* fix: return proper mimeType for wasm files ([#1877](https://github.com/ionic-team/capacitor/pull/1877))
* fix(ios): only listen for keyboard events when the app is active ([#1882](https://github.com/ionic-team/capacitor/pull/1882))
* fix(android/splash): don't hardcode spinner size ([#1891](https://github.com/ionic-team/capacitor/pull/1891))
* fix(android/splash): Avoid glitches on slow devices and respect keep fullscreen flag ([#1890](https://github.com/ionic-team/capacitor/pull/1890))
* fix(cli): typo on error message ([#1899](https://github.com/ionic-team/capacitor/pull/1899))
* fix(cli): make plugin generator run pod install on plugin creation ([#1903](https://github.com/ionic-team/capacitor/pull/1903))
* fix(android): make openUrl open apps that don't handle VIEW intents ([#1906](https://github.com/ionic-team/capacitor/pull/1906))
* fix(electron): correctly read/write file with no encoding ([#1905](https://github.com/ionic-team/capacitor/pull/1905))
* fix(ios/cordova): Replace UIWebView with WKWebView in CDVUserAgentUtil ([#1925](https://github.com/ionic-team/capacitor/pull/1925))
* fix(app-template): use correct node_modules value in .gitignore ([#1916](https://github.com/ionic-team/capacitor/pull/1916))


### Features

* feat(android): support custom local notification icon ([#1830](https://github.com/ionic-team/capacitor/pull/1830))
* feat(Filesystem): Add copy implementation ([#1758](https://github.com/ionic-team/capacitor/pull/1758))
* feat(Filesystem): Add recursive option for rmdir ([#1781](https://github.com/ionic-team/capacitor/pull/1781))
* feat: Permissions API ([#1828](https://github.com/ionic-team/capacitor/pull/1828))
* feat(ios+android): Add possibility to configure loading scheme ([#1810](https://github.com/ionic-team/capacitor/pull/1810))
* feat(ios): add method to programmatically set keyboard style ([#1895](https://github.com/ionic-team/capacitor/pull/1895))
* feat(ios): allow to programmatically set the keyboard resize mode ([#1896](https://github.com/ionic-team/capacitor/pull/1896))
* feat(ios): add method to programmatically enable/disable the WebView scroll ([#1900](https://github.com/ionic-team/capacitor/pull/1900))


### Docs

* feat(docs): Add more docs for configuring Android App Links ([76f6624](https://github.com/ionic-team/capacitor/commit/76f6624))
* docs(community plugins): Add Secure storage plugin reference ([#1791](https://github.com/ionic-team/capacitor/pull/1791))
* docs: fix minor typo in FCM guide ([#1802](https://github.com/ionic-team/capacitor/pull/1802))
* Clarify API usage ([#1811](https://github.com/ionic-team/capacitor/pull/1811))
* docs: document saveCall on Android plugin guide ([#1823](https://github.com/ionic-team/capacitor/pull/1823))
* docs(community plugins): add @rdlabo/capacitor-admob ([#1739](https://github.com/ionic-team/capacitor/pull/1739))
* docs(community plugins): Add capacitor-radar plugin ([#1884](https://github.com/ionic-team/capacitor/pull/1884))
* Update index.md ([#1861](https://github.com/ionic-team/capacitor/pull/1861))


### Chores

* chore(example): update example app to work with latest Capacitor ([#1789](https://github.com/ionic-team/capacitor/pull/1789))
* chore(cordova): remove deprecated AssetsLibrary ([#1825](https://github.com/ionic-team/capacitor/pull/1825))
* chore(electron): remove package-lock.json ([#1926](https://github.com/ionic-team/capacitor/pull/1926))



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