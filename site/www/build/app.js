/*! Built with http://stenciljs.com */
(function(win, doc, appNamespace, publicPath, appCore, appCoreSsr, appCorePolyfilled, components) {

function init(win, doc, appNamespace, publicPath, appCore, appCoreSsr, appCorePolyfilled, components, x, y) {
    // create global namespace if it doesn't already exist
    (win[appNamespace] = win[appNamespace] || {}).components = components;
    y = components.filter(function (c) { return c[2]; }).map(function (c) { return c[0]; });
    if (y.length) {
        // auto hide components until they been fully hydrated
        // reusing the "x" and "i" variables from the args for funzies
        x = doc.createElement('style');
        x.innerHTML = y.join() + '{visibility:hidden}';
        x.setAttribute('data-visibility', '');
        doc.head.insertBefore(x, doc.head.firstChild);
    }
    // get this current script
    // script tag cannot use "async" attribute
    appNamespace = appNamespace.toLowerCase();
    x = doc.scripts[doc.scripts.length - 1];
    if (x && x.src) {
        y = x.src.split('/').slice(0, -1);
        publicPath = (y.join('/')) + (y.length ? '/' : '') + appNamespace + '/';
    }
    // request the core this browser needs
    // test for native support of custom elements and fetch
    // if either of those are not supported, then use the core w/ polyfills
    // also check if the page was build with ssr or not
    x = doc.createElement('script');
    x.src = publicPath + ((supportsCustomElements(x) && supportsEsModules(win) && supportsFetch(win) && supportsCssVariables(win)) ? (requiresSsrClient(doc) ? appCoreSsr : appCore) : appCorePolyfilled);
    x.setAttribute('data-path', publicPath);
    x.setAttribute('data-namespace', appNamespace);
    doc.head.appendChild(x);
}
function supportsCustomElements(scriptElm) {
    return 'noModule' in scriptElm;
}
function supportsEsModules(win) {
    return win.customElements;
}
function supportsFetch(win) {
    return win.fetch;
}
function supportsCssVariables(win) {
    return (win.CSS && win.CSS.supports && win.CSS.supports('color', 'var(--c)'));
}
function requiresSsrClient(doc) {
    return doc.documentElement.hasAttribute('data-ssr');
}


init(win, doc, appNamespace, publicPath, appCore, appCoreSsr, appCorePolyfilled, components);

})(window, document, "App","build/app/","app.core.js","app.core.ssr.js","es5-build-disabled.js",[["anchor-link",["anchor-link",null],1,[["to",1,1,2]],0,1],["app-marked",["anchor-link",null],1,[["content",5],["doc",1,1,2],["el",7],["isServer",3,0,0,"isServer"]]],["avc-code-type",["anchor-link",null],0,[["typeId",1,1,2]],0,1],["blog-page",["blog-page",null],1],["capacitor-site",["capacitor-site",null],1,[["isLandingPage",1,1,3]]],["demos-page",["demos-page",null],1],["doc-snippet",["anchor-link",null]],["document-component",["anchor-link",null],1,[["pages",1,1,1]]],["landing-page",["capacitor-site",null],1,[["el",7]]],["lazy-iframe",["capacitor-site",null],1,[["el",7],["realSrc",5],["src",1,1,2],["title",1,1,2]]],["plugin-api",["anchor-link",null],1,[["content",5],["index",1,1,3],["name",1,1,2]]],["pwas-page",["pwas-page",null],1],["resources-page",["resources-page",null],1],["site-bar",["site-bar",null],1],["site-header",["capacitor-site",null],1],["site-menu",["capacitor-site",null],1],["stencil-async-content",["stencil-async-content",null],0,[["content",5],["documentLocation",1,1,2]]],["stencil-route",["stencil-async-content",null],0,[["activeRouter",3,0,0,"activeRouter"],["component",1,1,2],["componentProps",1,1,1],["exact",1,1,3],["group",1,1,2],["location",3,0,0,"location"],["match",5],["routeRender",1,1,1],["url",1,1,1]]],["stencil-route-link",["stencil-async-content",null],0,[["activeClass",1,1,2],["activeRouter",3,0,0,"activeRouter"],["custom",1,1,3],["exact",1,1,3],["location",3,0,0,"location"],["match",5],["url",1,1,2],["urlMatch",1,1,1]],0,1],["stencil-route-title",["stencil-async-content",null],0,[["activeRouter",3,0,0,"activeRouter"],["title",1,1,2]]],["stencil-router",["stencil-async-content",null],0,[["activeRouter",3,0,0,"activeRouter"],["match",5],["root",1,1,2],["titleSuffix",1,1,2]],0,1],["stencil-router-redirect",["stencil-async-content",null],0,[["activeRouter",3,0,0,"activeRouter"],["url",1,1,2]]],["test-app",["test-app",null]],["test-demo-four",["test-app",null],0,[["history",1,1,1],["match",1,1,1],["pages",1,1,1]]],["test-demo-six",["test-app",null],0,[["history",1,1,1],["match",1,1,1],["pages",1,1,1]]],["test-demo-three",["test-app",null],0,[["history",1,1,1],["match",1,1,1],["pages",1,1,1]]]]);