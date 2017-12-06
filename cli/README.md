# AvocadoJS CLI

The AvocadoJS command-line interface should be installed locally and executed through `npm` scripts.

```
npm install @avocado/cli --save-dev
```


### Local Commands

Below is an example of running Avocado commands from a webapp's npm scripts within the local `package.json` file.

```
package.json scripts

  scripts: {
    "avocado.create": "avocado create",
    "avocado.sync": "avocado sync"
    "build": "tsc && npm run avocado.sync"
  }
```


### CLI Commands

```
sync [platform]     updates + copy
update [platform]   updates the native plugins and dependencies based in package.json
copy [platform]     copies the web app build into the native app
open [platform]     opens the native project workspace (xcode for iOS)
create [platform]   create a native project
doctor [platform]   checks the current setup for common errors
plugin:generate     start a new avocado plugin
```
