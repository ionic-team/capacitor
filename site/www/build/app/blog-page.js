/*! Built with http://stenciljs.com */

App.loadStyles("blog-page","demos-page a {\n  text-decoration: none;\n}\nblog-page.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"blog-page",

/**** component modules ****/
function importComponent(exports, h, t, Context, publicPath) {
"use strict";
// @stencil/core

var BlogPage = /** @class */ (function () {
    function BlogPage() {
        document.title = "Avocado Blog - Build cross-platform apps with the web";
    }
    BlogPage.prototype.render = function () {
        return (h("div", { id: "blog", class: "wrapper" },
            h("div", { class: "post" },
                h("h2", null, "Announcing Avocado"),
                h("div", null,
                    "By ",
                    h("a", { href: "http://twitter.com/maxlynch" }, "Max Lynch"),
                    " on ",
                    h("time", null, "December 12th, 2017")))));
    };
    return BlogPage;
}());

exports['blog-page'] = BlogPage;
},


/***************** blog-page *****************/
[
/** blog-page: tag **/
"blog-page",

/** blog-page: members **/
0 /* no members */,

/** blog-page: host **/
{}

]
);