/**
 * Generate HTML documentation for each plugin, complete with
 * documentation on each interface/type used, and inline
 * comments with any code snippets or examples.
 */
var fs = require('fs');

const buildTypeLookup = (nodes) => {
  let d = {};
  nodes.forEach(n => d[n.id] = n);
  return d;
};

const generateDocumentationForPlugin = (plugin) => {
  //console.log(`\n\nPlugin: ${plugin.name}`);
  var html = [
    `<div class="avc-code-plugin">
      <div class="avc-code-plugin-name">${plugin.name}</div>
    `
  ];

  const interfacesUsedMap = {};
  const interfacesUsed = [];
  let methodChildren = plugin.children.filter(m => m.name != 'addListener' && m.name != 'removeListener');
  let listenerChildren = plugin.children.filter(m => m.name == 'addListener' || m.name == 'removeListener');

  methodChildren.forEach(method => {
    html = html.concat(generateMethod(method));
    const interfaces = getInterfacesUsedByMethod(method);

    // Dedupe the interfaces found in each method
    interfacesUsed.push(...interfaces.filter(i => {
      if(interfacesUsedMap.hasOwnProperty(i.id)) {
        return false;
      }
      interfacesUsedMap[i.id] = i;
      return true;
    }));
  });

  console.log('Interfaces used:');
  interfacesUsed.forEach(interface => {
    const interfaceDecl = typeLookup[interface.id];
    if(!interfaceDecl) {
      return;
    }
    console.log(getInterfaceDeclString(interfaceDecl));
  })

  console.log(html);
};

const getInterfaceDeclString = (interface) => {
  const l = [];
  l.push(`interface ${interface.name} {`);

  if(interface.children) {
    l.push(...interface.children.map(c => {
      return `  ${c.name}${c.flags && c.flags.isOptional ? '?' : ''}: ${c.type && c.type.name}`;
    }));
  }
  l.push('}');
  return l.join('\n');
};

const getInterfacesUsedByMethod = (method) => {
  const interfaceTypes = [];

  const signature = method.signatures[0];

  // Build the params portion of the method
  const params = signature.parameters;

  const returnTypes = [];
  returnTypes.push(signature.type);
  signature.type.typeArguments && signature.type.typeArguments.forEach(arg => {
    returnTypes.push(arg);
  })

  if(!params) { return []; }

  return params.map(param => {
    const t = param.type.type;
    if(t == 'reference') {
      return param.type;
    }
  }).filter(n => n).concat(returnTypes.map(type => {
    const t = type.type;
    if(t == 'reference') {
      return type;
    }
  }).filter(n => n));
};

const generateMethod = (method) => {
  const signature = generateMethodSignature(method);
  console.log(signature);
};

const generateMethodSignature = (method) => {
  const parts = [`<div class="avc-code-method-name">${method.name}</div>`, '<span class="avc-code-parent">(</span>'];
  const signature = method.signatures[0];

  // Build the params portion of the method
  const params = signature.parameters;
  params && params.forEach((param, i) => {
    parts.push(`<span class="avc-code-param-name">${param.name}</span>`)

    if(param.flags && param.flags.isOptional) {
      parts.push('<span class="avc-code-param-optional">?</span>');
    }

    parts.push('<span class="avc-code-param-colon">:</span> ');
    parts.push(getParamTypeName(param));
    if(i < params.length-1) {
      parts.push(', ');
    }
  });
  parts.push('): ');

  const returnType = signature.type;

  // Add the return type of the method
  parts.push(getReturnTypeName(returnType));

  parts.push('</div>');

  return parts.join('');
}

const getParamTypeName = (param) => {
  const t = param.type.type;
  if(t == 'reference') {
    if(param.type.id) {
      return `<avc-code-type type-id="${param.type.id}">${param.type.name}</avc-code-type>`;
    }
    return `<avc-code-type>${param.type.name}</avc-code-type>`;
  }
  return 'any';
};

const getReturnTypeName = (returnType) => {
  const r = returnType;

  const html = []
  if(r.type.type == 'reference') {
    html.push(`<avc-code-type type-id="${r.type.id}">${r.type.name}</avc-code-type>`);
  }

  if(r.typeArguments) {
    html.push('<span class="avc-code-typearg-bracket">&lt;</span>');
    r.typeArguments.forEach(a => {
      if(a.type.id) {
        html.push(`<avc-code-type type-id="${a.type.id}">${a.type.name}</avc-code-type>`);
      }
    })
    html.push('<span class="avc-code-typearg-bracket">&gt;</span>');
  }

  return html;
};

// int main(int argc, char **argv) {

let json = JSON.parse(fs.readFileSync('dist/docs.json'));

// Get the core-plugin-definitions.ts child and all of its children
var moduleChildren = json.children[0].children;

let typeLookup = buildTypeLookup(moduleChildren);

// Generate documentation for each plugin

// Plugins are defined as BlahPlugin
let plugins = moduleChildren.filter(c => c.name.endsWith('Plugin'));

plugins.forEach(plugin => generateDocumentationForPlugin(plugin));

// }