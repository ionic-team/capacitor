/**
 * Generate HTML documentation for each plugin, complete with
 * documentation on each interface/type used, and inline
 * comments with any code snippets or examples.
 * 
 * This got a little out of hand, I fully admit
 */
var fs = require('fs');
var os = require('os');
var path = require('path');
var util = require('util');

var SITE_DIR = path.join(process.cwd(), '../site');
var SITE_OUTPUT_DIR = 'src/assets/docs-content/apis';

const buildTypeLookup = (nodes) => {
  let d = {};
  nodes.forEach(n => d[n.id] = n);
  return d;
};

const writeIndexHtmlOutput = (plugin, string) => {
  const pluginNameSplitCapitalized = plugin.name.match(/[A-Z][a-z]+/g);
  const targetDirName = pluginNameSplitCapitalized.slice(0, pluginNameSplitCapitalized.length-1).join('-').toLowerCase();
  const p = path.join(SITE_DIR, SITE_OUTPUT_DIR, targetDirName, 'api-index.html');
  try {
    fs.writeFileSync(p, string, { encoding: 'utf8' });
  } catch(e) {
    console.error('Unable to write docs for plugin ', targetDirName);
    console.error(e);
  }
};

const writeDocumentationHtmlOutput = (plugin, string) => {
  const pluginNameSplitCapitalized = plugin.name.match(/[A-Z][a-z]+/g);
  const targetDirName = pluginNameSplitCapitalized.slice(0, pluginNameSplitCapitalized.length-1).join('-').toLowerCase();
  const p = path.join(SITE_DIR, SITE_OUTPUT_DIR, targetDirName, 'api.html');
  console.log('WRITING', p);
  try {
    fs.writeFileSync(p, string, { encoding: 'utf8' });
  } catch(e) {
    console.error('Unable to write docs for plugin ', targetDirName);
  }
};

const generateIndexForPlugin = (plugin) => {
  let methodChildren = plugin.children.filter(m => m.name != 'addListener' && m.name != 'removeListener');
  let listenerChildren = plugin.children.filter(m => m.name == 'addListener' || m.name == 'removeListener');
  var html = [
    '<div class="avc-code-plugin-index"><h3>Table of Contents</h3><ul>'
  ]

  methodChildren.forEach(method => {
    if(!method.signatures) {
      return;
    }
    method.signatures.forEach((signature, index) => {
      html.push(`<li><div class="avc-code-method-name"><anchor-link to="method-${method.name}-${index}">${method.name}()</anchor-link></div></li>`);
    })
  })
  listenerChildren.forEach(method => {
    if(!method.signatures) {
      return;
    }
    method.signatures.forEach((signature, index) => {
      var paramString = '';
      const eventNameParam = signature.parameters[0];
      if (eventNameParam && eventNameParam.type.type == 'stringLiteral') {
        paramString = `'${eventNameParam.type.value}'`;
      }
      html.push(`<li><div class="avc-code-method-name"><anchor-link to="method-${method.name}-${index}">${method.name}(${paramString})</anchor-link></div></li>`);
    })
  });

  html.push('</ul></avc-code-plugin-index>');

  return html.join('\n');
}

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

  const methodBuild = (method) => {
    // Only support methods with signatures, meaning they are our subclasses
    // implementation of it not our superclass' (I think...)
    if(!method.signatures) { return; }

    html = html.concat(generateMethod(method));
    const interfaces = getInterfacesUsedByMethod(method);
    // Dedupe the interfaces found in each method
    interfaces.filter(i => {
      if(interfacesUsedMap.hasOwnProperty(i.id)) {
        return false;
      }
      interfacesUsedMap[i.id] = i;
      return true;
    }).forEach(interface => interfacesUsed.push(interface));
  }

  methodChildren.forEach(method => methodBuild(method));
  listenerChildren.forEach(method => methodBuild(method));

  html.push('<h3 id="interfaces">Interfaces Used</h3>');
  let childrenReferences = [];
  interfacesUsed.forEach(interface => {
    const interfaceDecl = typeLookup[interface.id];
    if(!interfaceDecl) {
      return;
    }

    let kindString = interfaceDecl.kindString;
    if(!kindString) {
      kindString = 'Interface';
    } else if(kindString == 'Enumeration') {
      kindString = 'Enum';
    }

    html.push(`
    <div class="avc-code-interface" id="type-${interface.id}">
      <h4 class="avc-code-interface-name">${interface.name}</h4>
      <div class="avc-code-line">
        <span class="avc-code-keyword">${kindString.toLowerCase()}</span> <span class="avc-code-type-name">${interface.name}</span>
        <span class="avc-code-brace">{</span>
      </div>
    `);

    if(interfaceDecl.children) {
      html.push(...interfaceDecl.children.map(c => {
        const nameString = c.type.name ? c.type.name : c.type.value ? `'${c.type.value}'` : c.type.type && c.type.type === 'array' ? `${c.type.elementType.name}[]` : 'any';
        if (!c.type.name && !c.type.value) {
          console.log(c);
        }
        if (c.type.type === 'reference') {
          const childRef = typeLookup[c.type.id];
          if (!childrenReferences.includes(childRef)) {
            childrenReferences.push(childRef);
          }
        }
        return `
          <div class="avc-code-interface-param">
            <div class="avc-code-param-comment">${c.comment && `// ${c.comment.shortText}` || ''}</div>
            <div class="avc-code-line"><span class="avc-code-param-name">${c.name}</span>
              ${c.flags && c.flags.isOptional ? '<span class="avc-code-param-optional">?</span>' : ''}${kindString !== 'Enum' && `:
              ${c.type.id && `<avc-code-type type-id="${c.type.id}">${nameString}</avc-code-type>` || `<avc-code-type>${nameString}</avc-code-type>`}` || ''};
            </div>
          </div>`;
      }));
    }
    html.push(`<span class="avc-code-line"><span class="avc-code-brace">}</span></span>`);
  });

  if(childrenReferences.length>0) {
    childrenReferences.map(child => {
      let kindString = child.kindString;
      if(!kindString) {
        kindString = 'Enum';
      } else if(kindString == 'Enumeration') {
        kindString = 'Enum';
      }
      html.push(`
      <div class="avc-code-interface" id="type-${child.id}">
        <h4 class="avc-code-interface-name">${child.name}</h4>
        <div class="avc-code-line">
          <span class="avc-code-keyword">${kindString.toLowerCase()}</span> <span class="avc-code-type-name">${child.name}</span>
          <span class="avc-code-brace">{</span>
        </div>`);
      if(child.children) {
        html.push(...child.children.map(c => {
          return `
            <div class="avc-code-interface-param">
              <div class="avc-code-param-comment">${c.comment && `// ${c.comment.shortText}` || ''}</div>
              <div class="avc-code-line"><span class="avc-code-param-name">${c.name}</span>:
                <avc-code-type">${c.defaultValue}</avc-code-type>
              </div>
            </div>`;
        }));
      }
      html.push(`<span class="avc-code-line"><span class="avc-code-brace">}</span></span>`);
    });
  }
  html.push(`</div>`);

  return html.join('\n');
};

const getInterfacesUsedByMethod = (method) => {
  const interfaceTypes = [];

  const interfaces = method.signatures.map(signature => {
    // Build the params portion of the method
    const params = signature.parameters || [];

    const returnTypes = [];
    returnTypes.push(signature.type);
    signature.type.typeArguments && signature.type.typeArguments.forEach(arg => {
      returnTypes.push(arg);
    })

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
  });
  
  const ret = [];
  interfaces.forEach(iset => {
    iset.forEach(i => ret.push(i));
  });

  return ret;
};

const generateMethod = (method) => {
  return method.signatures.map((signature, index) => {
    const signatureString = generateMethodSignature(method, signature, index);
    const params = generateMethodParamDocs(signature);
    return `<div class="avc-code-method">${signatureString + params}</div>`;
  });
};

const generateMethodParamDocs = (signature) => {
  const html = ['<div class="avc-code-method-params">']

  // Build the params portion of the method
  const params = signature.parameters;
  params && params.forEach((param, i) => {
    html.push(`<div class="avc-code-method-param-info">
                <span class="avc-code-method-param-info-name">${param.name}</span>
                `)

    html.push(getParamTypeName(param));
    /*
    if (param.type.type == 'reference') {
      if(param.type.id) {
        html.push(`<avc-code-type type-id="${param.type.id}">${param.type.name}</avc-code-type>`);
      } else {
        html.push(`<avc-code-type>${param.type.name}</avc-code-type>`);
      }
    } else if (param.type.type == 'stringLiteral') {
      html.push(`<span class="avc-code-type-name">${param.type.value}</span>`);
    } else {
      html.push(`<span class="avc-code-type-name">${param.type.name}</span>`);
    }
    */

    if (param.comment) {
      html.push(`<div class="avc-code-method-param-comment">${param.comment.text}</div>`);
    }
    html.push('</div>');
  });

  html.push(`
  <div class="avc-code-method-returns-info">
    <span class="avc-code-method-returns-label">Returns:</span> ${getReturnTypeName(signature.type)}${signature.comment && signature.comment.returns ?
      ` - ${signature.comment.returns}` : ''}
  </div>
  `)

  html.push('</div>');
  return html.join('\n');
}

const generateMethodSignature = (method, signature, signatureIndex) => {
  //console.log(util.inspect(signature, {showHidden: false, depth: 20}))
  const parts = [`
                    <h3 class="avc-code-method-header" id="method-${method.name}-${signatureIndex}">${method.name}</h3>
                    <div class="avc-code-method-signature">
                      <span class="avc-code-method-name">${method.name}</span>`, '<span class="avc-code-paren">(</span>'];

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
  parts.push('<span class="avc-code-paren">)</span><span class="avc-code-return-type-colon">:</span> ');

  const returnType = signature.type;

  // Add the return type of the method
  parts.push(getReturnTypeName(returnType));

  parts.push(`
    </div>
    ${signature.comment && `<div class="avc-code-method-comment">${signature.comment.shortText}</div>` || ''}
  `);

  return parts.join('');
}

// Generate a type string for a param type
const getParamTypeName = (param) => {
  const t = param.type.type;
  if(t == 'reference') {
    if(param.type.id) {
      return `<avc-code-type type-id="${param.type.id}">${param.type.name}</avc-code-type>`;
    }
    return `<avc-code-type>${param.type.name}</avc-code-type>`;

  } else if (param.type.type == 'stringLiteral') {
    // These are the addListener(eventName: 'specificName') eventName params
    return `<span class="avc-code-string">"${param.type.value}"</span>`;
  } else if(t == 'intrinsic') {
    return `<avc-code-type>${param.type.name}</avc-code-type>`;
  } else if(t == 'reflection') {
    return `<avc-code-type>${generateReflectionType(param.type)}</avc-code-type>`;
  } else if(param.type.name) {
    return `<avc-code-type>${param.type.name}</avc-code-type>`;
  }
  return '<avc-code-type>any</avc-code-type>';
};

// Generate a type string for a reflection type
const generateReflectionType = (t) => {
  var d = t.declaration;
  var c = d.children;
  var s = d.signatures && d.signatures[0];

  if (s && s.kind == 4096) { // Call signature
    var parts = ['('];
    s.parameters = s.parameters || [];

    s.parameters.forEach((param, index) => {
      parts.push(`${param.name}: ${getParamTypeName(param)}`);
      if (index < s.parameters.length-1) {
        parts.push(', ');
      }
    });
    parts.push(') => ');
    parts.push(getReturnTypeName(s.type));
    return parts.join('');
  } else if(c) {
    var parts = ['{ '];
    c.forEach((child, index) => {
      parts.push(`${child.name}: ${getParamTypeName(child)}`);
      if (index < c.length - 1) {
        parts.push(', ');
      }
    });
    parts.push(' }');
    return parts.join('');
  }
  return 'any';
}

// Generate a type string for an intrinsic type (i.e. 'void')
const generateIntrinsicType = (type) => {
  return type.name;
}

const getReturnTypeName = (returnType) => {
  const r = returnType;

  const html = []
  if(r.type == 'reference' && r.id) {
    html.push(`<avc-code-type type-id="${r.id}">${r.name}</avc-code-type>`);
  } else {
    html.push(`${r.name}`);
  }

  if(r.typeArguments) {
    html.push('<span class="avc-code-typearg-bracket">&lt;</span>');
    r.typeArguments.forEach((a, i) => {
      if(a.id) {
        html.push(`<avc-code-type type-id="${a.id}">${a.name}</avc-code-type>`);
      } else if(a.type == 'reflection') {
        html.push(generateReflectionType(a));
      } else if(a.type == 'intrinsic') {
        html.push(generateIntrinsicType(a));
      } else {
        html.push(a.name);
      }

      if(i < r.typeArguments.length-1) {
        html.push(', ');
      }
    })
    html.push('<span class="avc-code-typearg-bracket">&gt;</span>');
  }

  return html.join('');
};

// int main(int argc, char **argv) {

let json = JSON.parse(fs.readFileSync('dist/docs.json'));

// Get the core-plugin-definitions.ts child and all of its children
var moduleChildren = json.children[0].children;

let typeLookup = buildTypeLookup(moduleChildren);

// Generate documentation for each plugin

// Plugins are defined as BlahPlugin
let plugins = moduleChildren.filter(c => c.name.endsWith('Plugin'));

plugins.forEach(plugin => writeDocumentationHtmlOutput(plugin, generateDocumentationForPlugin(plugin)));
plugins.forEach(plugin => writeIndexHtmlOutput(plugin, generateIndexForPlugin(plugin)));

// }