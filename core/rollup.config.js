import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const banner = '/*! Capacitor: https://capacitorjs.com/ - MIT License */';

export default {
  input: 'build/index.js',
  output: [
    {
      file: 'dist/capacitor.js',
      format: 'iife',
      name: 'capacitorExports',
      banner,
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: 'dist/index.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
  ],
  plugins: [nodeResolve()],
};
