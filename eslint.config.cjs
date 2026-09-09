const ionic = require('@ionic/eslint-config/recommended');

module.exports = [
  {
    ignores: [
      '**/build/**',
      'cli/assets/**',
      '**/dist/**',
      '**/types/**',
      // lint TypeScript only
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  ...ionic,
];
