# App Project Structure

Avocado apps have a core `src` folder for web code, and folders for each platform the app will run on.

![project structure](/assets/img/avocado/project-structure.png)

## Configuration files

Avocado has a few high level configuration options available in `avocado.json`, such as the name and bundle identifier of the app.

Additionally, traditional JavaScript project configuration and dependencies for web code and avocado can be configured in `package.json`.

## Managing Platforms

By default, all platforms are generated in a project folder, to remove a platform, just delete the directory.

Platforms can be re-added with the command

```bash
avocado platform add pwa
```
