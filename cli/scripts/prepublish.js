const fs = require('fs-extra');
const path = require('path');

const MONOREPO_ROOT = path.join(__dirname, '../..');
const RESOURCES_DST = path.join(__dirname, '../resources');

const ANDROID_TEMPLATE = 'android-template';
const ANDROID_TEMPLATE_SRC = path.join(MONOREPO_ROOT, ANDROID_TEMPLATE);
const ANDROID_TEMPLATE_DST = path.join(RESOURCES_DST, ANDROID_TEMPLATE);

const IOS_TEMPLATE = 'ios-template';
const IOS_TEMPLATE_SRC = path.join(MONOREPO_ROOT, IOS_TEMPLATE);
const IOS_TEMPLATE_DST = path.join(RESOURCES_DST, IOS_TEMPLATE);

fs.emptyDirSync(RESOURCES_DST);

fs.copy(ANDROID_TEMPLATE_SRC, ANDROID_TEMPLATE_DST);
fs.copy(IOS_TEMPLATE_SRC, IOS_TEMPLATE_DST);
