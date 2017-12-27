/*! Built with http://stenciljs.com (es5) */

App.loadStyles("app-marked","\napp-marked.hydrated{visibility:inherit}","document-component","document-component ul{-webkit-padding-start:0}document-component ul code,document-component ul li{font-size:16px;margin-left:18px}document-component p a{color:#69d353;text-decoration:none}document-component p code{font-weight:600;font-family:\"Source Code Pro\",monospace;font-size:14px;letter-spacing:-.02em}document-component #introButton{background:#69d353;color:#fff;text-decoration:none;border:none;font-size:13px;font-weight:700;text-transform:uppercase;padding:16px 20px;border-radius:2px;box-shadow:0 8px 16px rgba(0,0,0,.1),0 3px 6px rgba(0,0,0,.08);outline:0;letter-spacing:.04em;transition:all .15s ease;cursor:pointer}document-component #introButton:hover{box-shadow:0 3px 6px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.1);transform:translateY(1px)}\ndocument-component.hydrated{visibility:inherit}");
App.loadComponents("i4xaih0n",function(t,n,e,o){"use strict";var r=function(){function t(){}return t.prototype.componentWillLoad=function(){return this.fetchNewContent()},t.prototype.fetchNewContent=function(){var t=this;return fetch("/docs-content/"+this.doc).then(function(t){return t.text()}).then(function(n){t.content=n;var e=document.createElement("div");e.innerHTML=n;var o=e.querySelector("h1");document.title=o&&o.textContent+" - Stencil"||"Stencil",t.isServer||window.requestAnimationFrame(function(){window.scrollTo(0,0)})})},t.prototype.render=function(){return n("div",{innerHTML:this.content})},t}(),c=function(){function t(){this.pages=[]}return t.prototype.render=function(){return console.log(this.pages),n("div",{class:"wrapper"},n("div",{class:"pull-left"},n("site-menu",null)),n("div",{class:"pull-right"},this.pages.map(function(t){return n("app-marked",{doc:t})})))},t}();t["app-marked"]=r,t["document-component"]=c},["app-marked",[["content",5,0,1],["doc",1,1,2],["isServer",3,0,1,"isServer"]],{},0,0,[["doc","fetchNewContent"]]],["document-component",[["pages",1,1,1]],{}]);;