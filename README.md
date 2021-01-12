<br />
<p align="center">
  <img src="https://user-images.githubusercontent.com/236501/83809024-9da80580-a66a-11ea-8a1d-090fe6f8b01e.png" width="372" height="70" /><br />
</p>
<p align="center">
  ⚡️ Cross-platform apps with JavaScript and the Web ⚡️
</p>
<br />
<p align="center">
  <a href="https://github.com/ionic-team/capacitor/actions?query=workflow%3ACI"><img src="https://img.shields.io/github/workflow/status/ionic-team/capacitor/CI?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor/core"><img src="https://img.shields.io/npm/dw/@capacitor/core?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor/core"><img src="https://img.shields.io/npm/v/@capacitor/core?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor/core"><img src="https://img.shields.io/npm/l/@capacitor/core?style=flat-square" /></a>
</p>
<p align="center">
  <a href="https://capacitorjs.com/docs"><img src="https://img.shields.io/static/v1?label=docs&message=getcapacitor.com&color=blue&style=flat-square" /></a>
  <a href="https://twitter.com/capacitorjs"><img src="https://img.shields.io/twitter/follow/capacitorjs" /></a>
</p>

---

Capacitor is a cross-platform API and code execution layer that makes it easy to call Native SDKs from web code and to write custom native plugins that your app may need. Additionally, Capacitor provides first-class Progressive Web App support so you can write one app and deploy it to the app stores _and_ the mobile web.

Capacitor comes with a Plugin API for building native plugins. Plugins can be written inside Capacitor apps or packaged into an npm dependency for community use. Plugin authors are encouraged to use Swift to develop plugins in iOS and Kotlin (or Java) in Android.

## Getting Started

Capacitor was designed to drop-in to any existing modern web app. Run the following commands to initialize Capacitor in your app:

```
npm install @capacitor/core @capacitor/cli
npx cap init
```

Next, install any of the desired native platforms:

```
npx cap add android
npx cap add ios
```

### New App?

For new apps, we recommend trying the [Ionic Framework](https://ionicframework.com/) with Capacitor.

To begin, install the [Ionic CLI](https://ionicframework.com/docs/cli/) (`npm install -g @ionic/cli`) and start a new app:

```
ionic start --capacitor
```

## FAQ

#### What are the differences between Capacitor and Cordova?

In spirit, Capacitor and Cordova are very similar. Capacitor offers backward compatibility with a vast majority of Cordova plugins.

Capacitor and Cordova differ in that Capacitor:

- takes a more modern approach to tooling and plugin development
- treats native projects as source artifacts as opposed to build artifacts
- is maintained by the Ionic Team itself 💙😊

See [the docs](https://capacitorjs.com/docs/cordova#differences-between-capacitor-and-cordova) for more details.

#### Do I need to use Ionic Framework with Capacitor?

No, you do not need to use Ionic Framework with Capacitor. Without the Ionic Framework, you may need to implement Native UI yourself. Without the Ionic CLI, you may need to configure tooling yourself to enable features such as [livereload](https://ionicframework.com/docs/cli/livereload). See [the docs](https://capacitorjs.com/docs/getting-started/with-ionic) for more details.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Contributors

Made possible by the Capacitor community. 💖

<!-- CONTRIBUTORS:START -->

<p align="center">
  <a href="https://github.com/timbru31"><img src="https://github.com/timbru31.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/RangerRick"><img src="https://github.com/RangerRick.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/kheftel"><img src="https://github.com/kheftel.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/iphilgood"><img src="https://github.com/iphilgood.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mahnuh"><img src="https://github.com/mahnuh.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/DasNiels"><img src="https://github.com/DasNiels.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/tntwist"><img src="https://github.com/tntwist.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/dibyendusaha"><img src="https://github.com/dibyendusaha.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/asztal"><img src="https://github.com/asztal.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/ikeith"><img src="https://github.com/ikeith.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/friederbluemle"><img src="https://github.com/friederbluemle.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/sergiomilici"><img src="https://github.com/sergiomilici.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/imjacobclark"><img src="https://github.com/imjacobclark.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jaredcbaum"><img src="https://github.com/jaredcbaum.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/duryno"><img src="https://github.com/duryno.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/robingenz"><img src="https://github.com/robingenz.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Heerschop"><img src="https://github.com/Heerschop.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/KyDenZ"><img src="https://github.com/KyDenZ.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Jannnnnn"><img src="https://github.com/Jannnnnn.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/smpeters"><img src="https://github.com/smpeters.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/carlpoole"><img src="https://github.com/carlpoole.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jaydrogers"><img src="https://github.com/jaydrogers.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/flogy"><img src="https://github.com/flogy.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Idrimi"><img src="https://github.com/Idrimi.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/aren1989"><img src="https://github.com/aren1989.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mcmonkeys1"><img src="https://github.com/mcmonkeys1.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/pgerhard"><img src="https://github.com/pgerhard.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jrdnp"><img src="https://github.com/jrdnp.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/casaper"><img src="https://github.com/casaper.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/dennisameling"><img src="https://github.com/dennisameling.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/laurentgoudet"><img src="https://github.com/laurentgoudet.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/RemcoSimonides"><img src="https://github.com/RemcoSimonides.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/DTX-Elliot"><img src="https://github.com/DTX-Elliot.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/shakhal"><img src="https://github.com/shakhal.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/adam-h"><img src="https://github.com/adam-h.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/hinddeep"><img src="https://github.com/hinddeep.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/dwlrathod"><img src="https://github.com/dwlrathod.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/carlospavanetti"><img src="https://github.com/carlospavanetti.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/IljaDaderko"><img src="https://github.com/IljaDaderko.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Crylion"><img src="https://github.com/Crylion.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jepiqueau"><img src="https://github.com/jepiqueau.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/christhompson05"><img src="https://github.com/christhompson05.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/andysousa"><img src="https://github.com/andysousa.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bleuscyther"><img src="https://github.com/bleuscyther.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/digaus"><img src="https://github.com/digaus.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/ivannkf"><img src="https://github.com/ivannkf.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jstjnsn"><img src="https://github.com/jstjnsn.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/fkirc"><img src="https://github.com/fkirc.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/priyankpat"><img src="https://github.com/priyankpat.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jlebras"><img src="https://github.com/jlebras.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/AntoninBeaufort"><img src="https://github.com/AntoninBeaufort.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/kofoeddk"><img src="https://github.com/kofoeddk.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/chrisweight"><img src="https://github.com/chrisweight.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/JhonArlex"><img src="https://github.com/JhonArlex.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/root14"><img src="https://github.com/root14.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/tchvu3"><img src="https://github.com/tchvu3.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/veloce"><img src="https://github.com/veloce.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/p7g"><img src="https://github.com/p7g.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/orhanmaden"><img src="https://github.com/orhanmaden.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Alain1405"><img src="https://github.com/Alain1405.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/kajinka13"><img src="https://github.com/kajinka13.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/rahadur"><img src="https://github.com/rahadur.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/unitree-czk"><img src="https://github.com/unitree-czk.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/alappe"><img src="https://github.com/alappe.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/fyodorio"><img src="https://github.com/fyodorio.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mesqueeb"><img src="https://github.com/mesqueeb.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/atmosuwiryo"><img src="https://github.com/atmosuwiryo.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bibyzan"><img src="https://github.com/bibyzan.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/dotrub"><img src="https://github.com/dotrub.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Southgarden116"><img src="https://github.com/Southgarden116.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/arnauddrain"><img src="https://github.com/arnauddrain.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/rlfrahm"><img src="https://github.com/rlfrahm.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/go-u"><img src="https://github.com/go-u.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/nprail"><img src="https://github.com/nprail.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/macdja38"><img src="https://github.com/macdja38.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mike-roberts"><img src="https://github.com/mike-roberts.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bvx89"><img src="https://github.com/bvx89.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/JohanVase"><img src="https://github.com/JohanVase.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/brian-g"><img src="https://github.com/brian-g.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Justin-Credible"><img src="https://github.com/Justin-Credible.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/sandstrom"><img src="https://github.com/sandstrom.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jwsy"><img src="https://github.com/jwsy.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/flipace"><img src="https://github.com/flipace.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/nj-coder"><img src="https://github.com/nj-coder.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/cho45"><img src="https://github.com/cho45.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/RoderickQiu"><img src="https://github.com/RoderickQiu.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mikejpeters"><img src="https://github.com/mikejpeters.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/diachedelic"><img src="https://github.com/diachedelic.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/arielhernandezmusa"><img src="https://github.com/arielhernandezmusa.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/rathoreabhijeet"><img src="https://github.com/rathoreabhijeet.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/nip3o"><img src="https://github.com/nip3o.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/wslaghekke"><img src="https://github.com/wslaghekke.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/eladcandroid"><img src="https://github.com/eladcandroid.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Nodonisko"><img src="https://github.com/Nodonisko.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/zyniq82"><img src="https://github.com/zyniq82.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/D34THWINGS"><img src="https://github.com/D34THWINGS.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/josh-m-sharpe"><img src="https://github.com/josh-m-sharpe.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bartwesselink"><img src="https://github.com/bartwesselink.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jwargo"><img src="https://github.com/jwargo.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/nickpatrick"><img src="https://github.com/nickpatrick.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/rdlabo"><img src="https://github.com/rdlabo.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/nikosdouvlis"><img src="https://github.com/nikosdouvlis.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/LeviticusMB"><img src="https://github.com/LeviticusMB.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/walkingriver"><img src="https://github.com/walkingriver.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/martinkasa"><img src="https://github.com/martinkasa.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/robmarti"><img src="https://github.com/robmarti.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/rgolea"><img src="https://github.com/rgolea.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/naranjamecanica"><img src="https://github.com/naranjamecanica.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Cretezy"><img src="https://github.com/Cretezy.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/akhromieiev"><img src="https://github.com/akhromieiev.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/trancee"><img src="https://github.com/trancee.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/ralscha"><img src="https://github.com/ralscha.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/devinshoemaker"><img src="https://github.com/devinshoemaker.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/tmpreston"><img src="https://github.com/tmpreston.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/adrm"><img src="https://github.com/adrm.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/27pchrisl"><img src="https://github.com/27pchrisl.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/ankurvr"><img src="https://github.com/ankurvr.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/danielsogl"><img src="https://github.com/danielsogl.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/parveenkhtkr"><img src="https://github.com/parveenkhtkr.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jonz94"><img src="https://github.com/jonz94.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/andreasbhansen"><img src="https://github.com/andreasbhansen.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/djabif"><img src="https://github.com/djabif.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/coffeymatt"><img src="https://github.com/coffeymatt.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/digitalcrafted"><img src="https://github.com/digitalcrafted.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/CFT-Chris"><img src="https://github.com/CFT-Chris.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bryplano"><img src="https://github.com/bryplano.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mhjam"><img src="https://github.com/mhjam.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/kerosin"><img src="https://github.com/kerosin.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/pokebadgerswithspoon"><img src="https://github.com/pokebadgerswithspoon.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jabiinfante"><img src="https://github.com/jabiinfante.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/msepena"><img src="https://github.com/msepena.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/nklayman"><img src="https://github.com/nklayman.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/simonhaenisch"><img src="https://github.com/simonhaenisch.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/giocalitri"><img src="https://github.com/giocalitri.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/javebratt"><img src="https://github.com/javebratt.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/pwespi"><img src="https://github.com/pwespi.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jurepurgar"><img src="https://github.com/jurepurgar.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/stewwan"><img src="https://github.com/stewwan.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/solojuve1897"><img src="https://github.com/solojuve1897.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/baumblatt"><img src="https://github.com/baumblatt.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/nate-eisner"><img src="https://github.com/nate-eisner.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jamesgeorge007"><img src="https://github.com/jamesgeorge007.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/maedewiza"><img src="https://github.com/maedewiza.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Kikketer"><img src="https://github.com/Kikketer.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/WIStudent"><img src="https://github.com/WIStudent.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/pegler"><img src="https://github.com/pegler.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/GuilhermeBCC"><img src="https://github.com/GuilhermeBCC.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/sean118"><img src="https://github.com/sean118.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/birgerstoeckelmann"><img src="https://github.com/birgerstoeckelmann.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/xmano"><img src="https://github.com/xmano.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/rtpHarry"><img src="https://github.com/rtpHarry.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/MarkChrisLevy"><img src="https://github.com/MarkChrisLevy.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Poyoman39"><img src="https://github.com/Poyoman39.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/sergiog90"><img src="https://github.com/sergiog90.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/iliyaZelenko"><img src="https://github.com/iliyaZelenko.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Beutlin"><img src="https://github.com/Beutlin.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/dotNetkow"><img src="https://github.com/dotNetkow.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/gotbadger"><img src="https://github.com/gotbadger.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/leshik"><img src="https://github.com/leshik.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/arsa-dev"><img src="https://github.com/arsa-dev.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bsaf"><img src="https://github.com/bsaf.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/JensRavens"><img src="https://github.com/JensRavens.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bartbaas"><img src="https://github.com/bartbaas.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/luke-schleicher"><img src="https://github.com/luke-schleicher.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mxdmedia"><img src="https://github.com/mxdmedia.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/perrygovier"><img src="https://github.com/perrygovier.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/vially"><img src="https://github.com/vially.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/wf9a5m75"><img src="https://github.com/wf9a5m75.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/cthos"><img src="https://github.com/cthos.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/ptitjes"><img src="https://github.com/ptitjes.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/netsesame2"><img src="https://github.com/netsesame2.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/michaeltintiuc"><img src="https://github.com/michaeltintiuc.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/moberwasserlechner"><img src="https://github.com/moberwasserlechner.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jthoms1"><img src="https://github.com/jthoms1.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/dwieeb"><img src="https://github.com/dwieeb.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mykeskin"><img src="https://github.com/mykeskin.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/triniwiz"><img src="https://github.com/triniwiz.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/martinlindhe"><img src="https://github.com/martinlindhe.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/sbannigan"><img src="https://github.com/sbannigan.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/json-derulo"><img src="https://github.com/json-derulo.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/wtrocki"><img src="https://github.com/wtrocki.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/robert-claypool"><img src="https://github.com/robert-claypool.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jgw96"><img src="https://github.com/jgw96.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/bensperry"><img src="https://github.com/bensperry.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/kevinports"><img src="https://github.com/kevinports.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/techiediaries"><img src="https://github.com/techiediaries.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jlucfarias"><img src="https://github.com/jlucfarias.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/darthdie"><img src="https://github.com/darthdie.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/hamzatrq"><img src="https://github.com/hamzatrq.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mhartington"><img src="https://github.com/mhartington.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/kensodemann"><img src="https://github.com/kensodemann.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/JStumpp"><img src="https://github.com/JStumpp.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/sagarkaurav"><img src="https://github.com/sagarkaurav.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/peterpeterparker"><img src="https://github.com/peterpeterparker.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/ashinzekene"><img src="https://github.com/ashinzekene.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/joshdholtz"><img src="https://github.com/joshdholtz.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/IT-MikeS"><img src="https://github.com/IT-MikeS.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/abraham"><img src="https://github.com/abraham.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Manduro"><img src="https://github.com/Manduro.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/janpio"><img src="https://github.com/janpio.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/sajTempler"><img src="https://github.com/sajTempler.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/elylucas"><img src="https://github.com/elylucas.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/Geroo"><img src="https://github.com/Geroo.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/luishmcmoreno"><img src="https://github.com/luishmcmoreno.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/keithdmoore"><img src="https://github.com/keithdmoore.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/EWBears"><img src="https://github.com/EWBears.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/ihadeed"><img src="https://github.com/ihadeed.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/jcesarmobile"><img src="https://github.com/jcesarmobile.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/tlancina"><img src="https://github.com/tlancina.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/manucorporat"><img src="https://github.com/manucorporat.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/adamdbradley"><img src="https://github.com/adamdbradley.png?size=100" width="50" height="50" /></a>
  <a href="https://github.com/mlynch"><img src="https://github.com/mlynch.png?size=100" width="50" height="50" /></a>
</p>

<!-- CONTRIBUTORS:END -->
