/*! Built with http://stenciljs.com */

App.loadStyles("avocado-site","* {\n  box-sizing: border-box;\n}\n\navocado-site {\n  height: 100%;\n  display: flex;\n  flex-flow: column;\n}\n\n.row {\n  display: flex;\n}\n\n.col {\n  flex: 1;\n}\n\n.container {\n  max-width: 1080px;\n  margin: auto;\n}\n\n.input-with-button {\n  display: flex;\n  height: 50px;\n}\n\n.input-with-button input {\n  flex: 1;\n  height: 100%;\n}\n\n.input-with-button button {\n  flex-grow: 0;\n  flex-shrink: 1;\n  margin: 0;\n  border: 0;\n  border-radius: 0px 3px 3px 0;\n  height: 100%;\n}\n\n.input-with-button button:hover {\n  transform: none;\n}\n\n.app {\n  height: 100%;\n  max-width: 1080px;\n  margin: auto;\n}\n\n.landing-page #main-div {\n  background-color: #030A04;\n  color: #fff;\n}\n\n#main-div {\n  flex-grow: 1;\n  flex-shrink: 0;\n}\n\n#main-div site-header stencil-route-link a {\n  color: #fff;\n}\n\n::selection {\n  background: #e7e7f2;\n}\n\n::-moz-selection {\n  background: #e7e7f2;\n}\n\nhtml, body {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n  width: 100%;\n  height: 100%;\n  padding: 0;\n  margin: 0;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n}\n\nh1, h2, h3, h4 {\n  color: #16161d;\n  letter-spacing: -1px;\n  font-family: 'Roboto Mono',  -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n}\n\nh1 {\n  font-size: 28px;\n  font-weight: bold;\n}\n\nh2 {\n  font-size: 20px;\n  font-weight: bold;\n}\n\nh2, h3 {\n  margin-top: 48px;\n  margin-bottom: 8px;\n}\n\np, ul {\n  color: #2d2d4c;\n  font-size: 15px;\n  line-height: 2em;\n  margin: 24px 0px;\n}\n\nstencil-route-link:hover {\n  cursor: pointer;\n}\n\n.wrapper {\n  line-height: 32px;\n  min-height: 100%;\n  padding-top: 60px;\n  margin: 15px;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-content: stretch;\n  align-items: flex-start;\n}\n\npre {\n  word-break: break-all;\n  word-wrap: break-word;\n  display: block;\n  white-space: pre-wrap;\n  margin: 24px 0px 28px;\n  padding: 16px 24px;\n  border-radius: 4px;\n  color: #abb2bf;\n  background-color: #404040;\n}\n\npre code {\n  font-weight: 500;\n  display: block;\n  overflow-x: auto;\n  word-wrap: normal;\n  white-space: pre;\n  box-sizing: border-box;\n  font-size: 14px;\n  line-height: 20px;\n}\n\ncode {\n  font-weight: 400;\n  font-family: \"Source Code Pro\", monospace;\n  font-size: 14px;\n}\n\n.nextButton {\n  background: #5851ff;\n  color: white;\n  text-decoration: none;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n  float: right;\n  margin-right: 5px;\n}\n\n.nextButton:hover {\n  text-decoration: none;\n  transform: translateY(1px);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.16);\n}\n\n.backButton {\n  color: #5851ff;\n  background: white;\n  text-decoration: none;\n  float: left;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n  margin-bottom: 15px;\n  margin-left: 5px;\n}\n\n.backButton:hover {\n  text-decoration: none;\n  transform: translateY(1px);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.16);\n}\n\n.hljs-comment, .hljs-quote {\n  color: #5c6370;\n  font-style: italic;\n}\n\n.hljs-doctag, .hljs-keyword, .hljs-formula {\n  color: #c678dd;\n}\n\n.hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst {\n  color: #e06c75;\n}\n\n.hljs-literal {\n  color: #56b6c2;\n}\n\n.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta-string {\n  color: #98c379;\n}\n\n.hljs-built_in, .hljs-class .hljs-title {\n  color: #e6c07b;\n}\n\n.hljs-attr,\n.hljs-variable,\n.hljs-template-variable,\n.hljs-type,\n.hljs-selector-class,\n.hljs-selector-attr,\n.hljs-selector-pseudo,\n.hljs-number {\n  color: #d19a66;\n}\n\n.hljs-symbol,\n.hljs-bullet,\n.hljs-link,\n.hljs-meta,\n.hljs-selector-id,\n.hljs-title {\n  color: #61aeee;\n}\n\n.hljs-emphasis {\n  font-style: italic;\n}\n\n.hljs-strong {\n  font-weight: bold;\n}\n\n.hljs-link {\n  text-decoration: underline;\n}\n\n.landing-page footer .ionic-oss-logo {\n  background-image: url(assets/img/ionic-os-logo.png);\n}\n\nfooter {\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  background: #f8f8fc;\n  height: 8em;\n  display: flex;\n  margin-top: 32px;\n  flex: 0 0 8em;\n}\n\nfooter .ionic-oss-logo {\n  background: url(assets/img/ionic-os-dark-logo.png) no-repeat transparent;\n  width: 124px;\n  height: 16px;\n  background-size: 100%;\n}\n\nfooter .container {\n  display: flex;\n  flex: 1;\n  justify-content: space-between;\n  align-items: center;\n}\n\nfooter .svg-button {\n  margin-left: 16px;\n  transition: all .15s ease;\n}\n\nfooter .svg-button:hover {\n  opacity: 0.5;\n}\n\n#open-source img {\n  width: 50%;\n}\n\n#open-source p {\n  margin-top: 0;\n  margin-bottom: 0;\n  color: #a5a4b8;\n  font-size: 10px;\n}\n\n\@media screen and (max-width: 355px) {\n  .wrapper {\n    padding-top: 100px;\n  }\n}\n\n\@media screen and (max-width: 450px) {\n  .wrapper {\n    padding-top: 80px;\n  }\n  site-header a {\n    display: none;\n  }\n  site-header stencil-route-link a {\n    display: initial;\n  }\n}\n\n\@media screen and (max-width: 590px) {\n  .wrapper {\n    margin-right: 0;\n    margin-left: 0;\n    -webkit-justify-content: space-between;\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n    -webkit-flex-direction: column-reverse;\n    -ms-flex-direction: column-reverse;\n    flex-direction: column-reverse;\n  }\n  .wrapper .pull-right {\n    padding: 0 15px;\n    width: 100%;\n    min-height: 100vh;\n  }\n  .wrapper .pull-left {\n    position: relative;\n    padding: 15px;\n    width: 100%;\n    bottom: 0;\n    background-color: #16161d;\n  }\n  .wrapper .pull-left * {\n    color: #ffffff;\n  }\n}\n\n\@media screen and (min-width: 590px) {\n  .wrapper .pull-left {\n    min-width: 250px;\n    max-width: 250px;\n    position: -webkit-sticky;\n    position: sticky;\n    top: 50px;\n  }\n  .wrapper .pull-right {\n    padding-left: 96px;\n    padding-right: 32px;\n    flex: 1 1 auto;\n    overflow: auto;\n    min-height: 100vh;\n  }\n}\navocado-site.hydrated{visibility:inherit}","landing-page",".landing-page landing-page h1, .landing-page landing-page h2 {\n  color: #fff;\n}\n\n.landing-page landing-page p {\n  color: #BCC0BE;\n}\n\n.footer-landing {\n  background: #1D2322;\n  margin-top: 0;\n}\n\nlanding-page main {\n  display: flex;\n  flex-direction: column;\n  margin-top: 3em;\n}\n\nlanding-page #logo {\n  width: 4em;\n  height: 4em;\n}\n\nlanding-page #landing-cta-offset {\n  flex: 0;\n  min-width: 50px;\n}\n\nlanding-page #action-call {\n  font-size: 2.1em;\n  line-height: normal;\n  margin-top: 1em;\n  font-weight: 600;\n  margin-bottom: 0.9em;\n}\n\nlanding-page #action-more {\n  margin: 0.2em 0 1em;\n  color: #D0D5D3;\n  font-weight: 400;\n}\n\nlanding-page #action-more b {\n  color: #fff;\n}\n\nlanding-page #landing-cta-image {\n  background: url(assets/img/right-img.png) no-repeat transparent;\n  background-size: contain;\n  height: 400px;\n  background-position-x: 100%;\n}\n\nlanding-page #cta-form {\n  margin-top: 3em;\n}\n\nlanding-page #cta-form input {\n  font-size: 14px;\n  padding: 5px 10px;\n  width: 200px;\n  color: #747A79;\n  background-color: #232926;\n  border: none;\n  border-radius: 3px;\n}\n\nlanding-page #cta-form button {\n  background-color: #2ACB39;\n  text-transform: uppercase;\n  color: white;\n}\n\nlanding-page button {\n  margin: 8px;\n  border: none;\n  font-size: 13px;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 16px 20px;\n  border-radius: 2px;\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  outline: none;\n  letter-spacing: 0.04em;\n  transition: all .15s ease;\n  cursor: pointer;\n}\n\nlanding-page button:first-child {\n  margin-left: 0;\n}\n\nlanding-page button:hover {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);\n  transform: translateY(1px);\n}\n\nlanding-page #get-started {\n  background: #7fd02e;\n  color: white;\n}\n\nlanding-page #learn-more {\n  background: #222823;\n  color: #72D477;\n}\n\nlanding-page #youtube-video {\n  opacity: 0;\n  transition: opacity 0.3s, transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);\n  position: absolute;\n  z-index: 9999;\n  pointer-events: none;\n  display: flex;\n  justify-content: center;\n  left: 0;\n  width: 100%;\n}\n\nlanding-page #youtube-video iframe {\n  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15), 0px 20px 40px rgba(0, 0, 0, 0.2);\n  border-radius: 8px;\n}\n\nlanding-page .youtube-show {\n  opacity: 1 !important;\n  transform: translatey(-30px) !important;\n  pointer-events: auto !important;\n}\n\nlanding-page #background {\n  height: 100%;\n  position: fixed;\n  width: 100%;\n  z-index: 8888;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  opacity: 0;\n  pointer-events: none;\n  background-color: #00082d;\n  transition: opacity 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);\n}\n\nlanding-page .background-show {\n  opacity: 0.4 !important;\n  pointer-events: auto !important;\n}\n\nlanding-page #three-points {\n  display: flex;\n  justify-content: space-around;\n  margin-top: 3.2em;\n  margin-bottom: 2.8em;\n}\n\nlanding-page .point-card {\n  flex: 1;\n  position: relative;\n  padding: 0px 2em;\n}\n\nlanding-page .point-card a {\n  color: #fff;\n  text-decoration: none;\n}\n\nlanding-page .point-card:first-child {\n  padding-left: 0;\n}\n\nlanding-page .point-card:last-child {\n  padding-right: 0;\n}\n\nlanding-page .point-card h2 {\n  margin-top: 1em;\n  font-size: 16px;\n}\n\nlanding-page .point-card p {\n  margin-top: 0.2em;\n  font-weight: 400;\n  font-size: 14px;\n  letter-spacing: -0.02em;\n  line-height: 30px;\n}\n\nlanding-page .point-card:before {\n  content: '';\n  display: block;\n  background: url(assets/img/checkbox.png) no-repeat transparent;\n  width: 20px;\n  height: 20px;\n  background-size: 100%;\n  margin-bottom: 0.3em;\n}\n\nlanding-page #launch-video, landing-page #mobile-video {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 4;\n  transition: all .2s ease;\n  cursor: pointer;\n  text-decoration: none;\n  outline: none;\n}\n\nlanding-page #launch-video:hover, landing-page #mobile-video:hover {\n  opacity: 0.7;\n}\n\nlanding-page #launch-video img, landing-page #mobile-video img {\n  height: 1.2em;\n}\n\nlanding-page #launch-video span, landing-page #mobile-video span {\n  font-size: 14px;\n  margin-left: 8px;\n  color: #5851ff;\n  font-weight: 500;\n  transition: all .15s ease;\n}\n\nlanding-page #mobile-video {\n  display: none;\n}\n\n\@media screen and (max-width: 740px) {\n  landing-page #action-call {\n    width: auto;\n  }\n  landing-page main {\n    max-width: 90%;\n    margin: auto;\n  }\n  landing-page #landing-cta-image {\n    display: none;\n  }\n  landing-page #launch-video {\n    display: none;\n  }\n  landing-page #youtube-video {\n    display: none;\n  }\n  landing-page #mobile-video {\n    display: flex;\n  }\n  landing-page #three-points {\n    flex-direction: column;\n    text-align: left;\n    display: block;\n    max-width: 90%;\n    margin: auto;\n  }\n  landing-page #three-points .point-card {\n    margin: 1em 2.4em;\n  }\n  landing-page #three-points .point-card::before {\n    left: 0;\n  }\n  landing-page #three-points .point-card {\n    margin-left: 0;\n    margin-right: 0;\n    padding: 0;\n  }\n}\n\n\@media screen and (max-width: 500px) {\n  landing-page main {\n    max-width: 90%;\n    margin: auto;\n  }\n  landing-page #landing-cta-image {\n    display: none;\n  }\n  landing-page #three-points {\n    display: block;\n    max-width: 90%;\n    margin: auto;\n  }\n  landing-page #three-points .point-card {\n    margin-left: 0;\n    margin-right: 0;\n    padding: 0;\n  }\n  landing-page #cta-form button {\n    padding: 10px 14px;\n  }\n}\nlanding-page.hydrated{visibility:inherit}","lazy-iframe","lazy-iframe iframe {\n  /*width: 100%;\n    height: 100%;*/\n}\nlazy-iframe.hydrated{visibility:inherit}","site-header",".landing-page .logo {\n  background-image: url(assets/img/avocado-logo.png);\n}\n\n.landing-page site-header {\n  position: static;\n}\n\nsite-header {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  background-color: rgba(255, 255, 255, 0.8);\n  -webkit-backdrop-filter: saturate(180%) blur(20px);\n  backdrop-filter: saturate(180%) blur(20px);\n  z-index: 99;\n}\n\nsite-header .logo {\n  background: url(assets/img/avocado-dark-logo.png);\n  width: 128px;\n  height: 38px;\n  background-size: 100%;\n}\n\nsite-header .logo-link a {\n  margin: 0;\n}\n\nsite-header .site-header {\n  padding: 20px 15px;\n  max-width: 1080px;\n  margin: auto;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  -webkit-justify-content: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-align-content: center;\n  -ms-flex-line-pack: center;\n  align-content: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n\nsite-header stencil-route-link a, site-header a {\n  font-size: 14px;\n  margin: 8px 8px;\n  margin-right: 1.4em;\n  color: #86869c;\n  text-decoration: none;\n  font-weight: 500;\n  letter-spacing: -0.02em;\n  text-decoration: none;\n  transition: all .2s ease;\n}\n\nsite-header stencil-route-link a:hover, site-header stencil-route-link a.link-active, site-header a:hover {\n  color: #2b2b38 !important;\n  text-decoration: none;\n}\n\nsite-header .pull-right {\n  order: 0;\n  flex: 1 1 auto;\n  text-align: right;\n}\n\n\@media screen and (max-width: 450px) {\n  site-header img {\n    padding-bottom: 20px;\n  }\n  site-header .pull-right {\n    display: block;\n    text-align: center;\n  }\n}\n\n\@media screen and (max-width: 465px) {\n  site-header .button {\n    display: none;\n  }\n}\n\n\@media screen and (min-width: 450px) {\n  site-header {\n    /*\n    .logo {\n      height: 27px;\n    }\n    */\n  }\n}\n\n\@media screen and (max-width: 722px) {\n  site-header stencil-route-link a, site-header a {\n    font-size: 12px;\n    margin: 8px 12px;\n  }\n  site-header .pull-right {\n    justify-content: space-around;\n    display: flex;\n  }\n  site-header .site-header {\n    flex-direction: column;\n  }\n  site-header stencil-route-link {\n    margin-right: unset;\n  }\n}\nsite-header.hydrated{visibility:inherit}","site-menu","site-menu .star-button {\n  margin-bottom: -2px;\n  width: 120px;\n  margin-top: 26px;\n}\n\nsite-menu h4 {\n  font-size: 16px;\n  font-weight: bold;\n  margin-bottom: 0;\n}\n\nsite-menu #menu-list {\n  list-style-type: none;\n  margin: 0;\n  padding: 0;\n  -webkit-padding-start: 0;\n}\n\nsite-menu #menu-list ul {\n  padding: 0;\n  color: #2d2d4c;\n  font-size: 15px;\n  line-height: 2em;\n  margin: 0px 0 28px;\n}\n\nsite-menu #menu-list li {\n  list-style: none;\n  margin: 0;\n  text-indent: 0;\n  font-size: 14px;\n  font-weight: 400;\n}\n\nsite-menu a {\n  color: #484854;\n  text-decoration: none;\n}\n\nsite-menu stencil-route-link a {\n  color: #484854;\n  text-decoration: none;\n}\n\nsite-menu stencil-route-link .link-active {\n  font-weight: bold;\n  color: #69D353;\n  letter-spacing: -0.013em;\n}\n\nsite-menu stencil-route-link:hover a {\n  color: #2f2f35 !important;\n  font-weight: 500;\n  letter-spacing: -0.013em;\n}\nsite-menu.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"avocado-site",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
class App {
    constructor() {
        this.isLandingPage = false;
    }
    hostData() {
        return {
            class: {
                'landing-page': this.isLandingPage
            }
        };
    }
    render() {
        const footerClass = this.isLandingPage ? 'footer-landing' : '';
        return [
            h("div", { id: "main-div" },
                h("site-header", null),
                h("div", { class: "app" },
                    h("stencil-router", { root: "/avocado/" },
                        h("stencil-route", { url: "/", component: "landing-page", exact: true }),
                        h("stencil-route", { url: "/blog", component: "blog-page" }),
                        h("stencil-route", { url: "/demos", component: "demos-page" }),
                        h("stencil-route", { url: "/docs/intro/:pageName?", routeRender: (props) => {
                                const map = {
                                    undefined: 'intro/index.html',
                                    'intro': 'intro/index.html',
                                    'getting-started': 'intro/getting-started.html',
                                    'migrating-from-phonegap-cordova': 'intro/migrating-from-phonegap-cordova.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/basics/:pageName", routeRender: (props) => {
                                const map = {
                                    'creating-apps': 'basics/creating-apps.html',
                                    'configuring-your-app': 'basics/configuring-your-app.html',
                                    'app-project-structure': 'basics/app-project-structure.html',
                                    'building-your-app': 'basics/building-your-app.html',
                                    'running-your-app': 'basics/running-your-app.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/ios/:pageName", routeRender: (props) => {
                                const map = {
                                    'configuration': 'ios/configuration.html',
                                    'managing-dependencies': 'ios/managing-dependencies.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/android/:pageName", routeRender: (props) => {
                                const map = {
                                    'configuration': 'android/configuration.html',
                                    'managing-dependencies': 'android/managing-dependencies.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/plugins/:pageName", routeRender: (props) => {
                                const map = {
                                    undefined: 'plugins/index.html',
                                    'creating-plugins': 'plugins/creating-plugins.html',
                                    'plugin-api-javascript': 'plugins/plugin-api-javascript.html'
                                };
                                return (h("document-component", { pages: [map[props.match.params.pageName]] }));
                            } }),
                        h("stencil-route", { url: "/docs/apis/:pageName", routeRender: (props) => {
                                let page = 'apis/index.html';
                                const pageName = props.match.params.pageName;
                                if (pageName) {
                                    page = `apis/${pageName}/index.html`;
                                }
                                return (h("document-component", { pages: [page] }));
                            } }),
                        h("stencil-route", { url: "/resources", component: "resources-page" }),
                        h("stencil-route", { url: "/pwa", component: "pwas-page" })))),
            h("footer", { class: footerClass },
                h("div", { class: "container" },
                    h("div", { id: "open-source" },
                        h("a", { href: "http://ionicframework.com/", title: "IonicFramework.com", rel: "noopener" },
                            h("div", { class: "ionic-oss-logo" })),
                        h("p", null,
                            "Released under ",
                            h("span", { id: "mit" }, "MIT License"),
                            " | Copyright @ 2017")),
                    h("div", { id: "footer-icons" },
                        h("a", { class: "svg-button", id: "stencil-twitter", href: "https://twitter.com/avocadojs", target: "_blank", rel: "noopener", title: "Open the Avocado account on twitter" },
                            h("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 512 512" },
                                h("path", { d: "M492 109.5c-17.4 7.7-36 13-55.6 15.3 20-12 35.4-31 42.6-53.6-18.7 11-39.4 19.2-61.5 23.5-17.7-19-43-30.7-70.7-30.7-53.5 0-96.8 43.4-96.8 97 0 7.5.8 15 2.5 22-80.5-4-152-42.6-199.6-101.3-8.4 14.3-13.2 31-13.2 48.7C39.8 164 57 193.7 83 211c-16-.3-31-4.7-44-12v1.2c0 47 33.4 86 77.7 95-8 2.2-16.7 3.4-25.5 3.4-6.2 0-12.3-.6-18.2-1.8 12.3 38.5 48 66.5 90.5 67.3-33 26-75 41.6-120.3 41.6-7.8 0-15.5-.5-23-1.4C62.7 432 113.6 448 168 448 346.7 448 444 300.3 444 172.2c0-4.2 0-8.4-.3-12.5 19-13.7 35.3-30.7 48.3-50.2z" }))),
                        h("a", { class: "svg-button", id: "ionic-forum", href: "https://avocadojs.herokuapp.com/", target: "_blank", rel: "noopener", title: "Join the Avocado slack" },
                            h("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 512 512" },
                                h("path", { d: "M213.6 236.2l64-21.4 20.7 61.8-64 21.4z" }),
                                h("path", { d: "M213.6 236.2l64-21.4 20.7 61.8-64 21.4z" }),
                                h("path", { d: "M476 190C426.3 25 355-13.4 190 36S-13.4 157 36 322s121 203.4 286 154 203.4-121 154-286zm-83.4 107l-31 10.5 10.6 32.2c4.2 13-2.7 27.2-15.7 31.5-2.7.8-5.8 1.5-8.4 1.2-10-.4-19.5-7-23-17l-10.6-32-64 21.4L261 377c4.2 13-2.7 27.2-15.7 31.5-2.7.8-5.8 1.5-8.4 1.2-10-.4-19.7-7-23-17l-11-32.3-31 10.3c-2.7.8-5.8 1.5-8.4 1.2-10-.5-19.6-7-23-17-4.2-13 2.7-27.2 15.7-31.5l31-10.4-20.6-61.7-31 10.4c-2.8.8-6 1.5-8.5 1.2-10-.5-19.6-7-23-17-4.2-13 2.7-27.2 15.7-31.5l31-10.4-11-32c-4-13 2.8-27.2 15.8-31.5 13-4.2 27.2 2.7 31.5 15.7l10.7 32.2 64-21.5-10.6-32.3c-4.2-13 2.7-27.2 15.7-31.5 13-4.2 27.3 2.7 31.6 15.7l10.7 32 31-10.3c13-4.2 27.3 2.7 31.6 15.7 4 13-2.8 27.2-15.8 31.5l-31 10.3 20.6 61.8 31-10.3c13-4.2 27.3 2.7 31.6 15.7 4.2 13.2-2.7 27.4-15.8 31.7z" }))))))
        ];
    }
}

class LandingPage {
    constructor() {
        let root = document.querySelector('avocado-site');
        root.isLandingPage = true;
        document.title = `Avocado: Universal Web Applications`;
    }
    componentDidUnload() {
        let root = document.querySelector('avocado-site');
        root.isLandingPage = false;
    }
    render() {
        return (h("div", null,
            h("main", null,
                h("div", { class: "row" },
                    h("div", { class: "col" },
                        h("h1", { id: "action-call" }, "Native bridge for building powerful mobile web apps"),
                        h("div", { id: "action-more" },
                            "Native Progressive Web Apps with HTML, CSS, and JavaScript",
                            h("br", null),
                            h("br", null),
                            h("b", null, "Coming early 2018. Sign up below for updates")),
                        h("section", { id: "buttons" },
                            h("form", { id: "cta-form", action: "https://codiqa.createsend.com/t/t/s/flhuhj/", method: "post" },
                                h("div", { class: "input-with-button" },
                                    h("input", { type: "email", placeholder: "Email address", id: "fieldEmail", name: "cm-flhuhj-flhuhj", required: true }),
                                    h("button", { type: "submit" }, "Notify me"))))),
                    h("div", { class: "col", id: "landing-cta-offset" }),
                    h("div", { class: "col", id: "landing-cta-image" }))),
            h("section", { id: "three-points" },
                h("div", { class: "point-card" },
                    h("h2", null, "Cross Platform"),
                    h("p", null, "Build web apps that run equally well on iOS, Android, Electron, and as Progressive Web Apps")),
                h("div", { class: "point-card" },
                    h("h2", null, "Native Access"),
                    h("p", null, "Access the full Native SDK on each platform, and easily deploy to App Stores (and the web!)")),
                h("div", { class: "point-card" },
                    h("h2", null, "Open Source"),
                    h("p", null,
                        "Avocado is completely open source (MIT) and maintained by ",
                        h("a", { href: "http://ionicframework.com/" }, "Ionic"),
                        " and its community.")))));
    }
}

class LazyIframe {
    componentDidLoad() {
        if ('IntersectionObserver' in window) {
            this.io = new IntersectionObserver((data) => {
                if (data[0].isIntersecting) {
                    this.handleIframe();
                    this.cleanup();
                }
            });
            this.io.observe(this.el.querySelector('iframe'));
        }
        else {
            this.handleIframe();
        }
    }
    componentDidUnload() {
        this.cleanup();
    }
    handleIframe() {
        this.realSrc = this.src;
    }
    cleanup() {
        // always make sure we remove the intersection
        // observer when its served its purpose so we dont
        // eat cpu cycles unnecessarily
        if (this.io) {
            this.io.disconnect();
            this.io = null;
        }
    }
    render() {
        return (h("div", null,
            h("iframe", { frameBorder: "0", title: this.title, allowFullScreen: true, width: "700", height: "450", src: this.realSrc })));
    }
}

class SiteHeader {
    render() {
        return (h("div", { class: "site-header" },
            h("stencil-route-link", { url: "/", class: "logo-link" },
                h("div", { class: "logo" })),
            h("div", { class: "pull-right" },
                h("stencil-route-link", { urlMatch: "/docs", url: "/docs/intro/" }, "Docs"))));
    }
}

class SiteMenu {
    constructor() {
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
                    { title: 'Accessibility', url: '/docs/apis/accessibility' },
                    { title: 'App State', url: '/docs/apis/app-state' },
                    { title: 'Camera', url: '/docs/apis/camera' },
                    { title: 'Clipboard', url: '/docs/apis/clipboard' },
                    { title: 'Console', url: '/docs/apis/console' },
                    { title: 'Device', url: '/docs/apis/device' },
                    { title: 'Filesystem', url: '/docs/apis/filesystem' },
                    { title: 'Geolocation', url: '/docs/apis/geolocation' },
                    { title: 'Haptics', url: '/docs/apis/haptics' },
                    { title: 'Keyboard', url: '/docs/apis/keyboard' },
                    { title: 'Local Notifications', url: '/docs/apis/local-notifications' },
                    { title: 'Modals', url: '/docs/apis/modals' },
                    { title: 'Motion', url: '/docs/apis/motion' },
                    { title: 'Network', url: '/docs/apis/network' },
                    { title: 'Photos', url: '/docs/apis/photos' },
                    { title: 'Push Notifications', url: '/docs/apis/push-notifications' },
                    { title: 'Share', url: '/docs/apis/share' },
                    { title: 'Splash Screen', url: '/docs/apis/splash-screen' },
                    { title: 'Status Bar', url: '/docs/apis/status-bar' },
                    { title: 'Storage', url: '/docs/apis/storage' },
                    { title: 'Toast', url: '/docs/apis/toast' },
                ]
            }
        ];
    }
    render() {
        return (h("div", null,
            h("iframe", { class: "star-button", src: "https://ghbtns.com/github-btn.html?user=ionic-team&repo=avocado&type=star&count=true", frameBorder: "0", scrolling: "0", width: "170px", height: "20px" }),
            h("ul", { id: "menu-list" }, this.MENU.map(s => {
                return (h("li", null,
                    h("h4", null, s.title),
                    h("ul", null, s.items.map(i => {
                        return (h("li", null,
                            h("stencil-route-link", { url: i.url }, i.title)));
                    }))));
            }))));
    }
}

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
[
  [ "isLandingPage", /** prop **/ 1, /** observe attribute **/ 1, /** type boolean **/ 3 ]
],

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