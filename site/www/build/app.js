/*! Built with http://stenciljs.com */
(function (window, document, appNamespace, publicPath, appCore, appCorePolyfilled, components, x, i) {
    'use strict';
    // create global namespace if it doesn't already exist

    (window[appNamespace] = window[appNamespace] || {}).components = components = components || [];
    // auto hide components until they been fully hydrated
    // reusing the "x" variable from the args for funzies
    x = document.createElement('style');
    x.innerHTML = components.filter(function (c) {
        return c[2];
    }).map(function (c) {
        return c[0];
    }).join() + '{visibility:hidden}';
    x.setAttribute('data-visibility', '');
    document.head.insertBefore(x, document.head.firstChild);
    // get this current script
    appNamespace = appNamespace.toLowerCase();
    x = document.scripts;
    for (i = x.length - 1; i >= 0; i--) {
        if (x[i].src && x[i].src.split('/').pop() === appNamespace + '.js') {
            publicPath = x[i].src.replace(appNamespace + '.js', appNamespace + '/');
            break;
        }
    }
    // request the core this browser needs
    // test for native support of custom elements and fetch
    // if either of those are not supported, then use the core w/ polyfills
    x = document.createElement('script');
    x.src = publicPath + (window.customElements && window.fetch ? appCore : appCorePolyfilled);
    x.setAttribute('data-path', publicPath);
    x.setAttribute('data-core', appCore);
    document.head.appendChild(x);
})(window, document, "App","/build/app/","app.core.js","app.core.pf.js",[["app-marked","app-marked",1,[["content",5],["doc",1,1,2],["isServer",3,1,3,"isServer"]]],["avocado-site","avocado-site",1,[["isLandingPage",1,1,3]]],["blog-page","blog-page",1],["demos-page","demos-page",1],["document-component","app-marked",1,[["pages",1]]],["landing-page","avocado-site",1,[["el",7]]],["lazy-iframe","avocado-site",1,[["el",7],["realSrc",5],["src",1,1,2],["title",1,1,2]]],["pwas-page","pwas-page",1],["resources-page","resources-page",1],["site-header","avocado-site",1],["site-menu","avocado-site",1],["stencil-async-content","stencil-async-content",0,[["content",5],["documentLocation",1,1,2]]],["stencil-route","stencil-async-content",0,[["activeRouter",3,0,0,"activeRouter"],["component",1,1,2],["componentProps",1,1,1],["exact",1,1,3],["group",1,1,2],["location",3,0,0,"location"],["match",5],["routeRender",1,1,1],["url",1,1,1]]],["stencil-route-link","stencil-async-content",0,[["activeClass",1,1,2],["activeRouter",3,0,0,"activeRouter"],["custom",1,1,3],["exact",1,1,3],["location",3,0,0,"location"],["match",5],["url",1,1,2],["urlMatch",1,1,1]],0,1],["stencil-route-title","stencil-async-content",0,[["activeRouter",3,0,0,"activeRouter"],["title",1,1,2]]],["stencil-router","stencil-async-content",0,[["activeRouter",3,0,0,"activeRouter"],["match",5],["root",1,1,2],["titleSuffix",1,1,2]],0,1],["stencil-router-redirect","stencil-async-content",0,[["activeRouter",3,0,0,"activeRouter"],["url",1,1,2]]],["test-app","test-app"],["test-demo-four","test-app",0,[["history",1,1,1],["match",1,1,1],["pages",1,1,1]]],["test-demo-six","test-app",0,[["history",1,1,1],["match",1,1,1],["pages",1,1,1]]],["test-demo-three","test-app",0,[["history",1,1,1],["match",1,1,1],["pages",1,1,1]]]]);