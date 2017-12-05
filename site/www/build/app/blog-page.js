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
                h("p", null,
                    "Today the ",
                    h("a", { href: "http://ionicframework.com/" }, "Ionic"),
                    " team is excited excited to announce a new Private Preview open source project called Avocado that makes it easier to build and deploy web apps on iOS, Android, Electron, and the web as a Progressive Web App, all while maximizing code reuse."),
                h("p", null, "Over the last few years, we've seen web technology proliferate on mobile like never before. Increasingly, teams are building apps using web technologies, and Progressive Web Apps are poised to bring the web to mobile in a huge way. As a company focused 100% on bringing the web to mobile, we're excited that teams are far more willing to build apps with web technology today than in years past."),
                h("p", null,
                    "We think it could be even easier for web developers to use web standards to target all the platforms they care about, making it easy to build apps that run great in a native app environment on iOS, Android, and Electron, ",
                    h("i", null, "and"),
                    " on the web as a Progressive Web App."),
                h("p", null, "Avocado is our attempt at doing just that."),
                h("p", null, "Avocado is a set of tools and a web-to-native bridge that makes it possible to build powerful mobile apps with seamless native integration and Progressive Web App fallbacks. Avocado features a simple Plugin API for building native functionality that is exposed through JavaScript to a web layer, along with easily mixing Native UI controls with web content to get the best of both worlds."),
                h("p", null, "When targeting native iOS or Android, Avocado lets you control your entire native project without modifying it, enabling you to work in Xcode or Android Studio to easily add custom native code or Native UI if necessary. Exposing that code or those views to the web layer is as easy as connecting them to Avocado in your iOS or Android project."),
                h("p", null, "Avocado also bundles a set of core Native features out of the box, including Camera, Geolocation, Filesystem operations, and more. We want to provide 80% of what every app needs out of the box, while making it easy for the community to fill in the rest of the pieces."),
                h("p", null,
                    "We are hopeful that Avocado will enable teams with only web developers to build great apps, ",
                    h("i", null, "and"),
                    " teams with a mix of native developers and web developers will be able to work together to build truly cross-platform apps."),
                h("p", null, "Avocado is under active development and is currently in a Private Preview with a small set of users while we continue to build and improve the project. We expect to have a public preview early 2018."),
                h("p", null, "Please enter your email to join the mailing list to stay updated on our progress."),
                h("form", { id: "cta-form", action: "https://codiqa.createsend.com/t/t/s/flhuhj/", method: "post" },
                    h("div", null,
                        h("input", { type: "email", placeholder: "Email address", id: "fieldEmail", name: "cm-flhuhj-flhuhj", required: true, style: { padding: '5px', width: '150px' } })),
                    h("button", { type: "submit" }, "Submit")),
                h("p", null,
                    "Thanks,",
                    h("br", null),
                    "The ",
                    h("a", { href: "http://ionicframework.com/" }, "Ionic"),
                    " Team"))));
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