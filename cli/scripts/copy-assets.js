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

const ELECTRON_TEMPLATE = 'electron-template';
const ELECTRON_TEMPLATE_SRC = path.join(MONOREPO_ROOT, ELECTRON_TEMPLATE);
const ELECTRON_TEMPLATE_DST = path.join(ASSETS_DIST, ELECTRON_TEMPLATE);

const IOS_TEMPLATE = 'ios-template';
const IOS_TEMPLATE_SRC = path.join(MONOREPO_ROOT, IOS_TEMPLATE);
const IOS_TEMPLATE_DST = path.join(ASSETS_DIST, IOS_TEMPLATE);

const PLUGIN_TEMPLATE = 'plugin-template';
const PLUGIN_TEMPLATE_SRC = path.join(MONOREPO_ROOT, PLUGIN_TEMPLATE);
const PLUGIN_TEMPLATE_DST = path.join(ASSETS_DIST, PLUGIN_TEMPLATE);

const ANDROID_PLUGINS_FOLDER = 'capacitor-android-plugins';
const ANDROID_PLUGINS_FOLDER_SRC = path.join(MONOREPO_ROOT, ANDROID_PLUGINS_FOLDER);
const ANDROID_PLUGINS_FOLDER_DST = path.join(ASSETS_DIST, ANDROID_PLUGINS_FOLDER);

const IOS_PLUGINS_FOLDER = 'capacitor-cordova-ios-plugins';
const IOS_PLUGINS_FOLDER_SRC = path.join(MONOREPO_ROOT, IOS_PLUGINS_FOLDER);
const IOS_PLUGINS_FOLDER_DST = path.join(ASSETS_DIST, IOS_PLUGINS_FOLDER);

const CAPACITOR_LOCAL_PODS_FOLDER = 'capacitor-local-pods';
const CAPACITOR_PODSPEC = 'Capacitor.podspec';
const IOS_FOLDER = 'ios';
const CAPACITOR_CORDOVA_PODSPEC = 'CapacitorCordova.podspec';
const CAPACITOR_LOCAL_PODS_FOLDER_SRC = path.join(MONOREPO_ROOT, IOS_FOLDER);
const CAPACITOR_LOCAL_PODS_FOLDER_DST = path.join(ASSETS_DIST, CAPACITOR_LOCAL_PODS_FOLDER);
const CAPACITOR_LOCAL_PODS_IOS_FOLDER_DST = path.join(CAPACITOR_LOCAL_PODS_FOLDER_DST, IOS_FOLDER);
const CAPACITOR_POD_SRC = path.join(MONOREPO_ROOT, CAPACITOR_PODSPEC);
const CAPACITOR_CORDOVA_POD_SRC = path.join(MONOREPO_ROOT, CAPACITOR_CORDOVA_PODSPEC);
const CAPACITOR_POD_DST = path.join(CAPACITOR_LOCAL_PODS_FOLDER_DST, CAPACITOR_PODSPEC);
const CAPACITOR_CORDOVA_POD_DST =  path.join(CAPACITOR_LOCAL_PODS_FOLDER_DST, CAPACITOR_CORDOVA_PODSPEC);

fs.emptyDirSync(ASSETS_DIST);

fs.copySync(APP_TEMPLATE_SRC, APP_TEMPLATE_DST);
// Rename our Android .iml file
fs.copySync(ANDROID_TEMPLATE_SRC, ANDROID_TEMPLATE_DST);
if (fs.existsSync(path.join(ANDROID_TEMPLATE_DST, 'android-template.iml'))) {
  fs.moveSync(path.join(ANDROID_TEMPLATE_DST, 'android-template.iml'), path.join(ANDROID_TEMPLATE_DST, 'android.iml'));
  let imlContent = fs.readFileSync(path.join(ANDROID_TEMPLATE_DST, 'android.iml'), 'utf8');
  imlContent = imlContent.replace(/android-template/g, 'android');
  fs.writeFileSync(path.join(ANDROID_TEMPLATE_DST, 'android.iml'), imlContent);
}

fs.copySync(IOS_TEMPLATE_SRC, IOS_TEMPLATE_DST);
fs.copySync(ELECTRON_TEMPLATE_SRC, ELECTRON_TEMPLATE_DST);
fs.copySync(PLUGIN_TEMPLATE_SRC, PLUGIN_TEMPLATE_DST);
fs.copySync(ANDROID_PLUGINS_FOLDER_SRC, ANDROID_PLUGINS_FOLDER_DST);
fs.copySync(IOS_PLUGINS_FOLDER_SRC, IOS_PLUGINS_FOLDER_DST);
fs.copySync(CAPACITOR_POD_SRC, CAPACITOR_POD_DST);
fs.copySync(CAPACITOR_CORDOVA_POD_SRC, CAPACITOR_CORDOVA_POD_DST);
fs.copySync(CAPACITOR_LOCAL_PODS_FOLDER_SRC, CAPACITOR_LOCAL_PODS_IOS_FOLDER_DST);