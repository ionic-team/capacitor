import { execFileSync } from 'child_process';
import { mkdtemp, remove, writeFile, writeJSON } from 'fs-extra';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

describe('JavaScript configuration', () => {
  let appDir: string;

  beforeEach(async () => {
    appDir = await mkdtemp(join(tmpdir(), 'capacitor-config-'));
  });

  afterEach(async () => {
    await remove(appDir);
  });

  it.each([
    ['CommonJS', 'commonjs', 'module.exports ='],
    ['ES module', 'module', 'export default'],
  ])('loads a %s configuration', async (_name, type, exportStatement) => {
    await writeJSON(join(appDir, 'package.json'), { name: 'config-test', type });
    const expected = {
      appId: 'com.example.config',
      appName: 'Config Test',
      webDir: 'build/frontend',
      server: { url: 'http://localhost:5173', cleartext: true },
    };
    await writeFile(join(appDir, 'capacitor.config.js'), `${exportStatement} ${JSON.stringify(expected)};`);

    // Use Node's module loader, as Jest transforms ES modules into CommonJS.
    const configPath = resolve(__dirname, '../dist/config.js');
    const output = execFileSync(
      process.execPath,
      [
        '-e',
        `require(${JSON.stringify(configPath)}).loadConfig().then(({ app }) => {
          console.log(JSON.stringify({ appId: app.appId, appName: app.appName, webDir: app.webDir, extConfig: app.extConfig }));
        }).catch(error => { console.error(error); process.exitCode = 1; });`,
      ],
      { cwd: appDir, encoding: 'utf8', timeout: 10000 },
    );

    expect(JSON.parse(output)).toEqual({
      appId: expected.appId,
      appName: expected.appName,
      webDir: expected.webDir,
      extConfig: expected,
    });
  });
});
