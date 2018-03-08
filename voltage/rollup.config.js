import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'dist/esm/voltage/src/index.js',
  output: {
    file: 'dist/voltage.js',
    format: 'iife',
    name: 'capacitorExports'
  },
  sourcemap: true,
  banner: '/*! Capacitor: https://ionic-team.github.io/capacitor/ - MIT License */',
  plugins: [
    nodeResolve()
  ]
};
