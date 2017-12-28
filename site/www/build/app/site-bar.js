/*! Built with http://stenciljs.com */

App.loadStyles("site-bar","site-bar {\n  display: block;\n  width: 100%;\n  padding: 10px;\n  background-color: red;\n  background-color: #f54f4f;\n  text-align: center;\n  color: #fff;\n  font-size: 13px;\n}\n\nsite-bar a {\n  color: #000;\n  font-weight: 500;\n}\nsite-bar.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"site-bar",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
class SiteBar {
    render() {
        return (h("div", { class: "site-bar" },
            "Avocado is in Private Preview. Read the ",
            h("stencil-route-link", { url: "/blog" }, "announcement blog"),
            " for more info on the project"));
    }
}

exports['site-bar'] = SiteBar;
},


/***************** site-bar *****************/
[
/** site-bar: tag **/
"site-bar",

/** site-bar: members **/
0 /* no members */,

/** site-bar: host **/
{}

]
);