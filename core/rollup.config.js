import nodeResolve from 'rollup-plugin-node-resolve';

const banner = '/*! Capacitor: https://capacitor.ionicframework.com/ - MIT License */';

export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/capacitor.js',
      format: 'iife',
      name: 'capacitorExports',
      banner,
      sourcemap: true
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
      banner,
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve()
  ]
};
