/*! Built with http://stenciljs.com */

App.loadStyles("app-marked","\napp-marked.hydrated{visibility:inherit}","avc-code-type","\navc-code-type.hydrated{visibility:inherit}","document-component","document-component ul {\n  -webkit-padding-start: 0px;\n}\n\ndocument-component ul li, document-component ul code {\n  font-size: 16px;\n  margin-left: 18px;\n}\n\ndocument-component p a {\n  color: #69D353;\n  text-decoration: none;\n}\n\ndocument-component p code {\n  font-weight: 600;\n  font-family: \"Source Code Pro\",monospace;\n  font-size: 14px;\n  letter-spacing: -0.02em;\n}\n\ndocument-component #introButton {\n  background: #69D353;\n  color: white;\n  text-decoration: none;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n}\n\ndocument-component #introButton:hover {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);\n  transform: translateY(1px);\n}\ndocument-component.hydrated{visibility:inherit}","plugin-api","plugin-api .avc-code-plugin-name {\n  display: none;\n}\n\nplugin-api .avc-code-method {\n  margin-top: 25px;\n  font-family: monospace;\n}\n\nplugin-api .avc-code-method-param-info .avc-code-method-param-info-name {\n  font-size: 14px;\n  font-weight: bold;\n}\n\nplugin-api avc-code-type {\n  display: inline-block;\n}\nplugin-api.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"app-marked",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
class AppMarked {
    componentWillLoad() {
        return this.fetchNewContent();
    }
    fetchNewContent() {
        return fetch(`/avocado/docs-content/${this.doc}`)
            .then(response => response.text())
            .then(data => {
            this.content = data;
            const el = document.createElement('div');
            el.innerHTML = data;
            const headerEl = el.querySelector('h1');
            document.title = (headerEl && headerEl.textContent + ' - Avocado') || 'Avocado';
            // requestAnimationFrame is not available for preRendering
            // or SSR, so only run this in the browser
            if (!this.isServer) {
                window.requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                });
            }
        });
    }
    render() {
        return (h("div", { innerHTML: this.content }));
    }
}

class AvcCodeType {
    render() {
        if (this.typeId) {
            return (h("a", { href: "#" },
                h("slot", null)));
        }
        return (h("slot", null));
    }
}

class DocumentComponent {
    constructor() {
        this.pages = [];
    }
    render() {
        console.log(this.pages);
        return (h("div", { class: "wrapper" },
            h("div", { class: "pull-left" },
                h("site-menu", null)),
            h("div", { class: "pull-right" }, this.pages.map(page => h("app-marked", { doc: page })))));
    }
}

class PluginApi {
    componentDidLoad() {
        return fetch(`/avocado/docs-content/apis/${this.name}/api.html`)
            .then(response => response.text())
            .then(data => {
            this.content = data;
            const el = document.createElement('div');
            el.innerHTML = data;
        });
    }
    render() {
        return (h("div", null,
            h("div", { innerHTML: this.content })));
    }
}

exports['app-marked'] = AppMarked;
exports['avc-code-type'] = AvcCodeType;
exports['document-component'] = DocumentComponent;
exports['plugin-api'] = PluginApi;
},


/***************** app-marked *****************/
[
/** app-marked: tag **/
"app-marked",

/** app-marked: members **/
[
  [ "content", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "doc", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "isServer", /** prop context **/ 3, /** do not observe attribute **/ 0, /** type any **/ 1, /** context ***/ "isServer" ]
],

/** app-marked: host **/
{},

/** app-marked: events **/
0 /* no events */,

/** app-marked: propWillChanges **/
0 /* no prop will change methods */,

/** app-marked: propDidChanges **/
[
  [
    /*****  app-marked prop did change [0] ***** /
    /* prop name **/ "doc",
    /* call fn *****/ "fetchNewContent"
  ]
]

],

/***************** avc-code-type *****************/
[
/** avc-code-type: tag **/
"avc-code-type",

/** avc-code-type: members **/
[
  [ "typeId", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ]
],

/** avc-code-type: host **/
{}

],

/***************** document-component *****************/
[
/** document-component: tag **/
"document-component",

/** document-component: members **/
[
  [ "pages", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ]
],

/** document-component: host **/
{}

],

/***************** plugin-api *****************/
[
/** plugin-api: tag **/
"plugin-api",

/** plugin-api: members **/
[
  [ "content", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "name", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ]
],

/** plugin-api: host **/
{}

]
);