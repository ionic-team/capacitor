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
    "revision": "63b1795b56676f1f83f9feaf85c3bee2"
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
    "revision": "fffbd636d128d988161e7a9d614ad35e"
  },
  {
    "url": "build/app/bc7eonai.js",
    "revision": "da1852c1a30e1525c0cc28ba2a466d3e"
  },
  {
    "url": "build/app/cv7cbtbi.js",
    "revision": "b425d7fba0b1c25730cf13a34af6b556"
  },
  {
    "url": "build/app/gamrdk46.js",
    "revision": "c81739a310170c9868e700e8229debbc"
  },
  {
    "url": "build/app/iaarjqkc.js",
    "revision": "985cf36ae24610165dff835d52dc156c"
  },
  {
    "url": "build/app/krirex7d.js",
    "revision": "2379293fa04a47b457246d63856c5362"
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
    "url": "build/app/yixawzuu.js",
    "revision": "4ca9b9c2a08ba98a55cb5d34d5c01247"
  },
  {
    "url": "docs-content/addons/stencil-router.html",
    "revision": "c2790bae4e03529c153d19daa0486f39"
  },
  {
    "url": "docs-content/advanced/angular-integration/index.html",
    "revision": "7bd66f3ef35755f6729e061794a99e5e"
  },
  {
    "url": "docs-content/advanced/distribution/index.html",
    "revision": "80003ea184cb027dc421b157ba495dc3"
  },
  {
    "url": "docs-content/advanced/pre-rendering/index.html",
    "revision": "f0f447abe7f473d7eee5b948c7a383e8"
  },
  {
    "url": "docs-content/advanced/service-worker/index.html",
    "revision": "d46601d6e44303a9e5f316427f693595"
  },
  {
    "url": "docs-content/advanced/shadow-dom/index.html",
    "revision": "f6b45047ffd1103af8a6c3c50393843c"
  },
  {
    "url": "docs-content/advanced/ssr/index.html",
    "revision": "c5696040315280af27a3f40a09541dba"
  },
  {
    "url": "docs-content/android/configuration.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/android/managing-dependencies.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/apis/accessibility/api-index.html",
    "revision": "8a1452ff00133ab6f0628d315a04daeb"
  },
  {
    "url": "docs-content/apis/accessibility/api.html",
    "revision": "72ef3e7ee3dec38ab075f1db2d52d4f2"
  },
  {
    "url": "docs-content/apis/accessibility/index.html",
    "revision": "04a1f73ccead27ed3ada6b5a66422afa"
  },
  {
    "url": "docs-content/apis/action-sheet/api.html",
    "revision": "3ffe2ffa8453869d498ac2e6471a7e82"
  },
  {
    "url": "docs-content/apis/action-sheet/index.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/apis/app-state/api-index.html",
    "revision": "e2207ab59aa67612832360a65089826a"
  },
  {
    "url": "docs-content/apis/app-state/api.html",
    "revision": "446e4558627e59839f189245fbbfe2ed"
  },
  {
    "url": "docs-content/apis/app-state/index.html",
    "revision": "e212f8f534e9c3dc74f1cc3c355ff2f5"
  },
  {
    "url": "docs-content/apis/browser/api-index.html",
    "revision": "1f25cccc29c0abb5e334aaa8d262c9d4"
  },
  {
    "url": "docs-content/apis/browser/api.html",
    "revision": "7113b26122766a54d6af4832fe726d60"
  },
  {
    "url": "docs-content/apis/browser/index.html",
    "revision": "0ec4d09d7fbf7903d2d6506ae6878a96"
  },
  {
    "url": "docs-content/apis/camera/api-index.html",
    "revision": "8fe1f04dec60661b22ba77c4c0e131f4"
  },
  {
    "url": "docs-content/apis/camera/api.html",
    "revision": "e5936ac3020c8a273e5e5d1bd233e6c2"
  },
  {
    "url": "docs-content/apis/camera/index.html",
    "revision": "9dee3fa8dc87a090d449dd9d679469bf"
  },
  {
    "url": "docs-content/apis/clipboard/api-index.html",
    "revision": "35e61c8fe3baa6405d57f7a4bab70707"
  },
  {
    "url": "docs-content/apis/clipboard/api.html",
    "revision": "e777f5a3f644181bdefa2c9df1cb8dd9"
  },
  {
    "url": "docs-content/apis/clipboard/index.html",
    "revision": "0da6f103690a8ce2fbd3118b2113a662"
  },
  {
    "url": "docs-content/apis/console/index.html",
    "revision": "fdd27fa91f519ac0ea09cfc1d1df4f08"
  },
  {
    "url": "docs-content/apis/device/api-index.html",
    "revision": "b7ea5710eba20e4ef0a00907c82e324e"
  },
  {
    "url": "docs-content/apis/device/api.html",
    "revision": "b317f08f62374a3208527963771a3b80"
  },
  {
    "url": "docs-content/apis/device/index.html",
    "revision": "50cf608c273c02967f46d7e40f7fd877"
  },
  {
    "url": "docs-content/apis/filesystem/api-index.html",
    "revision": "8940da970913f0089dd37775123d687c"
  },
  {
    "url": "docs-content/apis/filesystem/api.html",
    "revision": "1af06ba80c64f4cf2d4d993a9585009c"
  },
  {
    "url": "docs-content/apis/filesystem/index.html",
    "revision": "9f9306841c9f611cd3350c845e7bfc7c"
  },
  {
    "url": "docs-content/apis/geolocation/api-index.html",
    "revision": "bbe9c502412b099b853db9eb0af074a1"
  },
  {
    "url": "docs-content/apis/geolocation/api.html",
    "revision": "8b8071f292df7ddf23cb173fd256405c"
  },
  {
    "url": "docs-content/apis/geolocation/index.html",
    "revision": "5ecc744029872037d775bf52e58715ba"
  },
  {
    "url": "docs-content/apis/haptics/api-index.html",
    "revision": "720dd0704a6f502f85a3a411ee487672"
  },
  {
    "url": "docs-content/apis/haptics/api.html",
    "revision": "3fb144695e73850ccef007514fb4eba8"
  },
  {
    "url": "docs-content/apis/haptics/index.html",
    "revision": "98f9a00517aaabae8654d32c91f54b47"
  },
  {
    "url": "docs-content/apis/keyboard/api-index.html",
    "revision": "e050c20cdde57c46f4f9c0191019c441"
  },
  {
    "url": "docs-content/apis/keyboard/api.html",
    "revision": "d1018c157735223acd96e7fabc2d62bb"
  },
  {
    "url": "docs-content/apis/keyboard/index.html",
    "revision": "c552be552a02e2b27acb97aa46e658c7"
  },
  {
    "url": "docs-content/apis/local-notifications/api-index.html",
    "revision": "e6dee56dbf1839ed2ae4c0c2c01e4432"
  },
  {
    "url": "docs-content/apis/local-notifications/api.html",
    "revision": "c6f44a02abbec4e362c7dd7a1e78ca03"
  },
  {
    "url": "docs-content/apis/local-notifications/index.html",
    "revision": "a2daa6f2c0802d045cb0c407b53b34c4"
  },
  {
    "url": "docs-content/apis/modals/api-index.html",
    "revision": "e47b551faef400812b94f42858323a27"
  },
  {
    "url": "docs-content/apis/modals/api.html",
    "revision": "cf645c1a7cc6551bb70a503e6a03ff16"
  },
  {
    "url": "docs-content/apis/modals/index.html",
    "revision": "9a2c532e3155e25b999c00d82d241bc8"
  },
  {
    "url": "docs-content/apis/motion/api-index.html",
    "revision": "e2207ab59aa67612832360a65089826a"
  },
  {
    "url": "docs-content/apis/motion/api.html",
    "revision": "7694cf1dc6a198a2360d55b9e1240ba7"
  },
  {
    "url": "docs-content/apis/motion/index.html",
    "revision": "0e52bbf40f136a2515bbb983b3f04be2"
  },
  {
    "url": "docs-content/apis/network/api-index.html",
    "revision": "c60515a73e88c5e49667f8fe4712025a"
  },
  {
    "url": "docs-content/apis/network/api.html",
    "revision": "9210a0f30533b66cd1f0fc2655a835cf"
  },
  {
    "url": "docs-content/apis/network/index.html",
    "revision": "ccf6ff184816c6b202869a753c6b5950"
  },
  {
    "url": "docs-content/apis/photos/api-index.html",
    "revision": "b24478efa3459ba287906cc6f534f763"
  },
  {
    "url": "docs-content/apis/photos/api.html",
    "revision": "3de351525559f6e2cdba84afb5e7d074"
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
    "url": "docs-content/apis/splash-screen/api-index.html",
    "revision": "ece560175f6213b80afd4f1dcdec26bd"
  },
  {
    "url": "docs-content/apis/splash-screen/api.html",
    "revision": "c84d959b3e27789ab9c07fa95f459b71"
  },
  {
    "url": "docs-content/apis/splash-screen/index.html",
    "revision": "4cb2716767134c10b9cc1a8dbbb4a0ab"
  },
  {
    "url": "docs-content/apis/status-bar/api-index.html",
    "revision": "928555f73f73a6df81d13b670145d85c"
  },
  {
    "url": "docs-content/apis/status-bar/api.html",
    "revision": "467b98e507c06b2b872d3b2817bf8aa2"
  },
  {
    "url": "docs-content/apis/status-bar/index.html",
    "revision": "8eca2f9ba2e59f1d99b15d010d3161d3"
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
    "revision": "6dade7ef57e53465497e3b242323bbeb"
  },
  {
    "url": "docs-content/basics/building-your-app.html",
    "revision": "f5bfe5277cf31758e0342f56224ada4f"
  },
  {
    "url": "docs-content/basics/component-lifecycle.html",
    "revision": "f94b50ebb42950bfc71336b61abc2b40"
  },
  {
    "url": "docs-content/basics/configuring-your-app.html",
    "revision": "140de1ac0e0e4268ef803cb4333d1547"
  },
  {
    "url": "docs-content/basics/creating-apps.html",
    "revision": "5976ea72c54eb982a2ef2a6ed0bc4727"
  },
  {
    "url": "docs-content/basics/decorators.html",
    "revision": "1192a18adfaf9f024e158a253de6ccec"
  },
  {
    "url": "docs-content/basics/events.html",
    "revision": "daa0ca09ba0388faf45ca50acdeb64f1"
  },
  {
    "url": "docs-content/basics/forms.html",
    "revision": "e645d102707c5d31e3ca463400ab7bd2"
  },
  {
    "url": "docs-content/basics/handling-arrays.html",
    "revision": "e3db7a344eff3b92b1bd1fa798d94599"
  },
  {
    "url": "docs-content/basics/managing-platforms.html",
    "revision": "2d32a3349d035db2bda5ffdd14f165da"
  },
  {
    "url": "docs-content/basics/my-first-component.html",
    "revision": "5bf814be1ae69cf68188f4e1253edc34"
  },
  {
    "url": "docs-content/basics/running-your-app.html",
    "revision": "9973139235f6a59dc455686426d62025"
  },
  {
    "url": "docs-content/basics/stencil-config.html",
    "revision": "9f2483724de100afaa8d972409f1f438"
  },
  {
    "url": "docs-content/basics/templating.html",
    "revision": "e58f462a976bc5dc581f221273c66280"
  },
  {
    "url": "docs-content/basics/testing.html",
    "revision": "26a89a2ffa18b6278c60225aec05635e"
  },
  {
    "url": "docs-content/compiler/config.html",
    "revision": "f9c2cda306801bb1b38562175b7719d6"
  },
  {
    "url": "docs-content/getting-started/index.html",
    "revision": "5d15e20df0b4a548074da3885856d684"
  },
  {
    "url": "docs-content/getting-started/migrating-from-phonegap-cordova.html",
    "revision": "b6807f3b989dff610174bf32ced84809"
  },
  {
    "url": "docs-content/index.html",
    "revision": "e82ba712ccfa509d27553e6652c15685"
  },
  {
    "url": "docs-content/intro/browsers.html",
    "revision": "d4fd210849e901aa9ddc213d72b8b063"
  },
  {
    "url": "docs-content/intro/getting-started.html",
    "revision": "59945f36fb42bbacb1eb57e714d3cd1b"
  },
  {
    "url": "docs-content/intro/index.html",
    "revision": "01c0c5b5af09fc640efb14aaeec7914f"
  },
  {
    "url": "docs-content/intro/migrating-from-phonegap-cordova.html",
    "revision": "97c374c14c7abd1c7cf8edeb2dee9f71"
  },
  {
    "url": "docs-content/ios/configuration.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/ios/managing-dependencies.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/plugins/creating-plugins.html",
    "revision": "839c7ec14524062bfbcbd49f5f85d588"
  },
  {
    "url": "docs-content/plugins/index.html",
    "revision": "e54d8ea8c33e6f1eaceb5c71897ff9df"
  },
  {
    "url": "docs-content/plugins/plugin-api-javascript.html",
    "revision": "d2107e6ad727ce0e7975e6853925aec7"
  },
  {
    "url": "docs-content/start/index.html",
    "revision": "2aabcb99454b00e03c9ec799255c63a0"
  },
  {
    "url": "docs/intro/index.html",
    "revision": "2db3e8d0408dba94808e9b87bce7cbdc"
  },
  {
    "url": "host.config.json",
    "revision": "72dd7aef167eb9f4e56ea9e8e334d0be"
  },
  {
    "url": "index.html",
    "revision": "ede626018843a0d77dcdfdfdcbd6cbe3"
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
