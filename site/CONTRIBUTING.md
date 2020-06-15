# Contributing

Thanks for your interest in contributing to the Capacitor Docs! :tada:

The Capacitor website (`site/`) and documentation (`site/docs-md`) live alongside the code. Looking to assist? See Capacitor issues labeled "docs" [here](https://github.com/ionic-team/capacitor/issues?q=is%3Aopen+is%3Aissue+label%3Adocs).

## Setup

1. Fork this repo.
2. Clone your fork.
3. Make a branch for your change.
4. Run `npm install` in the `core` folder.
5. Run `npm install` in the `site` folder.
6. Run `npm run start` to build and deploy the website/docs to localhost.

> Note: Content updated while the dev server is running won't be reflected locally. Stop the process, then re-run `npm run start`.

## Adding a new docs page to the sidebar
Open `site/docs-md/README.md` to add the new entry to the side bar.

## Modifying documentation

For smaller edits, navigate to the desired page in the [Capacitor docs](https://capacitor.ionicframework.com/docs/) then click the "Submit an edit" button.

1. Locate the doc you want to modify in `site/docs-md/`.
2. Modify the documentation, making sure to keep the format the same as the rest of the doc.
3. Run `npm run start` to make sure your changes look correct.
