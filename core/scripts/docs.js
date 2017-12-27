var fs = require('fs');

let json = JSON.parse(fs.readFileSync('dist/docs.json'));

// Get the core-plugin-definitions.ts child and all of its children
var moduleChildren = json.children[0].children;

// Plugins are defined as BlahPlugin
let plugins = moduleChildren.filter(c => c.name.endsWith('Plugin'));

const generateDocumentationForPlugin = (plugin) => {
  console.log(`\n\nPlugin: ${plugin.name}`);
  let methodChildren = plugin.children.filter(m => m.name != 'addListener' && m.name != 'removeListener');
  let listenerChildren = plugin.children.filter(m => m.name == 'addListener' || m.name == 'removeListener');
  /*
  sort((a, b) => {
    if(a.name == 'addListener') { return 1; }
    if(a.name == 'removeListener') { return 2; }
    return a.name - b.name;
  });
  */
  console.log(methodChildren);
  console.log(listenerChildren);
};

plugins.forEach(plugin => generateDocumentationForPlugin(plugin));