# Avocado

Monorepo for Avocado core libraries.

### Directory Structure

* `packages/cli`: Avocado CLI
* `packages/ios`: Avocado iOS Runtime
* `packages/android`: Avocado Android Runtime
* `packages/js`: Avocado JS library
* `packages/example`: iOS Example for development

### Running iOS Example

```
cd packages/js/
npm run build
sudo npm link
```

```
cd packages/example
npm run build && cp -R www/* ios/IonicRunner/www/
```

Then open `packages/example/ios/IonicRunner/IonicRunner.xcodeproj` and run it
