import replace from '@rollup/plugin-replace';

const banner = `
/*! Capacitor: https://capacitorjs.com/ - MIT License */
/* Generated File. Do not edit. */
`;

export default {
  input: 'build/native-bridge.js',
  output: [
    {
      file: '../android/capacitor/src/main/assets/native-bridge.js',
      format: 'iife',
      name: 'nativeBridge',
      preferConst: true,
      banner,
      sourcemap: false,
    },
    {
      file: '../ios/Capacitor/Capacitor/assets/native-bridge.js',
      format: 'iife',
      name: 'nativeBridge',
      preferConst: true,
      banner,
      sourcemap: false,
    },
  ],
  // Remove any references to module.exports or exports.__esModule by replacing them with unused variables
  plugins: [
    replace({
      'module.exports': 'dummy',
      'exports.__esModule': 'dummy',
      'exports.initBridge': 'dummy',
      'preventAssignment': false,
    }),
  ],
};
