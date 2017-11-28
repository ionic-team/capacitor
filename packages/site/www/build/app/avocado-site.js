/*! Built with http://stenciljs.com */

App.loadStyles("avocado-site","* {\n  box-sizing: border-box;\n}\n\navocado-site {\n  height: 100%;\n  display: flex;\n  flex-flow: column;\n}\n\n.app {\n  height: 100%;\n  max-width: 1080px;\n  margin: auto;\n}\n\n#main-div {\n  flex-grow: 1;\n  flex-shrink: 0;\n}\n\n::selection {\n  background: #e7e7f2;\n}\n\n::-moz-selection {\n  background: #e7e7f2;\n}\n\nhtml, body {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n  width: 100%;\n  height: 100%;\n  padding: 0;\n  margin: 0;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n}\n\nh1, h2, h3, h4 {\n  color: #16161d;\n}\n\nh1 {\n  font-size: 28px;\n  font-weight: bold;\n}\n\nh2 {\n  font-size: 20px;\n  font-weight: bold;\n}\n\nh2, h3 {\n  margin-top: 48px;\n  margin-bottom: 8px;\n}\n\np, ul {\n  color: #2d2d4c;\n  font-size: 15px;\n  line-height: 2em;\n  margin: 24px 0px;\n}\n\nstencil-route-link:hover {\n  cursor: pointer;\n}\n\n.wrapper {\n  line-height: 32px;\n  min-height: 100%;\n  padding-top: 60px;\n  margin: 15px;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-content: stretch;\n  align-items: flex-start;\n}\n\npre {\n  word-break: break-all;\n  word-wrap: break-word;\n  display: block;\n  white-space: pre-wrap;\n  margin: 24px 0px 28px;\n  padding: 16px 24px;\n  border-radius: 4px;\n  color: #abb2bf;\n  background-color: #404040;\n}\n\npre code {\n  font-weight: 500;\n  display: block;\n  overflow-x: auto;\n  word-wrap: normal;\n  white-space: pre;\n  box-sizing: border-box;\n  font-size: 14px;\n  line-height: 20px;\n}\n\ncode {\n  font-weight: 400;\n  font-family: \"Source Code Pro\", monospace;\n  font-size: 14px;\n}\n\n.nextButton {\n  background: #5851ff;\n  color: white;\n  text-decoration: none;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n  float: right;\n  margin-right: 5px;\n}\n\n.nextButton:hover {\n  text-decoration: none;\n  transform: translateY(1px);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.16);\n}\n\n.backButton {\n  color: #5851ff;\n  background: white;\n  text-decoration: none;\n  float: left;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n  margin-bottom: 15px;\n  margin-left: 5px;\n}\n\n.backButton:hover {\n  text-decoration: none;\n  transform: translateY(1px);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.16);\n}\n\n.hljs-comment, .hljs-quote {\n  color: #5c6370;\n  font-style: italic;\n}\n\n.hljs-doctag, .hljs-keyword, .hljs-formula {\n  color: #c678dd;\n}\n\n.hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst {\n  color: #e06c75;\n}\n\n.hljs-literal {\n  color: #56b6c2;\n}\n\n.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta-string {\n  color: #98c379;\n}\n\n.hljs-built_in, .hljs-class .hljs-title {\n  color: #e6c07b;\n}\n\n.hljs-attr,\n.hljs-variable,\n.hljs-template-variable,\n.hljs-type,\n.hljs-selector-class,\n.hljs-selector-attr,\n.hljs-selector-pseudo,\n.hljs-number {\n  color: #d19a66;\n}\n\n.hljs-symbol,\n.hljs-bullet,\n.hljs-link,\n.hljs-meta,\n.hljs-selector-id,\n.hljs-title {\n  color: #61aeee;\n}\n\n.hljs-emphasis {\n  font-style: italic;\n}\n\n.hljs-strong {\n  font-weight: bold;\n}\n\n.hljs-link {\n  text-decoration: underline;\n}\n\nfooter {\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  background: #f8f8fc;\n  height: 8em;\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  flex: 0 0 8em;\n  margin-top: 32px;\n}\n\nfooter .svg-button {\n  margin-left: 16px;\n  transition: all .15s ease;\n}\n\nfooter .svg-button:hover {\n  opacity: 0.5;\n}\n\n#open-source img {\n  width: 50%;\n}\n\n#open-source p {\n  margin-top: 0;\n  margin-bottom: 0;\n  color: #a5a4b8;\n  font-size: 10px;\n}\n\n@media screen and (max-width: 355px) {\n  .wrapper {\n    padding-top: 100px;\n  }\n}\n\n@media screen and (max-width: 450px) {\n  .wrapper {\n    padding-top: 80px;\n  }\n  site-header a {\n    display: none;\n  }\n  site-header stencil-route-link a {\n    display: initial;\n  }\n}\n\n@media screen and (max-width: 590px) {\n  .wrapper {\n    margin-right: 0;\n    margin-left: 0;\n    -webkit-justify-content: space-between;\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n    -webkit-flex-direction: column-reverse;\n    -ms-flex-direction: column-reverse;\n    flex-direction: column-reverse;\n  }\n  .wrapper .pull-right {\n    padding: 0 15px;\n    width: 100%;\n    min-height: 100vh;\n  }\n  .wrapper .pull-left {\n    position: relative;\n    padding: 15px;\n    width: 100%;\n    bottom: 0;\n    background-color: #16161d;\n  }\n  .wrapper .pull-left * {\n    color: #ffffff;\n  }\n}\n\n@media screen and (min-width: 590px) {\n  .wrapper .pull-left {\n    min-width: 250px;\n    max-width: 250px;\n    position: -webkit-sticky;\n    position: sticky;\n    top: 50px;\n  }\n  .wrapper .pull-right {\n    padding-left: 96px;\n    padding-right: 32px;\n    flex: 1 1 auto;\n    overflow: auto;\n    min-height: 100vh;\n  }\n}\navocado-site.hydrated{visibility:inherit}","landing-page","landing-page main {\n  display: flex;\n  flex-direction: column;\n  margin-top: 10em;\n}\n\nlanding-page #logo {\n  width: 4em;\n  height: 4em;\n}\n\nlanding-page #action-call {\n  font-size: 3em;\n  line-height: normal;\n  margin-top: 20px;\n}\n\nlanding-page button {\n  margin: 8px;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n}\n\nlanding-page button:hover {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);\n  transform: translateY(1px);\n}\n\nlanding-page #get-started {\n  background: #7fd02e;\n  color: white;\n}\n\nlanding-page #learn-more {\n  background: white;\n  color: #7fd02e;\n}\n\nlanding-page #youtube-video {\n  opacity: 0;\n  transition: opacity 0.3s, transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);\n  position: absolute;\n  z-index: 9999;\n  pointer-events: none;\n  display: flex;\n  justify-content: center;\n  left: 0;\n  width: 100%;\n}\n\nlanding-page #youtube-video iframe {\n  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15), 0px 20px 40px rgba(0, 0, 0, 0.2);\n  border-radius: 8px;\n}\n\nlanding-page .youtube-show {\n  opacity: 1 !important;\n  transform: translatey(-30px) !important;\n  pointer-events: auto !important;\n}\n\nlanding-page #background {\n  height: 100%;\n  position: fixed;\n  width: 100%;\n  z-index: 8888;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  opacity: 0;\n  pointer-events: none;\n  background-color: #00082d;\n  transition: opacity 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);\n}\n\nlanding-page .background-show {\n  opacity: 0.4 !important;\n  pointer-events: auto !important;\n}\n\nlanding-page #three-points {\n  display: flex;\n  justify-content: space-around;\n  text-align: center;\n  margin-top: 3.2em;\n  margin-bottom: 2.8em;\n}\n\nlanding-page .point-card {\n  flex: 1;\n  margin: 2.4em;\n  position: relative;\n}\n\nlanding-page .point-card h2 {\n  margin-top: 72px;\n}\n\nlanding-page .point-card p {\n  color: #626177;\n  font-weight: 400;\n  font-size: 16px;\n  letter-spacing: -0.02em;\n  line-height: 30px;\n}\n\nlanding-page #launch-video, landing-page #mobile-video {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 4;\n  transition: all .2s ease;\n  cursor: pointer;\n  text-decoration: none;\n  outline: none;\n}\n\nlanding-page #launch-video:hover, landing-page #mobile-video:hover {\n  opacity: 0.7;\n}\n\nlanding-page #launch-video img, landing-page #mobile-video img {\n  height: 1.2em;\n}\n\nlanding-page #launch-video span, landing-page #mobile-video span {\n  font-size: 14px;\n  margin-left: 8px;\n  color: #5851ff;\n  font-weight: 500;\n  transition: all .15s ease;\n}\n\nlanding-page #mobile-video {\n  display: none;\n}\n\n@media screen and (max-width: 740px) {\n  landing-page #action-call {\n    width: auto;\n  }\n  landing-page #launch-video {\n    display: none;\n  }\n  landing-page #youtube-video {\n    display: none;\n  }\n  landing-page #mobile-video {\n    display: flex;\n  }\n  landing-page #three-points {\n    flex-direction: column;\n    text-align: left;\n  }\n  landing-page #three-points .point-card {\n    margin: 1em 2.4em;\n  }\n  landing-page #three-points .point-card::before {\n    left: 0;\n  }\n}\nlanding-page.hydrated{visibility:inherit}","lazy-iframe","lazy-iframe iframe {\n  /*width: 100%;\n    height: 100%;*/\n}\nlazy-iframe.hydrated{visibility:inherit}","site-header","site-header {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  background-color: rgba(255, 255, 255, 0.8);\n  -webkit-backdrop-filter: saturate(180%) blur(20px);\n  backdrop-filter: saturate(180%) blur(20px);\n  z-index: 99;\n}\n\nsite-header .logo {\n  height: 48px;\n}\n\nsite-header .logo-link a {\n  margin: 0;\n}\n\nsite-header .site-header {\n  padding: 20px 15px;\n  max-width: 1080px;\n  margin: auto;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  -webkit-justify-content: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-align-content: center;\n  -ms-flex-line-pack: center;\n  align-content: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n\nsite-header stencil-route-link a, site-header a {\n  font-size: 14px;\n  margin: 8px 8px;\n  margin-right: 1.4em;\n  color: #86869c;\n  text-decoration: none;\n  font-weight: 500;\n  letter-spacing: -0.02em;\n  text-decoration: none;\n  transition: all .2s ease;\n}\n\nsite-header stencil-route-link a:hover, site-header stencil-route-link a.link-active, site-header a:hover {\n  color: #2b2b38 !important;\n  text-decoration: none;\n}\n\nsite-header .pull-right {\n  order: 0;\n  flex: 1 1 auto;\n  text-align: right;\n}\n\n@media screen and (max-width: 450px) {\n  site-header img {\n    padding-bottom: 20px;\n  }\n  site-header .pull-right {\n    display: block;\n    text-align: center;\n  }\n}\n\n@media screen and (max-width: 465px) {\n  site-header .button {\n    display: none;\n  }\n}\n\n@media screen and (min-width: 450px) {\n  site-header {\n    /*\n    .logo {\n      height: 27px;\n    }\n    */\n  }\n}\n\n@media screen and (max-width: 722px) {\n  site-header stencil-route-link a, site-header a {\n    font-size: 12px;\n    margin: 8px 12px;\n  }\n  site-header .pull-right {\n    justify-content: space-around;\n    display: flex;\n  }\n  site-header .site-header {\n    flex-direction: column;\n  }\n  site-header stencil-route-link {\n    margin-right: unset;\n  }\n}\nsite-header.hydrated{visibility:inherit}","site-menu","site-menu .star-button {\n  margin-bottom: -2px;\n  width: 120px;\n  margin-top: 26px;\n}\n\nsite-menu h4 {\n  font-size: 16px;\n  font-weight: bold;\n  margin-bottom: 0;\n}\n\nsite-menu #menu-list {\n  list-style-type: none;\n  margin: 0;\n  padding: 0;\n  -webkit-padding-start: 0;\n}\n\nsite-menu #menu-list ul {\n  padding: 0;\n  color: #2d2d4c;\n  font-size: 15px;\n  line-height: 2em;\n  margin: 0px 0 28px;\n}\n\nsite-menu #menu-list li {\n  list-style: none;\n  margin: 0;\n  text-indent: 0;\n  font-size: 14px;\n  font-weight: 400;\n}\n\nsite-menu a {\n  color: #484854;\n  text-decoration: none;\n}\n\nsite-menu stencil-route-link a {\n  color: #484854;\n  text-decoration: none;\n}\n\nsite-menu stencil-route-link .link-active {\n  font-weight: bold;\n  color: #69D353;\n  letter-spacing: -0.013em;\n}\n\nsite-menu stencil-route-link:hover a {\n  color: #2f2f35 !important;\n  font-weight: 500;\n  letter-spacing: -0.013em;\n}\nsite-menu.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"avocado-site",

/**** component modules ****/
function importComponent(exports, h, t, Context, publicPath) {
"use strict";
// @stencil/core

var App = /** @class */ (function () {
    function App() {
    }
    App.prototype.render = function () {
        return [
            h("div", { id: "main-div" },
                h("site-header", null),
                h("div", { class: "app" },
                    h("stencil-router", null,
                        h("stencil-route", { url: "/", component: "landing-page", exact: true }),
                        h("stencil-route", { url: "/demos", component: "demos-page" }),
                        h("stencil-route", { url: "/docs/intro/:pageName?", routeRender: function (props) {
                                var map = {
                                    undefined: 'intro/index.html',
                                    'intro': 'intro/index.html',
                                    'getting-started': 'intro/getting-started.html',
                                    'migrating-from-phonegap-cordova': 'intro/migrating-from-phonegap-cordova.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/basics/:pageName", routeRender: function (props) {
                                var map = {
                                    'creating-apps': 'basics/creating-apps.html',
                                    'configuring-your-app': 'basics/configuring-your-app.html',
                                    'app-project-structure': 'basics/app-project-structure.html',
                                    'building-your-app': 'basics/building-your-app.html',
                                    'running-your-app': 'basics/running-your-app.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/ios/:pageName", routeRender: function (props) {
                                var map = {
                                    'configuration': 'ios/configuration.html',
                                    'managing-dependencies': 'ios/managing-dependencies.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/android/:pageName", routeRender: function (props) {
                                var map = {
                                    'configuration': 'android/configuration.html',
                                    'managing-dependencies': 'android/managing-dependencies.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/plugins/:pageName", routeRender: function (props) {
                                var map = {
                                    undefined: 'plugins/index.html',
                                    'creating-plugins': 'plugins/creating-plugins.html',
                                    'plugin-api-javascript': 'plugins/plugin-api-javascript.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/resources", component: "resources-page" }),
                        h("stencil-route", { url: "/pwa", component: "pwas-page" })))),
            h("footer", null,
                h("div", { id: "open-source" },
                    h("a", { href: "http://ionicframework.com/", title: "IonicFramework.com", rel: "noopener" },
                        h("img", { src: "/assets/img/ionic-os-logo.png", alt: "Ionic Open Source Logo" })),
                    h("p", null,
                        "Released under ",
                        h("span", { id: "mit" }, "MIT License"),
                        " | Copyright @ 2017")),
                h("div", { id: "footer-icons" },
                    h("a", { class: "svg-button", id: "stencil-repo", href: "https://github.com/ionic-team/stencil", target: "_blank", rel: "noopener", title: "Open the stencil site repository on github" },
                        h("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 512 512" },
                            h("path", { d: "M256 32C132.3 32 32 135 32 261.7c0 101.5 64.2 187.5 153.2 218l3.8.3c8.3 0 11.5-6 11.5-11.4l-.3-39c-8.4 1.8-16 2.6-22.6 2.6-43 0-53-33.5-53-33.5-10-26.5-24.8-33.6-24.8-33.6-19.5-13.6 0-14 1.4-14 22.6 2 34.4 23.8 34.4 23.8 11.2 19.6 26.2 25 39.6 25 10.5 0 20-3.3 25.6-6 2-14.7 7.8-24.8 14.2-30.6-49.7-5.8-102-25.5-102-113.5 0-25 8.7-45.6 23-61.6-2.3-5.7-10-29 2.2-60.7 0 0 1.6-.5 5-.5 8 0 26.4 3 56.6 24 18-5 37-7.5 56-7.6 19 0 38.3 2.6 56.2 7.7 30.2-21 48.5-24.2 56.6-24.2 3.4 0 5 .5 5 .5 12.2 31.6 4.5 55 2.2 60.8 14.3 16.2 23 36.7 23 61.7 0 88.2-52.4 107.6-102.3 113.3 8 7 15.2 21 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3 11.5 11.4 11.5 1.2 0 2.6 0 4-.4 89-30.4 153.2-116.5 153.2-218C480 135 379.7 32 256 32z" }))),
                    h("a", { class: "svg-button", id: "stencil-twitter", href: "https://twitter.com/stenciljs", target: "_blank", rel: "noopener", title: "Open the stencil account on twitter" },
                        h("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 512 512" },
                            h("path", { d: "M492 109.5c-17.4 7.7-36 13-55.6 15.3 20-12 35.4-31 42.6-53.6-18.7 11-39.4 19.2-61.5 23.5-17.7-19-43-30.7-70.7-30.7-53.5 0-96.8 43.4-96.8 97 0 7.5.8 15 2.5 22-80.5-4-152-42.6-199.6-101.3-8.4 14.3-13.2 31-13.2 48.7C39.8 164 57 193.7 83 211c-16-.3-31-4.7-44-12v1.2c0 47 33.4 86 77.7 95-8 2.2-16.7 3.4-25.5 3.4-6.2 0-12.3-.6-18.2-1.8 12.3 38.5 48 66.5 90.5 67.3-33 26-75 41.6-120.3 41.6-7.8 0-15.5-.5-23-1.4C62.7 432 113.6 448 168 448 346.7 448 444 300.3 444 172.2c0-4.2 0-8.4-.3-12.5 19-13.7 35.3-30.7 48.3-50.2z" }))),
                    h("a", { class: "svg-button", id: "ionic-forum", href: "https://join.slack.com/t/stencil-worldwide/shared_invite/enQtMjYwNjg5NDMzODQwLTdiNWZiNDMyMWRjZTBiMjIzMGFlOTZiZWVkNDVjNzc2ZTI5MzI2Y2VjZDgwYjczMjU3NWIxMDYzMzI2ZjY3NjM", target: "_blank", rel: "noopener", title: "Join the stencil worldwide slack" },
                        h("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 512 512" },
                            h("path", { d: "M213.6 236.2l64-21.4 20.7 61.8-64 21.4z" }),
                            h("path", { d: "M213.6 236.2l64-21.4 20.7 61.8-64 21.4z" }),
                            h("path", { d: "M476 190C426.3 25 355-13.4 190 36S-13.4 157 36 322s121 203.4 286 154 203.4-121 154-286zm-83.4 107l-31 10.5 10.6 32.2c4.2 13-2.7 27.2-15.7 31.5-2.7.8-5.8 1.5-8.4 1.2-10-.4-19.5-7-23-17l-10.6-32-64 21.4L261 377c4.2 13-2.7 27.2-15.7 31.5-2.7.8-5.8 1.5-8.4 1.2-10-.4-19.7-7-23-17l-11-32.3-31 10.3c-2.7.8-5.8 1.5-8.4 1.2-10-.5-19.6-7-23-17-4.2-13 2.7-27.2 15.7-31.5l31-10.4-20.6-61.7-31 10.4c-2.8.8-6 1.5-8.5 1.2-10-.5-19.6-7-23-17-4.2-13 2.7-27.2 15.7-31.5l31-10.4-11-32c-4-13 2.8-27.2 15.8-31.5 13-4.2 27.2 2.7 31.5 15.7l10.7 32.2 64-21.5-10.6-32.3c-4.2-13 2.7-27.2 15.7-31.5 13-4.2 27.3 2.7 31.6 15.7l10.7 32 31-10.3c13-4.2 27.3 2.7 31.6 15.7 4 13-2.8 27.2-15.8 31.5l-31 10.3 20.6 61.8 31-10.3c13-4.2 27.3 2.7 31.6 15.7 4.2 13.2-2.7 27.4-15.8 31.7z" })))))
        ];
    };
    return App;
}());

var LandingPage = /** @class */ (function () {
    function LandingPage() {
        document.title = "Avocado: Universal Web Applications";
    }
    LandingPage.prototype.render = function () {
        return (h("div", null,
            h("main", null,
                h("h1", { id: "action-call" },
                    "Universal Runtime",
                    h("br", null),
                    " for Web Applications"),
                h("section", { id: "buttons" },
                    h("stencil-route-link", { url: "/docs/getting-started" },
                        h("button", { id: "get-started" }, "Get Started")),
                    h("stencil-route-link", { url: "/docs/intro" },
                        h("button", { id: "learn-more" }, "Learn More")))),
            h("section", { id: "three-points" },
                h("div", { class: "point-card" },
                    h("h2", null, "Cross-platform"),
                    h("p", null, "Build web apps that run equally well on iOS, Android, Electron, and as Progressive Web Apps")),
                h("div", { class: "point-card performant" },
                    h("h2", null, "Native"),
                    h("p", null, "Access the full native capabilities of your device for powerful, best-of-breed apps")),
                h("div", { class: "point-card future-proof" },
                    h("h2", null, "Future proof"),
                    h("p", null, "Built on web standards that stand the test of time. Focus on the web, deploy anywhere.")))));
    };
    return LandingPage;
}());

var LazyIframe = /** @class */ (function () {
    function LazyIframe() {
    }
    LazyIframe.prototype.componentDidLoad = function () {
        var _this = this;
        if ('IntersectionObserver' in window) {
            this.io = new IntersectionObserver(function (data) {
                if (data[0].isIntersecting) {
                    _this.handleIframe();
                    _this.cleanup();
                }
            });
            this.io.observe(this.el.querySelector('iframe'));
        }
        else {
            this.handleIframe();
        }
    };
    LazyIframe.prototype.componentDidUnload = function () {
        this.cleanup();
    };
    LazyIframe.prototype.handleIframe = function () {
        this.realSrc = this.src;
    };
    LazyIframe.prototype.cleanup = function () {
        // always make sure we remove the intersection
        // observer when its served its purpose so we dont
        // eat cpu cycles unnecessarily
        if (this.io) {
            this.io.disconnect();
            this.io = null;
        }
    };
    LazyIframe.prototype.render = function () {
        return (h("div", null,
            h("iframe", { frameBorder: "0", title: this.title, allowFullScreen: true, width: "700", height: "450", src: this.realSrc })));
    };
    return LazyIframe;
}());

var SiteHeader = /** @class */ (function () {
    function SiteHeader() {
    }
    SiteHeader.prototype.render = function () {
        return (h("div", { class: "site-header" },
            h("stencil-route-link", { url: "/", class: "logo-link" },
                h("img", { class: "logo", alt: "Stencil", src: "/assets/img/avocado-logo.png" })),
            h("div", { class: "pull-right" },
                h("stencil-route-link", { urlMatch: "/docs", url: "/docs/intro/" }, "Docs"),
                h("a", { href: "https://github.com/ionic-team/avocado" }, "GitHub"))));
    };
    return SiteHeader;
}());

var SiteMenu = /** @class */ (function () {
    function SiteMenu() {
        this.MENU = [
            {
                title: 'Essentials',
                items: [
                    {
                        title: 'Introduction',
                        url: '/docs/intro'
                    },
                    {
                        title: 'Getting Started',
                        url: '/docs/intro/getting-started'
                    },
                    {
                        title: 'Migrating from PhoneGap/Cordova',
                        url: '/docs/intro/migrating-from-phonegap-cordova'
                    }
                ]
            },
            {
                title: 'Basics',
                items: [
                    {
                        title: 'Creating Apps',
                        url: '/docs/basics/creating-apps'
                    },
                    {
                        title: 'Project Structure',
                        url: '/docs/basics/app-project-structure'
                    },
                    {
                        title: 'App Configuration',
                        url: '/docs/basics/configuring-your-app'
                    },
                    {
                        title: 'Building your App',
                        url: '/docs/basics/building-your-app'
                    },
                    {
                        title: 'Running your App',
                        url: '/docs/basics/running-your-app'
                    }
                ]
            },
            {
                title: 'iOS',
                items: [
                    {
                        title: 'Configuration',
                        url: '/docs/ios/configuration'
                    },
                    {
                        title: 'Managing Dependencies',
                        url: '/docs/ios/managing-dependencies'
                    }
                ]
            },
            {
                title: 'Android',
                items: [
                    {
                        title: 'Configuration',
                        url: '/docs/android/configuration'
                    },
                    {
                        title: 'Managing Dependencies',
                        url: '/docs/android/managing-dependencies'
                    }
                ]
            },
            {
                title: 'Plugins',
                items: [
                    {
                        title: 'Introduction',
                        url: '/docs/plugins/'
                    },
                    {
                        title: 'Installing Plugins',
                        url: '/docs/plugins/installng-plugins/'
                    },
                    {
                        title: 'Creating Plugins',
                        url: '/docs/plugins/creating-plugins/'
                    },
                    {
                        title: 'Plugin JavaScript API',
                        url: '/docs/plugins/plugin-api-javascript'
                    }
                ]
            },
            {
                title: 'APIs',
                items: [
                    { title: 'Device', url: '/docs/apis/device' },
                    { title: 'Console', url: '/docs/apis/console' },
                    { title: 'Contacts', url: '/docs/apis/contacts' },
                    { title: 'Camera', url: '/docs/apis/camera' },
                    { title: 'Offline', url: '/docs/apis/offline' },
                    { title: 'File', url: '/docs/apis/file' }
                ]
            }
        ];
    }
    SiteMenu.prototype.render = function () {
        return (h("div", null,
            h("iframe", { class: "star-button", src: "https://ghbtns.com/github-btn.html?user=ionic-team&repo=stencil&type=star&count=true", frameBorder: "0", scrolling: "0", width: "170px", height: "20px" }),
            h("ul", { id: "menu-list" }, this.MENU.map(function (s) {
                return (h("li", null,
                    h("h4", null, s.title),
                    h("ul", null, s.items.map(function (i) {
                        return (h("li", null,
                            h("stencil-route-link", { url: i.url }, i.title)));
                    }))));
            }))));
    };
    return SiteMenu;
}());

exports['avocado-site'] = App;
exports['landing-page'] = LandingPage;
exports['lazy-iframe'] = LazyIframe;
exports['site-header'] = SiteHeader;
exports['site-menu'] = SiteMenu;
},


/***************** avocado-site *****************/
[
/** avocado-site: tag **/
"avocado-site",

/** avocado-site: members **/
0 /* no members */,

/** avocado-site: host **/
{}

],

/***************** landing-page *****************/
[
/** landing-page: tag **/
"landing-page",

/** landing-page: members **/
[
  [ "el", /** element ref **/ 7, /** do not observe attribute **/ 0, /** type any **/ 1 ]
],

/** landing-page: host **/
{}

],

/***************** lazy-iframe *****************/
[
/** lazy-iframe: tag **/
"lazy-iframe",

/** lazy-iframe: members **/
[
  [ "el", /** element ref **/ 7, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "realSrc", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "src", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "title", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ]
],

/** lazy-iframe: host **/
{}

],

/***************** site-header *****************/
[
/** site-header: tag **/
"site-header",

/** site-header: members **/
0 /* no members */,

/** site-header: host **/
{}

],

/***************** site-menu *****************/
[
/** site-menu: tag **/
"site-menu",

/** site-menu: members **/
0 /* no members */,

/** site-menu: host **/
{}

]
);