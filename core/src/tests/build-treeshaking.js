const rollup = require('rollup');
const path = require('path');
const fs = require('fs');

async function validateBuildTreeshaking() {
  const rootDir = path.join(__dirname, '..', '..');
  const pkgJsonPath = path.join(rootDir, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const entryModulePath = path.join(rootDir, pkgJson.main);
  const outputFile = path.join(rootDir, 'build', `treeshake-output.js`);

  if (!fs.existsSync(entryModulePath)) {
    throw new Error(`Run a full build before testing treeshaking`);
  }

  const virtualInputId = `@g@doo`;
  const entryId = `@entry-module`;

  const bundle = await rollup.rollup({
    input: virtualInputId,
    treeshake: true,
    plugins: [
      {
        name: 'testResolver',
        resolveId(id) {
          if (id === virtualInputId) {
            return id;
          }
          if (id === entryId) {
            return entryModulePath;
          }
        },
        load(id) {
          if (id === virtualInputId) {
            return `import "${entryId}"; // side-effect import that "should" do nothing`;
          }
        },
      },
    ],
    onwarn(warning) {
      if (warning.code !== 'EMPTY_BUNDLE') {
        throw warning;
      }
    },
  });

  const o = await bundle.generate({
    format: 'es',
  });

  const output = o.output[0];
  const outputCode = output.code.trim();

  fs.writeFileSync(outputFile, outputCode);

  if (outputCode !== '') {
    console.error(`\nTreeshake output: ${outputFile}\n`);

    throw new Error(`🧨  Not all code was not treeshaken (treeshooken? treeshaked?) Review the ${outputFile} file.`);
  }

  console.log(`🌳  validated treeshaking: ${entryModulePath}`);
}

validateBuildTreeshaking().catch((err) => {
  console.error(err);
  process.exit(1);
});
