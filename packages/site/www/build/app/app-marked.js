/*! Built with http://stenciljs.com */

App.loadStyles("app-marked","\napp-marked.hydrated{visibility:inherit}","document-component","document-component ul {\n  -webkit-padding-start: 0px;\n}\n\ndocument-component ul li, document-component ul code {\n  font-size: 16px;\n  margin-left: 18px;\n}\n\ndocument-component p a {\n  color: #69D353;\n  text-decoration: none;\n}\n\ndocument-component p code {\n  font-weight: 600;\n  font-family: \"Source Code Pro\",monospace;\n  font-size: 14px;\n  letter-spacing: -0.02em;\n}\n\ndocument-component #introButton {\n  background: #69D353;\n  color: white;\n  text-decoration: none;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n}\n\ndocument-component #introButton:hover {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);\n  transform: translateY(1px);\n}\ndocument-component.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"app-marked",

/**** component modules ****/
function importComponent(exports, h, t, Context, publicPath) {
"use strict";
// @stencil/core

var AppMarked = /** @class */ (function () {
    function AppMarked() {
    }
    AppMarked.prototype.componentWillLoad = function () {
        return this.fetchNewContent();
    };
    AppMarked.prototype.fetchNewContent = function () {
        var _this = this;
        return fetch("/docs-content/" + this.doc)
            .then(function (response) { return response.text(); })
            .then(function (data) {
            _this.content = data;
            var el = document.createElement('div');
            el.innerHTML = data;
            var headerEl = el.querySelector('h1');
            document.title = (headerEl && headerEl.textContent + ' - Stencil') || 'Stencil';
            // requestAnimationFrame is not available for preRendering
            // or SSR, so only run this in the browser
            if (!_this.isServer) {
                window.requestAnimationFrame(function () {
                    window.scrollTo(0, 0);
                });
            }
        });
    };
    AppMarked.prototype.render = function () {
        return (h("div", { innerHTML: this.content }));
    };
    return AppMarked;
}());

var DocumentComponent = /** @class */ (function () {
    function DocumentComponent() {
        this.pages = [];
    }
    DocumentComponent.prototype.render = function () {
        console.log(this.pages);
        return (h("div", { class: "wrapper" },
            h("div", { class: "pull-left" },
                h("site-menu", null)),
            h("div", { class: "pull-right" }, this.pages.map(function (page) { return h("app-marked", { doc: page }); }))));
    };
    return DocumentComponent;
}());

exports['app-marked'] = AppMarked;
exports['document-component'] = DocumentComponent;
},


/***************** app-marked *****************/
[
/** app-marked: tag **/
"app-marked",

/** app-marked: members **/
[
  [ "content", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "doc", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "isServer", /** prop context **/ 3, /** observe attribute **/ 1, /** type boolean **/ 3, /** context ***/ "isServer" ]
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

/***************** document-component *****************/
[
/** document-component: tag **/
"document-component",

/** document-component: members **/
[
  [ "pages", /** prop **/ 1, /** do not observe attribute **/ 0, /** type any **/ 1 ]
],

/** document-component: host **/
{}

]
);