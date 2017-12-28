/*! Built with http://stenciljs.com */

App.loadStyles("demos-page","demos-page a {\n  text-decoration: none;\n}\ndemos-page.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"demos-page",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
class DemosPage {
    constructor() {
        this.demos = [
            {
                title: 'Stenciljs.com',
                description: 'Yep, this site is also built with Stencil!',
                url: 'https://stenciljs.com/',
                source: 'https://github.com/ionic-team/stencil-site',
            },
            {
                title: 'IonicHN',
                description: 'Hacker News PWA built with @stencil/core and @ionic/core',
                url: 'https://corehacker-10883.firebaseapp.com/',
                source: 'https://github.com/ionic-team/ionic-stencil-hn-app'
            },
            {
                title: 'Stencil Fiber demo',
                description: 'This showcases the runtime performance of stencil using our async rendering',
                url: 'https://stencil-fiber-demo.firebaseapp.com/',
                source: 'https://github.com/ionic-team/stencil-fiber-demo'
            },
            {
                title: 'StencilNews',
                description: 'Demo of how you could use @stencil/core to build a fast, modern News PWA',
                url: 'https://stencilnews.firebaseapp.com/',
                source: 'https://github.com/ionic-team/stencil-news'
            }
        ];
        document.title = `Stencil Demos`;
    }
    render() {
        return (h("div", { class: "wrapper" },
            h("div", { class: "pull-left" },
                h("site-menu", null)),
            h("div", { class: "pull-right" },
                h("h1", null, "Demos"),
                h("h4", null, "Awesome demos of apps built using Stencil and Ionic"),
                this.demos.map(demo => {
                    return [
                        h("h4", null, demo.title),
                        h("p", null, demo.description),
                        h("p", null,
                            h("a", { target: "_blank", rel: "noopener", href: demo.url }, "Demo"),
                            "\u00A0\u00A0",
                            h("a", { target: "_blank", rel: "noopener", href: demo.source }, "Source"))
                    ];
                }))));
    }
}

exports['demos-page'] = DemosPage;
},


/***************** demos-page *****************/
[
/** demos-page: tag **/
"demos-page",

/** demos-page: members **/
0 /* no members */,

/** demos-page: host **/
{}

]
);