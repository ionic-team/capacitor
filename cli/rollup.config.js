import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-re';

export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/cli.js',
    format: 'iife',
    name: 'capacitorCliExports',
    sourcemap: true,
    banner: '/*! Capacitor CLI: https://ionic-team.github.io/capacitor/ - MIT License */'
  },
  name: 'CapacitorCLI',
  plugins: [
    json(),
    replace({
      // ... do replace before commonjs
      patterns: [
        {
          // regexp match with resolved path
          match: /formidable(\/|\\)lib/, 
          // string or regexp
          test: 'if (global.GENTLY) require = GENTLY.hijack(require);', 
          // string or function to replaced with
          replace: '',
        }
      ]
    }),
    resolve(),
    commonjs()
  ]
};
