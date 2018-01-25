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
    "url": "assets/img/checkbox.png",
    "revision": "ae3b4b201fb303732670371d573dd3e8"
  },
  {
    "url": "assets/img/docs/project-structure.png",
    "revision": "f27c862862e8f36772a6700dd06c697c"
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
    "url": "assets/img/logo-light.png",
    "revision": "f47714952da31e778de109a52fc49e28"
  },
  {
    "url": "assets/img/right-img.png",
    "revision": "5841d9860a1facd71f0e01fe283142f0"
  },
  {
    "url": "assets/img/video-icon.png",
    "revision": "6f27af15cab04aafd7193b76825c2eac"
  },
  {
    "url": "build/app.js",
    "revision": "23fbe7116e616ed2a373a015cd240a40"
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
    "revision": "0d7f230d8bda9ec279543dab3f0e279c"
  },
  {
    "url": "build/app/cv7cbtbi.js",
    "revision": "b425d7fba0b1c25730cf13a34af6b556"
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
    "url": "build/app/lshpsice.js",
    "revision": "e005ec82cdd9f78de33ea72a8cebe839"
  },
  {
    "url": "build/app/m372a6dd.js",
    "revision": "5572996fc5c7b76f5df6665954e9f6e6"
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
    "url": "build/app/ojvlu6aw.js",
    "revision": "3942ad52f9a91a595adfbcc1266f64d0"
  },
  {
    "url": "build/app/oqxa33jo.js",
    "revision": "f6578319d070c173e47216938cbfc910"
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
    "revision": "b8718ad5b4f9b6329ca24a5b55df68b3"
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
    "url": "docs-content/apis/accessibility/api-index.html",
    "revision": "c84e52dbb98183015302dea571f16b87"
  },
  {
    "url": "docs-content/apis/accessibility/api.html",
    "revision": "fde08f0b256a319c90ffed95afa3dffc"
  },
  {
    "url": "docs-content/apis/accessibility/index.html",
    "revision": "2e84f82d1c574074a3b07b2f5e1adfcb"
  },
  {
    "url": "docs-content/apis/action-sheet/index.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "docs-content/apis/app/api-index.html",
    "revision": "7ad879b3b20eaf133c46c870e2f83661"
  },
  {
    "url": "docs-content/apis/app/api.html",
    "revision": "bd7bef628c6c633270f5e51a657488eb"
  },
  {
    "url": "docs-content/apis/app/index.html",
    "revision": "d9f8fd00a5eb77eaadffd1b90feb377c"
  },
  {
    "url": "docs-content/apis/browser/api-index.html",
    "revision": "2f0250cfd9c2eaedc5f2c48bac1b711d"
  },
  {
    "url": "docs-content/apis/browser/api.html",
    "revision": "c9e0f80459061d8a11636255174ad95a"
  },
  {
    "url": "docs-content/apis/browser/index.html",
    "revision": "0fe66698efd42cbd413eb7d1e3ef644e"
  },
  {
    "url": "docs-content/apis/camera/api-index.html",
    "revision": "8fe1f04dec60661b22ba77c4c0e131f4"
  },
  {
    "url": "docs-content/apis/camera/api.html",
    "revision": "609419d4bc46c7eec05a1503d31d3a33"
  },
  {
    "url": "docs-content/apis/camera/index.html",
    "revision": "fb3ad9e8c3d88effa6893df7291ffea3"
  },
  {
    "url": "docs-content/apis/clipboard/api-index.html",
    "revision": "35e61c8fe3baa6405d57f7a4bab70707"
  },
  {
    "url": "docs-content/apis/clipboard/api.html",
    "revision": "5a18a1a6f9d9ec8fa05ee00371b99633"
  },
  {
    "url": "docs-content/apis/clipboard/index.html",
    "revision": "43520186cbd1179105295ea5ed280557"
  },
  {
    "url": "docs-content/apis/console/index.html",
    "revision": "8a3f3e9744935bf0330f458e3ec82922"
  },
  {
    "url": "docs-content/apis/device/api-index.html",
    "revision": "b7ea5710eba20e4ef0a00907c82e324e"
  },
  {
    "url": "docs-content/apis/device/api.html",
    "revision": "553af63571ddfb4447969cb76506e311"
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
    "revision": "ac2441d463881b8a856ba199fb3590fe"
  },
  {
    "url": "docs-content/apis/filesystem/index.html",
    "revision": "92ba04ea915c3bb271aaa228364755e6"
  },
  {
    "url": "docs-content/apis/geolocation/api-index.html",
    "revision": "580bd4c8ea1e60fb56e22ed201a613e4"
  },
  {
    "url": "docs-content/apis/geolocation/api.html",
    "revision": "9d32fddcf63f5c58f29fa38a034c8b94"
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
    "revision": "f7a70ae5974434744c5889b177b1af92"
  },
  {
    "url": "docs-content/apis/haptics/index.html",
    "revision": "c41d3dcebfc232c854959cb44578ed43"
  },
  {
    "url": "docs-content/apis/keyboard/api-index.html",
    "revision": "e050c20cdde57c46f4f9c0191019c441"
  },
  {
    "url": "docs-content/apis/keyboard/api.html",
    "revision": "622735b78ad6a07cd4ffb6d00edcd436"
  },
  {
    "url": "docs-content/apis/keyboard/index.html",
    "revision": "c552be552a02e2b27acb97aa46e658c7"
  },
  {
    "url": "docs-content/apis/local-notifications/api-index.html",
    "revision": "95d55b55d95889bf96aa560358a38cb9"
  },
  {
    "url": "docs-content/apis/local-notifications/api.html",
    "revision": "3be0e8ce9409311813ead460bb2f0d58"
  },
  {
    "url": "docs-content/apis/local-notifications/index.html",
    "revision": "a2daa6f2c0802d045cb0c407b53b34c4"
  },
  {
    "url": "docs-content/apis/modals/api-index.html",
    "revision": "7f646e42022b24ccf8d33fda6504a43f"
  },
  {
    "url": "docs-content/apis/modals/api.html",
    "revision": "59a622daf39bf9c14b126ea3af45547d"
  },
  {
    "url": "docs-content/apis/modals/index.html",
    "revision": "44c337a9b98a6a3eb60326829a1c810e"
  },
  {
    "url": "docs-content/apis/motion/api-index.html",
    "revision": "6478879114b4175a5f55dfc45e36e028"
  },
  {
    "url": "docs-content/apis/motion/api.html",
    "revision": "d7925c07db39a8215751470884f96611"
  },
  {
    "url": "docs-content/apis/motion/index.html",
    "revision": "0e52bbf40f136a2515bbb983b3f04be2"
  },
  {
    "url": "docs-content/apis/network/api-index.html",
    "revision": "533ceff771e2615b2e034c7eebcf155f"
  },
  {
    "url": "docs-content/apis/network/api.html",
    "revision": "889dfd4aebfd5d6a85681d2f43d0eefb"
  },
  {
    "url": "docs-content/apis/network/index.html",
    "revision": "1291d958cffd84a12750f6eae7285767"
  },
  {
    "url": "docs-content/apis/photos/api-index.html",
    "revision": "b24478efa3459ba287906cc6f534f763"
  },
  {
    "url": "docs-content/apis/photos/api.html",
    "revision": "88e559148ff6098842783f9244028bc2"
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
    "url": "docs-content/apis/share/api-index.html",
    "revision": "f2b7ece940327b04fbc4af0f01755640"
  },
  {
    "url": "docs-content/apis/share/api.html",
    "revision": "62418283c372970c1d95932830908e9c"
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
    "revision": "11d1de044a2607c6725784fc3d229ca8"
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
    "revision": "f3d0363083c26305ab84783e6a4df9d4"
  },
  {
    "url": "docs-content/apis/status-bar/index.html",
    "revision": "fca37df050b381637a6130f340f72499"
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
    "url": "docs-content/basics/building-your-app.html",
    "revision": "ea4d6042eb37052fd3463374d2d0b3af"
  },
  {
    "url": "docs-content/basics/configuring-your-app.html",
    "revision": "140de1ac0e0e4268ef803cb4333d1547"
  },
  {
    "url": "docs-content/basics/index.html",
    "revision": "454655883e616a2db22bf5f75d6589f1"
  },
  {
    "url": "docs-content/basics/managing-platforms.html",
    "revision": "2d32a3349d035db2bda5ffdd14f165da"
  },
  {
    "url": "docs-content/basics/opening-native-projects.html",
    "revision": "f6765a95e3c2807f961a9b5c7fa22790"
  },
  {
    "url": "docs-content/basics/progressive-web-app.html",
    "revision": "8013d0ff7bee76d052e542cd1f8fb32a"
  },
  {
    "url": "docs-content/basics/running-your-app.html",
    "revision": "f237558531d96d4ddc0f9be07232663d"
  },
  {
    "url": "docs-content/getting-started/dependencies.html",
    "revision": "589af0c9d721151cfccfd0768aa90709"
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
    "revision": "6204bd7627e715f3b367d2bfda1ee1fa"
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
    "url": "docs-content/plugins/cordova.html",
    "revision": "3070cb961fbdf4437a2a96e0fa09478b"
  },
  {
    "url": "docs-content/plugins/creating-plugins.html",
    "revision": "56901486c866a500b3c748b2da095a25"
  },
  {
    "url": "docs-content/plugins/index.html",
    "revision": "3f3e6ec828a3d3ba9f8b09de357df70f"
  },
  {
    "url": "docs-content/plugins/plugin-api-javascript.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "host.config.json",
    "revision": "43ff32edcc70ea68d4f373b2fb774bb5"
  },
  {
    "url": "index.html",
    "revision": "9f19d08292ff162357eb33af74fe4656"
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
