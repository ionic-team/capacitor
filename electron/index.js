const fs = require('fs');
const path = require('path');

function getURLFileContents(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      // console.error(err);
      if(err)
        reject(err);
      resolve(data.toString());
    });
  });
}

const injectCapacitor = async function(url) {
  try {
    // console.log(url.substr(url.indexOf('://') + 3));
    let urlFileContents = await getURLFileContents(url.substr(url.indexOf('://') + 3));
    let pathing = path.join(url.substr(url.indexOf('://') + 3), '../../node_modules/@capacitor/electron/electron-bridge.js');
    // console.log(pathing);
    urlFileContents = urlFileContents.replace('<body>', `<body><script>window.require('${pathing.replace(/\\/g,'\\\\')}')</script>`);
    // console.log(urlFileContents);
    return 'data:text/html;charset=UTF-8,' + urlFileContents;
  } catch(e) {
    // console.error(e);
    return url;
  }
};

//const CorePlugins = require('./plugins');

module.exports = {
  injectCapacitor,
  //CorePlugins,
};