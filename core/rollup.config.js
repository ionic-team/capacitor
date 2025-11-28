import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const banner = '/*! Capacitor: https://capacitorjs.com/ - MIT License */';

export default {
  input: 'build/index.js',
  output: [
    {
      file: 'dist/capacitor.cjs',
      format: 'iife',
      name: 'capacitorExports',
      preferConst: true,
      banner,
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: 'dist/index.js',
      format: 'esm',
      preferConst: true,
      banner,
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      banner,
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  plugins: [nodeResolve()],
};
