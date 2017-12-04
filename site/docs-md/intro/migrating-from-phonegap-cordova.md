# Migrating from Cordova/PhoneGap to Avocado

Migrating from Cordova/PhoneGap to Avocado requires moving web assets to a new folder, and then configuring each
platform-specific configuration file based on past values in `config.xml`. Finally, plugins are managed
through a different process and need to be added to a new configuration system.

## Move web assets to src/

Avocado eschews the `www` folder for a root `src` folder that contains the original web code for your app.

This `src` folder is either built or copied based on the structure of your project, and used as the core web content for each platform.

Cordova/PhoneGap projects should move the contents of their `www` folder into `src/`.

## Move