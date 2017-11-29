Build Example
=====================

```
Build the JS avocado client, inside of packages/js, run:

npm run build
npm link


Build the ionic 2 app and copy assets, inside of packages/example, run:

npm link avocado-js
npm run build && cp -R www/* ios/IonicRunner/www/


Open in XCode
example/ios/IonicRunner/IonicRunner.xcodeproj


```