import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/electron-bridge.js',
    format: 'iife',
    name: 'capacitorExports'
  },
  sourcemap: true,
  banner: '/*! Capacitor: https://ionic-team.github.io/capacitor/ - MIT License */',
  plugins: [
    nodeResolve()
  ]
};
