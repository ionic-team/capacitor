# App Project Structure


## Configuration files

Capacitor has a few high level configuration options available in `capacitor.json`, such as the name and bundle identifier of the app.

Additionally, traditional JavaScript project configuration and dependencies for web code and capacitor can be configured in `package.json`.

## Managing Platforms

By default, all platforms are generated in a project folder, to remove a platform, just delete the directory.

Platforms can be re-added with the command

```bash
capacitor platform add pwa
```
