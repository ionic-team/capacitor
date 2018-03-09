import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'plugins/esm/index.js',
  output: {
    file: 'plugins/index.js',
    format: 'iife',
    name: 'capacitorExports',
  },
  sourcemap: true,
  banner: '/*! Capacitor: https://ionic-team.github.io/capacitor/ - MIT License */',
  plugins: [
    nodeResolve()
  ]
};
