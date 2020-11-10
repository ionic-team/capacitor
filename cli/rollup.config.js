import nodeResolve from '@rollup/plugin-node-resolve';
import * as fs from 'fs';
import * as Module from 'module';

const banner = '/*! Capacitor CLI: https://capacitorjs.com/ - MIT License */';

export default {
  input: 'build/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      banner,
      preferConst: true,
    },
  ],
  external: (() => {
    const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    const deps = Object.keys(pkgJson.dependencies);
    return [...Module.builtinModules, ...deps];
  })(),
  plugins: [
    nodeResolve(),
    {
      name: 'copyDts',
      writeBundle() {
        fs.copyFileSync(
          './build/declarations.d.ts',
          './dist/declarations.d.ts',
        );
      },
    },
  ],
};
