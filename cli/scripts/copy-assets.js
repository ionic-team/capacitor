const fs = require('fs-extra');
const path = require('path');

const MONOREPO_ROOT = path.join(__dirname, '../..');
const ASSETS_DIST = path.join(__dirname, '../assets');

const APP_TEMPLATE = 'app-template';
const APP_TEMPLATE_SRC = path.join(MONOREPO_ROOT, APP_TEMPLATE);
const APP_TEMPLATE_DST = path.join(ASSETS_DIST, APP_TEMPLATE);

const ANDROID_TEMPLATE = 'android-template';
const ANDROID_TEMPLATE_SRC = path.join(MONOREPO_ROOT, ANDROID_TEMPLATE);
const ANDROID_TEMPLATE_DST = path.join(ASSETS_DIST, ANDROID_TEMPLATE);

const IOS_TEMPLATE = 'ios-template';
const IOS_TEMPLATE_SRC = path.join(MONOREPO_ROOT, IOS_TEMPLATE);
const IOS_TEMPLATE_DST = path.join(ASSETS_DIST, IOS_TEMPLATE);

const PLUGIN_TEMPLATE = 'plugin-template';
const PLUGIN_TEMPLATE_SRC = path.join(MONOREPO_ROOT, PLUGIN_TEMPLATE);
const PLUGIN_TEMPLATE_DST = path.join(ASSETS_DIST, PLUGIN_TEMPLATE);


fs.emptyDirSync(ASSETS_DIST);

fs.copySync(APP_TEMPLATE_SRC, APP_TEMPLATE_DST);
fs.copySync(ANDROID_TEMPLATE_SRC, ANDROID_TEMPLATE_DST);
fs.copySync(IOS_TEMPLATE_SRC, IOS_TEMPLATE_DST);
fs.copySync(PLUGIN_TEMPLATE_SRC, PLUGIN_TEMPLATE_DST);

// Remove .iml files to avoid comitting them
fs.unlinkSync(path.join(ANDROID_TEMPLATE_DST, 'android-template.iml'))
fs.unlinkSync(path.join(ANDROID_TEMPLATE_DST, 'app/app.iml'))