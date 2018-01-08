
export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/capacitor.js',
    format: 'iife',
    name: 'capacitorExports'
  },
  sourcemap: true,
  banner: '/*! Capacitor: https://ionic-team.github.io/capacitor/ - MIT License */',
  intro: 'var __extends=function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=a}||function(b,a){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};return function(b,a){function c(){this.constructor=b}e(b,a);b.prototype=null===a?Object.create(a):(c.prototype=a.prototype,new c)}}(),__decorate=function(e,b,a,c){var f=arguments.length,d=3>f?b:null===c?c=Object.getOwnPropertyDescriptor(b,a):c,g;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)d=Reflect.decorate(e,b,a,c);else for(var h=e.length-1;0<=h;h--)if(g=e[h])d=(3>f?g(d):3<f?g(b,a,d):g(b,a))||d;return 3<f&&d&&Object.defineProperty(b,a,d),d};',
};
