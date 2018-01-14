<h1 id="migrating-from-cordova-phonegap-to-capacitor">Migrating from Cordova/PhoneGap to Capacitor</h1>
<p>Capacitor can be used as a replacement for Cordova/PhoneGap in many cases. The two projects provide a web environment with full access to native features and functionality, but with a few differences in their approach to tooling, native project management, and plugins. Capacitor also has support for existing Cordova plugins, providing a new runtime with access to the rich Cordova plugin ecosystem.</p>
<h2 id="differences-between-capacitor-and-cordova">Differences between Capacitor and Cordova</h2>
<p>Capacitor has a few differences in approach that require changing app development workflows.</p>
<h3 id="native-project-management">Native Project Management</h3>
<p>First, Capacitor considers each platform project a <em>source asset</em> instead of a build time asset. That means you&#39;ll check in your Xcode and Android Studio projects, as well as use those IDEs when necessary for platform-specific configuration and running/testing.</p>
<p>We do this for a few reasons:</p>
<ol>
<li>It&#39;s easier to add custom native code that your app might need, without having to build a plugin for it</li>
<li>Updating and modifying native projects through abstracted-away tools is error prone and a moving target</li>
<li>Adding Native UI shell around your web app is easier when you &quot;own&quot; the project</li>
<li>Running iOS apps from the command line is not officially supported by Apple, so Xcode is preferred</li>
</ol>
<p>This change in approach has a few implications. First, Capacitor does not use <code>config.xml</code> or a similar custom configuration for platform settings; all configuration is done by editing the appropriate platform-specific configuration files directly, such as <code>AndroidManifest.xml</code> for Android, and <code>Info.plist</code> for Xcode.</p>
<p>Capacitor does not run on device or emulate through the command line. Instead, such operations are done through the platform-specific IDE which we believe provides a faster, more typical experience that follows the standards of app development for that platform.</p>
<h3 id="plugin-management">Plugin Management</h3>
<p>Capacitor manages plugins in a different way than Cordova. First, Capacitor does not copy plugin source code to your app before building. Instead, all plugins are built as Frameworks (on iOS) and Libraries (on Android) and installed using the leading dependency management tool for each platform (CocoaPods and Gradle/Maven, respectively). Additionally, Capacitor does not modify native source code, so any necessary native project settings must be added manually (for example, permissions in <code>AndroidManifest.xml</code>). We think this approach is less error-prone, and makes it easier for developers to find help in the community for each specific platform.</p>
<p>One major difference is the way Plugins handle the JavaScript code they need in order to be executed from the WebView. Cordova requires plugins to ship their own JavaScript and manually call <code>exec()</code>. Capacitor, in contrast, registers and exports all JavaScript for each plugin based on the methods it detects at runtime, so all plugin methods are available as soon as the WebView loads. One important implication of this is there is no more need for the <code>deviceready</code> event: as soon as your app code loads you can start calling Plugin methods.</p>
<p>While Capacitor doesn&#39;t require plugins to provide JavaScript, many plugins will want to have logic in JavaScript. In this case, providing a plugin with extra JavaScript is as easy as shipping a traditional JavaScript library (bundle, module, etc), but instead of calling <code>exec()</code> in Cordova, the plugin will reference the Capacitor plugin through <code>Capacitor.Plugins.MyPlugin</code>.</p>
<p>Finally, Capacitor has implications for plugin authors. On iOS, Swift 4 is officially supported and even <em>preferred</em> for building plugins (Objective-c is also supported). Plugins no longer export a <code>Plugin.xml</code> file; Capacitor provides a few simple macros (on iOS), and Annotations (on Android) for adding metadata to your plugin source code that Capacitor reads at runtime.</p>
<h3 id="cli-version-management">CLI/Version Management</h3>
<p>Capacitor, unlike Cordova, does not use a global CLI. Instead, the Capacitor &quot;CLI&quot; is installed locally to each project as an npm script. This makes it easier to manage versions of Capacitor across many different apps.</p>
<p>Thus, instead of running <code>capacitor</code> directly from the command line, Capacitor is invoked by calling <code>npm run capacitor</code> in the directory of your app.</p>
<h2 id="migration-process">Migration Process</h2>
<h2 id="using-cordova-plugins-in-capacitor">Using Cordova Plugins in Capacitor</h2>
<p>Capacitor was designed from the start to support the rich Cordova plugin ecosystem out of the box. Thus, using Cordova plugins in Capacitor is easy. Follow the <a href="">Cordova Plugin</a> guide for more information on how this works.</p>
