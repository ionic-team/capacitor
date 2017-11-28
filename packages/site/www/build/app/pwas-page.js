/*! Built with http://stenciljs.com */

App.loadStyles("pwas-page","pwas-page img {\n  max-width: 100%;\n  margin-top: 1em;\n  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);\n  border-radius: 4px;\n}\n\npwas-page a {\n  text-decoration: none;\n}\npwas-page.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"pwas-page",

/**** component modules ****/
function importComponent(exports, h, t, Context, publicPath) {
"use strict";
// @stencil/core

var pwasPage = /** @class */ (function () {
    function pwasPage() {
        document.title = "PWAs";
    }
    pwasPage.prototype.render = function () {
        return (h("div", { class: "wrapper" },
            h("div", { class: "pull-left" },
                h("site-menu", null)),
            h("div", { class: "pull-right" },
                h("h1", null, "PWAs"),
                h("h4", null, "Building PWAs with Stencil"),
                h("p", null, "Want to build a PWA with Stencil? Follow these instructions to instantly have a production ready PWA."),
                h("ul", null,
                    h("li", null,
                        "Run ",
                        h("code", null, "git clone https://github.com/ionic-team/stencil-app-starter.git my-pwa"),
                        " in your terminal."),
                    h("li", null,
                        "Run ",
                        h("code", null, "npm run build"))),
                "And with just those two commands you now have a PWA that scores 100 on lighthouse right out of the box.",
                h("img", { src: "/assets/img/pwa.png" }),
                h("h4", null, "Under the hood"),
                h("h5", null, "Service Worker"),
                h("p", null,
                    "When your run ",
                    h("code", null, "npm run build"),
                    " we automatically generate a Service Worker for you using ",
                    h("a", { href: "https://workboxjs.org/" }, "Workbox"),
                    " that handles pre-caching your assets."),
                h("stencil-route-link", { url: "/docs/service-workers" }, "Read more about Service Workers here."),
                h("h5", null, "Web Manifest"),
                h("p", null,
                    "By default we include a Web Manifest that has all the neccessary entries to get the Add to Homescreen prompt. You can see that web manifest ",
                    h("a", { href: "https://github.com/ionic-team/stencil-app-starter/blob/master/src/manifest.json" }, "here"),
                    "."),
                h("h4", null, "PWAs built with Stencil"),
                h("ul", null,
                    h("li", null,
                        h("a", { href: "https://stenciljs.com/" }, "This site! Yep stenciljs.com is a PWA")),
                    h("li", null,
                        h("a", { href: "https://corehacker-10883.firebaseapp.com/" },
                            "Ionic HN as featured on ",
                            h("a", { href: "https://hnpwa.com" }, "HNPWA"))),
                    h("li", null,
                        h("a", { href: "https://stencilpaint-8ba3c.firebaseapp.com/" }, "StencilPaint"))))));
    };
    return pwasPage;
}());

exports['pwas-page'] = pwasPage;
},


/***************** pwas-page *****************/
[
/** pwas-page: tag **/
"pwas-page",

/** pwas-page: members **/
0 /* no members */,

/** pwas-page: host **/
{}

]
);