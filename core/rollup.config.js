import nodeResolve from '@rollup/plugin-node-resolve';

const banner = '/*! Capacitor: https://capacitorjs.com/ - MIT License */';

export default {
  input: 'build/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
  ],
  plugins: [nodeResolve()],
};
