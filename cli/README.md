# Capacitor CLI

The Capacitor command-line interface should be installed locally and executed through `npm` scripts.

```
npm install @capacitor/cli --save-dev
```


### Local Commands

Below is an example of running Capacitor commands from a webapp's npm scripts within the local `package.json` file.

```
package.json scripts

  scripts: {
    "build": "tsc && npm run sync",
    "create.android": "capacitor create android",
    "create.ios": "capacitor create ios",
    "doctor": "capacitor doctor"
    "open.android": "capacitor open android",
    "open.ios": "capacitor open ios",
    "sync": "capacitor sync"
  }
```


### CLI Commands

```
sync [platform]    updates + copy
update [platform]  updates the native plugins and dependencies
copy [platform]    copies the web app build into the native app
open [platform]    opens the native project workspace
create [platform]  create a native project
doctor [platform]  checks for common errors
plugin:generate    start a new Capacitor plugin
```

### License

* [MIT](https://github.com/ionic-team/capacitor/blob/master/LICENSE)
