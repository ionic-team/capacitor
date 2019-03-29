import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/capacitor.js',
    format: 'iife',
    name: 'capacitorExports'
  },
  sourcemap: true,
  banner: '/*! Capacitor: https://capacitor.ionicframework.com/ - MIT License */',
  plugins: [
    nodeResolve()
  ]
};
