const fs = require('fs-extra');
const path = require('path');

const MONOREPO_ROOT = path.join(__dirname, '../..');
const ASSETS_DIST = path.join(__dirname, '../assets');

const ANDROID_TEMPLATE = 'android-template';
const ANDROID_TEMPLATE_SRC = path.join(MONOREPO_ROOT, ANDROID_TEMPLATE);
const ANDROID_TEMPLATE_DST = path.join(ASSETS_DIST, ANDROID_TEMPLATE);

const IOS_TEMPLATE = 'ios-template';
const IOS_TEMPLATE_SRC = path.join(MONOREPO_ROOT, IOS_TEMPLATE);
const IOS_TEMPLATE_DST = path.join(ASSETS_DIST, IOS_TEMPLATE);

fs.emptyDirSync(ASSETS_DIST);

fs.copy(ANDROID_TEMPLATE_SRC, ANDROID_TEMPLATE_DST);
fs.copy(IOS_TEMPLATE_SRC, IOS_TEMPLATE_DST);

// TODO: REMOVE ONCE IT IS NOT NEEDED
// Copying the Avocado iOS runtime to asserts in only needed
// until we release Avocado runtime as a cocoapod package
const IOS_RUNTIME = 'ios/Avocado';
const IOS_RUNTIME_SRC = path.join(MONOREPO_ROOT, IOS_RUNTIME);
const IOS_RUNTIME_DST = path.join(ASSETS_DIST, 'Avocado');
fs.copy(IOS_RUNTIME_SRC, IOS_RUNTIME_DST);