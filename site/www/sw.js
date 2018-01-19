importScripts('workbox-sw.prod.v2.1.2.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "assets/icon/favicon.ico",
    "revision": "a61817507821162ce48c41fcaaa487d8"
  },
  {
    "url": "assets/img/avo-social.png",
    "revision": "dcf339c46862b1869ff8ea02ffcb0256"
  },
  {
    "url": "assets/img/avocado-dark-logo.png",
    "revision": "0a0397bd43559a9b506d62d3948a07df"
  },
  {
    "url": "assets/img/avocado-logo.png",
    "revision": "67acff248d20f7b63dd1e6ff569eb373"
  },
  {
    "url": "assets/img/avocado/project-structure.png",
    "revision": "f27c862862e8f36772a6700dd06c697c"
  },
  {
    "url": "assets/img/checkbox.png",
    "revision": "ae3b4b201fb303732670371d573dd3e8"
  },
  {
    "url": "assets/img/docs/project-structure.png",
    "revision": "f27c862862e8f36772a6700dd06c697c"
  },
  {
    "url": "assets/img/favicon (1).ico",
    "revision": "79825038f1642fd3849aed4a6deb1c9d"
  },
  {
    "url": "assets/img/favicon.ico",
    "revision": "79825038f1642fd3849aed4a6deb1c9d"
  },
  {
    "url": "assets/img/favicon.png",
    "revision": "79825038f1642fd3849aed4a6deb1c9d"
  },
  {
    "url": "assets/img/feature-icons.png",
    "revision": "71a2d41278528e9657bb2946f68bc8c4"
  },
  {
    "url": "assets/img/icon.png",
    "revision": "b96ad6e1e0b755c8cd45e6aec40bca25"
  },
  {
    "url": "assets/img/ionic-os-dark-logo.png",
    "revision": "a6c971b8f10881a96050c511c35984e3"
  },
  {
    "url": "assets/img/ionic-os-logo.png",
    "revision": "d1d25937ddf7e6e453f5a623d0b25b89"
  },
  {
    "url": "assets/img/logo-dark.png",
    "revision": "a52acd621b2471bd4f5567ddb4570c32"
  },
  {
    "url": "assets/img/logo.png",
    "revision": "0ab79243b610b5eb6f909727799fe1df"
  },
  {
    "url": "assets/img/pwa.png",
    "revision": "f740988d2e33bdfd48c816fa17ba9f00"
  },
  {
    "url": "assets/img/right-img.png",
    "revision": "5841d9860a1facd71f0e01fe283142f0"
  },
  {
    "url": "assets/img/text-logo.png",
    "revision": "45a94a6c3509dac4b3b16415f2679896"
  },
  {
    "url": "assets/img/text-logo.svg",
    "revision": "4f658c2a420d5dd7f30d09c2c87781cf"
  },
  {
    "url": "assets/img/video-icon.png",
    "revision": "6f27af15cab04aafd7193b76825c2eac"
  },
  {
    "url": "build/app.js",
    "revision": "99c3aeaa0249c264f188b489dfdd3507"
  },
  {
    "url": "build/app/3mk3rmrr.js",
    "revision": "ae36f081da4e32bbe2d3fb23fb0e11ea"
  },
  {
    "url": "build/app/4aobwvoq.js",
    "revision": "ae87c55b6892652e607e2e3f282187d0"
  },
  {
    "url": "build/app/9vp1kpca.js",
    "revision": "ec63c784fbc2f0b40f0bcdb8ce78ee07"
  },
  {
    "url": "build/app/app.global.js",
    "revision": "3a5c841401a41c898207dc7d241ac038"
  },
  {
    "url": "build/app/app.gzgsz0co.js",
    "revision": "177700d815356e1394adb2ecc5151597"
  },
  {
    "url": "build/app/app.m3eyznes.js",
    "revision": "f80437a8f51181860b330e2f59bbd7ad"
  },
  {
    "url": "build/app/app.qnefnhxv.js",
    "revision": "0a42ace057e984409fc0b0c5cf03e10e"
  },
  {
    "url": "build/app/app.registry.json",
    "revision": "9d3303603ea2cf9f3b52b99946d3a3cc"
  },
  {
    "url": "build/app/cv7cbtbi.js",
    "revision": "b425d7fba0b1c25730cf13a34af6b556"
  },
  {
    "url": "build/app/defza7vd.js",
    "revision": "ab9c98a8cbc1aca477808e063455d952"
  },
  {
    "url": "build/app/ibgx2z2t.js",
    "revision": "e22fc160169f3949d0cb8dcde34b45fd"
  },
  {
    "url": "build/app/krirex7d.js",
    "revision": "2379293fa04a47b457246d63856c5362"
  },
  {
    "url": "build/app/lfeghk8g.js",
    "revision": "eb1f8d600a6c6c0c40e837d490e58a59"
  },
  {
    "url": "build/app/lljbbqab.js",
    "revision": "4cb1be69cd6f9e9015e3d5d93d0159e5"
  },
  {
    "url": "build/app/n56a2jzp.js",
    "revision": "e954543252f3704d0f97c59bfeda6c9c"
  },
  {
    "url": "build/app/nvgxmkhh.js",
    "revision": "549d52c8595fc8cd8cc1dcadb5edd3c2"
  },
  {
    "url": "build/app/orsdhirh.js",
    "revision": "7438a81d2db06c201be7ba516d9071ca"
  },
  {
    "url": "build/app/pbssls7g.js",
    "revision": "bceea4fa858c798bb6fa201033865b51"
  },
  {
    "url": "build/app/rhlmfaus.js",
    "revision": "6be3c0d5f97086f8fab64b1bf2a654a5"
  },
  {
    "url": "build/app/sqi87dqk.js",
    "revision": "2c546dbf30d539745ad397d4f54fd5c0"
  },
  {
    "url": "build/app/waljrbe1.js",
    "revision": "68e972c9289dffeceb9a02d63e2da8c6"
  },
  {
    "url": "build/app/wnmbbgpp.js",
    "revision": "382d6822942bd45881e9b3874b5ed057"
  },
  {
    "url": "build/app/xyfissap.js",
    "revision": "25d03519f99399851b14fdc57d211da6"
  },
  {
    "url": "docs-content/android/configuration.html",
    "revision": "e2c8ddd3ca278c0ffc38697e75bb4462"
  },
  {
    "url": "docs-content/android/index.html",
    "revision": "d6bba3435fe3f09eb1d971b14d1f76e1"
  },
  {
    "url": "docs-content/android/lifecycle.html",
    "revision": "f46c3f0b3d79a61156591c6df5361fa5"
  },
  {
    "url": "docs-content/android/managing-dependencies.html",
    "revision": "bd95e9c918adc906b5d338e1b3362518"
  },
  {
    "url": "docs-content/android/plugins.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/apis/accessibility/index.html",
    "revision": "03404f657fa97e28f9d35cc5003a5b30"
  },
  {
    "url": "docs-content/apis/action-sheet/index.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/apis/app-state/index.html",
    "revision": "b15acb1e6d1ee4a0773404ddef84c006"
  },
  {
    "url": "docs-content/apis/browser/index.html",
    "revision": "a6f1739ade4f5eeeb39031d6b4bd9a5b"
  },
  {
    "url": "docs-content/apis/camera/index.html",
    "revision": "cf411d7a4664f6bf17ce703681bcac05"
  },
  {
    "url": "docs-content/apis/clipboard/index.html",
    "revision": "f7fbf63ccb1d0237767e4666f71a22b0"
  },
  {
    "url": "docs-content/apis/console/index.html",
    "revision": "8a3f3e9744935bf0330f458e3ec82922"
  },
  {
    "url": "docs-content/apis/device/index.html",
    "revision": "50cf608c273c02967f46d7e40f7fd877"
  },
  {
    "url": "docs-content/apis/filesystem/index.html",
    "revision": "92ba04ea915c3bb271aaa228364755e6"
  },
  {
    "url": "docs-content/apis/geolocation/index.html",
    "revision": "5ecc744029872037d775bf52e58715ba"
  },
  {
    "url": "docs-content/apis/haptics/index.html",
    "revision": "b130307831d8bb93080d48cc8987d905"
  },
  {
    "url": "docs-content/apis/keyboard/index.html",
    "revision": "c552be552a02e2b27acb97aa46e658c7"
  },
  {
    "url": "docs-content/apis/local-notifications/index.html",
    "revision": "a2daa6f2c0802d045cb0c407b53b34c4"
  },
  {
    "url": "docs-content/apis/modals/index.html",
    "revision": "51fe492510fec2bbe52c35220f9f4287"
  },
  {
    "url": "docs-content/apis/motion/index.html",
    "revision": "0e52bbf40f136a2515bbb983b3f04be2"
  },
  {
    "url": "docs-content/apis/network/index.html",
    "revision": "1291d958cffd84a12750f6eae7285767"
  },
  {
    "url": "docs-content/apis/photos/index.html",
    "revision": "60de1747dfc4b9462e3b926c9c3ef3e8"
  },
  {
    "url": "docs-content/apis/push-notifications/index.html",
    "revision": "0f41912dda851ede7c794ab856aa954e"
  },
  {
    "url": "docs-content/apis/share/index.html",
    "revision": "9dbf15fb5daddabef501c83aed2a68e4"
  },
  {
    "url": "docs-content/apis/splash-screen/index.html",
    "revision": "4cb2716767134c10b9cc1a8dbbb4a0ab"
  },
  {
    "url": "docs-content/apis/status-bar/index.html",
    "revision": "598cfd7c9a8ca44cdafa7b7ca48c205e"
  },
  {
    "url": "docs-content/apis/storage/index.html",
    "revision": "49487527b73987458ca2a59815f3e68c"
  },
  {
    "url": "docs-content/apis/toast/index.html",
    "revision": "4903999408c11031c9ac44d47e52b95c"
  },
  {
    "url": "docs-content/basics/app-project-structure.html",
    "revision": "e45d913f2568d9d7567107f56b195f77"
  },
  {
    "url": "docs-content/basics/building-your-app.html",
    "revision": "25a03d48830c48daf38719841e41e14c"
  },
  {
    "url": "docs-content/basics/configuring-your-app.html",
    "revision": "140de1ac0e0e4268ef803cb4333d1547"
  },
  {
    "url": "docs-content/basics/creating-apps.html",
    "revision": "c0ff30be196e4b040d076fcf93c2d899"
  },
  {
    "url": "docs-content/basics/managing-platforms.html",
    "revision": "2d32a3349d035db2bda5ffdd14f165da"
  },
  {
    "url": "docs-content/basics/running-your-app.html",
    "revision": "15cd91bef2fbddb9cf1714446e0ce4c5"
  },
  {
    "url": "docs-content/getting-started/index.html",
    "revision": "fb9bb7c1d938973b6026a7393ac4aaf6"
  },
  {
    "url": "docs-content/getting-started/migrating-from-phonegap-cordova.html",
    "revision": "e10d097adf02e9a8cc22a95735c757de"
  },
  {
    "url": "docs-content/index.html",
    "revision": "e82ba712ccfa509d27553e6652c15685"
  },
  {
    "url": "docs-content/ios/configuration.html",
    "revision": "da0bb7131a24082845c72e3fbdb98d08"
  },
  {
    "url": "docs-content/ios/index.html",
    "revision": "8a0a158c7e7d68c9b3baf6f69247270b"
  },
  {
    "url": "docs-content/ios/managing-dependencies.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/ios/plugins.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/plugins/creating-plugins.html",
    "revision": "59708d86331d45eaf22055113f1b779e"
  },
  {
    "url": "docs-content/plugins/index.html",
    "revision": "2b8b84d45c12c7713dd6dcbd26d45dc8"
  },
  {
    "url": "docs-content/plugins/plugin-api-javascript.html",
    "revision": "1942b612aa992b8830c5bcab51f2c20b"
  },
  {
    "url": "docs/intro/index.html",
    "revision": "2db3e8d0408dba94808e9b87bce7cbdc"
  },
  {
    "url": "host.config.json",
    "revision": "e538444b8bfbee8d92273260c0824bfe"
  },
  {
    "url": "index.html",
    "revision": "d6a8841d6dd9f181bce447c91ce5f7bf"
  },
  {
    "url": "manifest.json",
    "revision": "933334db099a12ff06af4b62e3c30872"
  }
];

const workboxSW = new self.WorkboxSW({
  "skipWaiting": true,
  "clientsClaim": true
});
workboxSW.precache(fileManifest);
