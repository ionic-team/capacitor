# Console

The Console API automatically sends `console.log` calls to the native log system on each respective platform. This enables, for example,
`console.log` calls to be rendered in the Xcode and Android Studio log windows.

To disable the Console API, call `Plugins.Console.disable()` or set `"console": false` in `avocado.config.js`