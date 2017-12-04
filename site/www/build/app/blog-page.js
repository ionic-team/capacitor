/*! Built with http://stenciljs.com */

App.loadStyles("blog-page","blog-page a {\n  text-decoration: none;\n}\n\nblog-page .post {\n  max-width: 600px;\n}\n\nblog-page .post p {\n  color: #111;\n}\nblog-page.hydrated{visibility:inherit}");
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
                    h("time", null, "December 12th, 2017")),
                h("p", null, "Today the Ionic team is excited excited to announce a new project called Avocado in Private Preview focusing on making it easier to build and deploy web apps on iOS, Android, Electron, and the web as a Progressive Web App, all while maximizing code reuse."),
                h("p", null, "Over the last few years, we've seen web technology proliferate on mobile like never before. As a company focused 100% on bringing the web to mobile, we're excited that teams are far more willing to build apps with web technology today than in years past."),
                h("p", null, "Our vision for the future involves building web apps that run great in a native app environment on iOS, Android, and Electron, but can be deployed just as easily on the web as a Progressive Web App."),
                h("p", null, "Avocado features a simple Plugin API for building native functionality that is exposed through JavaScript to a web layer, along with easily mixing Native UI controls with web content to get the best of both worlds."),
                h("p", null, "When targeting native iOS or Android, Avocado lets you control your entire native project without modifying it, enabling you to work in Xcode or Android Studio to easily add custom native code or Native UI if necessary. Exposing that code or those views to the web layer is as easy as connecting them to Avocado in your iOS or Android project."),
                h("p", null,
                    "This means teams with only web developers will be able to build great apps, ",
                    h("i", null, "and"),
                    " teams with a mix of native developers and web developers will be able to work together to build truly cross-platform apps."),
                h("p", null))));
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