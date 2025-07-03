# Capacitor CLI

The Capacitor command-line interface (CLI) is a tool for creating and managing Capacitor applications. While it can be installed globally, it's recommended to install it locally in your project and execute through `npm` scripts.

## Installation

### Project Installation (Recommended)

Install the CLI locally in your project:

```bash
npm install @capacitor/cli --save-dev
```

### Global Installation

While not recommended for project use, you can install the CLI globally:

```bash
npm install -g @capacitor/cli
```

## Using Capacitor CLI

The CLI can be used through the `capacitor` or `cap` command. When installed locally, use it through your project's `npm` scripts or `npx`.

Common commands:

- `cap init`: Initialize a new Capacitor project
- `cap add`: Add a native platform (ios, android)
- `cap sync`: Sync your web code to your native projects

For detailed information, consult the [Getting Started guide](https://capacitorjs.com/docs/getting-started).

## Local Development

If you're contributing to the Capacitor CLI or testing local changes:

1. Clone and setup:

   ```bash
   git clone https://github.com/ionic-team/capacitor.git
   cd cli
   npm install
   ```

2. Build the CLI:

   ```bash
   npm run build
   ```

3. Create a local link:

   ```bash
   npm link
   ```

4. Development workflow:
   - Run `npm run watch` to automatically rebuild on changes
   - Use `capacitor` or `cap` commands to test your changes
   - Run `npm test` to execute the test suite

## Debugging

### Using VS Code Launch Configurations

The CLI includes VS Code launch configurations for debugging. To debug a CLI command:

1. Open the project in VS Code
2. Right now we don't have debugging working in the ts files, so select one of the .js files inside of /dist/\*\*.js
3. Place a breakpoint
4. Press F5 or go to Run > Start Debugging
5. Select a launch config and run filling out the path you want to run the cli in, and the command that you want run.

You can add more configurations by copying and modifying the existing ones in `.vscode/launch.json`.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/ionic-team/capacitor/blob/main/CONTRIBUTING.md) for details.

### License

- [MIT](https://github.com/ionic-team/capacitor/blob/HEAD/LICENSE)
