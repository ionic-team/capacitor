/*! Built with http://stenciljs.com */

App.loadComponents(

/**** module id (dev mode) ****/
"test-app",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
// @stencil/core

var TestApp = /** @class */ (function () {
    function TestApp() {
    }
    TestApp.prototype.render = function () {
        return (h("stencil-router", { "title-suffix": " - Stencil Router Demos" },
            h("ul", null,
                h("li", null,
                    h("stencil-route-link", { url: "/", exact: true }, "Exact Base Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/" }, "Base Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/demo", urlMatch: ['/demo', '/demox'], exact: true }, "Demo Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/demo2" }, "Demo2 Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/demo3" }, "Demo3 Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/demo3/page1" }, "Demo3 Page1 Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/demo3/page2" }, "Demo3 Page2 Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/demo4" }, "Demo4 Link")),
                h("li", null,
                    h("stencil-route-link", { url: "/demo6/" }, "Demo6 Link"))),
            h("stencil-route", { url: "/", exact: true, routeRender: function (props) {
                    return h("span", null, "rendering /");
                } }),
            h("stencil-route", { url: ['/demo', '/demox'], exact: true, routeRender: function (props) {
                    return [
                        h("stencil-route-title", { title: "DEMO" }),
                        h("span", null, "rendering /demo")
                    ];
                } }),
            h("stencil-route", { url: "/demo2", exact: true, routeRender: function (props) {
                    return [
                        h("span", null, "rendering /demo2"),
                        h("stencil-router-redirect", { url: "/demo3" })
                    ];
                } }),
            h("stencil-route", { url: "/demo3", exact: true, routeRender: function (props) {
                    return [
                        h("stencil-route-title", { title: "Demo 3" }),
                        h("span", null, "rendering /demo 3")
                    ];
                } }),
            h("stencil-route", { url: "/demo3", componentProps: {
                    pages: ['intro/index.html']
                }, component: "test-demo-three" }),
            h("stencil-route", { url: "/demo4", component: "test-demo-four" }),
            h("stencil-route", { url: "/demo5", component: "async-content", componentProps: { location: '/' } }),
            h("stencil-route", { url: "/demo6", component: "test-demo-six" })));
    };
    return TestApp;
}());

var TestDemoFour = /** @class */ (function () {
    function TestDemoFour() {
    }
    TestDemoFour.prototype.handleClick = function (e, linkLocation) {
        e.preventDefault();
        this.history.push(linkLocation, { 'blue': 'blue' });
    };
    TestDemoFour.prototype.render = function () {
        var _this = this;
        var linkLocation = '/demo3/page1';
        return (h("div", null,
            h("a", { href: linkLocation, onClick: function (e) { return _this.handleClick(e, linkLocation); } },
                "History push to ",
                linkLocation),
            h("pre", null,
                h("b", null, "this.pages"),
                ":",
                h("br", null),
                JSON.stringify(this.pages, null, 2)),
            h("pre", null,
                h("b", null, "this.match"),
                ":",
                h("br", null),
                JSON.stringify(this.match, null, 2)),
            h("pre", null,
                h("b", null, "this.history.location"),
                ":",
                h("br", null),
                JSON.stringify(this.history.location, null, 2))));
    };
    return TestDemoFour;
}());

var TestDemoSix = /** @class */ (function () {
    function TestDemoSix() {
    }
    TestDemoSix.prototype.render = function () {
        return [
            h("span", null,
                "Demo 6 Test Page",
                h("br", null)),
            h("stencil-route", { url: "/demo6/", exact: true, group: "main", routeRender: function (props) {
                    return [
                        h("h1", null, "One"),
                        h("stencil-route-link", { url: "/demo6/asdf" }, "Next")
                    ];
                } }),
            h("stencil-route", { url: "/demo6/:any*", group: "main", routeRender: function (props) {
                    return [
                        h("h1", null,
                            "Two: ",
                            props.match),
                        h("stencil-route-link", { url: "/demo6/" }, "Back")
                    ];
                } })
        ];
    };
    return TestDemoSix;
}());

var TestDemoThree = /** @class */ (function () {
    function TestDemoThree() {
    }
    TestDemoThree.prototype.render = function () {
        var _this = this;
        return [
            h("span", null,
                "Demo 3 Test Page",
                h("br", null)),
            h("stencil-route", { url: "/demo3/page1", exact: true, routeRender: function (props) {
                    return [
                        h("a", { href: "#", onClick: function (e) {
                                e.preventDefault();
                                _this.history.push('/demo3/page2', { 'blue': 'blue' });
                            } }, "History push to /demo3/page2"),
                        h("pre", null,
                            h("b", null, "props.pages"),
                            ":",
                            h("br", null),
                            JSON.stringify(_this.pages, null, 2)),
                        h("pre", null,
                            h("b", null, "props.match"),
                            ":",
                            h("br", null),
                            JSON.stringify(_this.match, null, 2)),
                        h("pre", null,
                            h("b", null, "props.history.location"),
                            ":",
                            h("br", null),
                            JSON.stringify(_this.history.location, null, 2))
                    ];
                } }),
            h("stencil-route", { url: "/demo3/page2", exact: true, routeRender: function (props) {
                    return [
                        h("a", { href: "#", onClick: function (e) {
                                e.preventDefault();
                                _this.history.push('/demo3/page1', { 'red': 'red' });
                            } }, "History push to /demo3/page1"),
                        h("pre", null,
                            h("b", null, "props.pages"),
                            ":",
                            h("br", null),
                            JSON.stringify(_this.pages, null, 2)),
                        h("pre", null,
                            h("b", null, "props.match"),
                            ":",
                            h("br", null),
                            JSON.stringify(_this.match, null, 2)),
                        h("pre", null,
                            h("b", null, "props.history.location"),
                            ":",
                            h("br", null),
                            JSON.stringify(_this.history.location, null, 2))
                    ];
                } })
        ];
    };
    return TestDemoThree;
}());

exports['test-app'] = TestApp;
exports['test-demo-four'] = TestDemoFour;
exports['test-demo-six'] = TestDemoSix;
exports['test-demo-three'] = TestDemoThree;
},


/***************** test-app *****************/
[
/** test-app: tag **/
"test-app"

],

/***************** test-demo-four *****************/
[
/** test-demo-four: tag **/
"test-demo-four",

/** test-demo-four: members **/
[
  [ "history", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "match", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "pages", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ]
]

],

/***************** test-demo-six *****************/
[
/** test-demo-six: tag **/
"test-demo-six",

/** test-demo-six: members **/
[
  [ "history", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "match", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "pages", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ]
]

],

/***************** test-demo-three *****************/
[
/** test-demo-three: tag **/
"test-demo-three",

/** test-demo-three: members **/
[
  [ "history", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "match", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ],
  [ "pages", /** prop **/ 1, /** observe attribute **/ 1, /** type any **/ 1 ]
]

]
);