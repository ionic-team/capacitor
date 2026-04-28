# Capacitor CLI Telemetry Documentation

## Overview

The Capacitor CLI implements a telemetry system to collect anonymous usage data that helps the team understand how developers use the tool and identify areas for improvement. The telemetry system is designed to be non-blocking, privacy-conscious, and easily disabled by users.

## How Telemetry Works

### Architecture

The telemetry system uses an asynchronous, fire-and-forget pattern to avoid impacting CLI performance:

1. **Command Execution**: When a user runs a CLI command, the command is wrapped in a `telemetryAction()` function
2. **Data Collection**: Metrics are collected during and after command execution
3. **Process Forking**: A child process is forked to handle telemetry transmission
4. **Async Transmission**: The child process sends data to the telemetry server while the main CLI process exits immediately
5. **Graceful Degradation**: Failed telemetry transmissions do not affect the user experience or command execution

### Technical Implementation

#### Key Files

- **`src/telemetry.ts`** - Core telemetry collection logic and metric creation
- **`src/ipc.ts`** - Inter-process communication and HTTPS transmission
- **`src/sysconfig.ts`** - Configuration storage and machine ID management
- **`src/tasks/telemetry.ts`** - User-facing telemetry on/off commands

#### Data Flow

```
1. User executes CLI command
   └─> npx cap sync ios

2. Command wrapped with telemetryAction()
   └─> Records start time, executes command, records end time

3. Telemetry collection (src/telemetry.ts)
   ├─> Calculate command duration
   ├─> Get anonymized app identifier (SHA-1 hash of first git commit)
   ├─> Collect Capacitor package versions from package.json
   ├─> Capture error information if command failed
   └─> Create CommandMetricData object

4. Send via IPC (src/ipc.ts send())
   ├─> Check if telemetry is enabled
   ├─> Fork child process with telemetry payload
   ├─> Main process disconnects and exits
   └─> Child process handles transmission asynchronously

5. HTTP Transmission (src/ipc.ts receive())
   ├─> Child process receives IPC message
   ├─> Constructs HTTPS POST request
   │   ├─> hostname: api.ionicjs.com
   │   ├─> port: 443
   │   ├─> path: /events/metrics
   │   ├─> method: POST
   │   └─> headers: Content-Type: application/json
   └─> Sends telemetry data and exits
```

#### Telemetry Endpoint

Telemetry data is sent to Ionic's event collection service:

- **Endpoint**: `https://api.ionicjs.com/events/metrics`
- **Method**: POST
- **Content-Type**: application/json
- **Expected Response**: HTTP 204 (No Content)

The endpoint configuration is defined in `src/ipc.ts` lines 52-54:

```typescript
const req = request(
  {
    hostname: 'api.ionicjs.com',
    port: 443,
    path: '/events/metrics',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // ... response handler
);
```

#### Request Format

The telemetry data is sent as a JSON payload:

```json
{
  "metrics": [
    {
      "name": "capacitor_cli_command",
      "timestamp": "2024-01-15T10:30:45.123Z",
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "source": "capacitor_cli",
      "value": { /* CommandMetricData */ }
    }
  ],
  "sent_at": "2024-01-15T10:30:45.123Z"
}
```

## Data Being Collected

The telemetry system collects the following information:

### CommandMetricData Structure

| Field | Type | Description |
|-------|------|-------------|
| `app_id` | string | SHA-1 hash of the first git commit (anonymized app identifier) |
| `command` | string | CLI command executed (e.g., "sync", "build", "run") |
| `arguments` | string | Command arguments as space-separated string |
| `options` | string | Command options serialized as JSON |
| `duration` | number | Execution time in milliseconds |
| `error` | string \| null | Error message if command failed, null on success |
| `node_version` | string | Node.js version (e.g., "v18.12.0") |
| `os` | string | Operating system: "mac", "windows", "linux", or "unknown" |
| `[package]_version` | string | Version of each @capacitor/* package in the project |

### Example Telemetry Payload

```json
{
  "app_id": "a1b2c3d4e5f6789...",
  "command": "sync",
  "arguments": "ios",
  "options": "{\"deployment\":false,\"inline\":false}",
  "duration": 15234,
  "error": null,
  "node_version": "v18.12.0",
  "os": "mac",
  "core_version": "^5.0.0",
  "common_version": "^5.0.0",
  "cli_version": "^5.0.0"
}
```

### Privacy Considerations

- **No sensitive data**: Passwords, file paths, API keys, and user credentials are never collected
- **App ID anonymization**: Uses a one-way SHA-1 hash of the git commit ID, not the actual project name
- **Machine ID**: A randomly generated UUID v4, not tied to any personal information
- **No code or file contents**: Only command names and public package versions are collected

## Commands That Trigger Telemetry

Telemetry is collected for the following CLI commands:

| Command | Description |
|---------|-------------|
| `init` | Initialize a new Capacitor project |
| `sync` | Sync web code and plugins to native platforms |
| `update` | Update Capacitor dependencies |
| `copy` | Copy web assets to native platforms |
| `build` | Build native platform projects |
| `run` | Run the app on a device or simulator |
| `open` | Open native IDE (Xcode or Android Studio) |
| `add` | Add a native platform to the project |
| `ls` | List installed Capacitor plugins |
| `doctor` | Check Capacitor project health |

### Conditions for Telemetry Collection

Telemetry is **only sent** when ALL of the following conditions are met:

1. ✅ The command is one of the commands listed above
2. ✅ The terminal is interactive (TTY present)
3. ✅ Not running in a CI/CD environment
4. ✅ Telemetry is enabled in the user's configuration
5. ✅ The command has completed (successfully or with error)

Telemetry is **NOT sent** when:

- ❌ Running in CI/CD environments (GitHub Actions, Travis, Jenkins, etc.)
- ❌ Running in non-interactive terminals (scripts, automated processes)
- ❌ User has disabled telemetry with `npx cap telemetry off`
- ❌ Command is not in the tracked command list

## Configuration and User Control

### Configuration Storage

Telemetry preferences are stored in a platform-specific location:

- **macOS**: `~/Library/Preferences/capacitor/sysconfig.json`
- **Linux**: `~/.config/capacitor/sysconfig.json`
- **Windows**: `%APPDATA%\capacitor\sysconfig.json`

### Configuration File Format

```json
{
  "machine": "550e8400-e29b-41d4-a716-446655440000",
  "telemetry": true,
  "signup": null
}
```

### User Commands

Users can control telemetry with the following commands:

```bash
# Check telemetry status
npx cap telemetry

# Disable telemetry
npx cap telemetry off

# Enable telemetry
npx cap telemetry on
```

### Default Behavior

- **Opt-out by default**: On first interactive command run (if no error occurs), telemetry is automatically enabled
- **User notification**: Users are informed about telemetry with a link to documentation
- **Easy to disable**: Can be disabled at any time with a simple command

## Changing the Telemetry Endpoint

To redirect telemetry data to a different server (for example, for enterprise deployments or testing), modify `src/ipc.ts` lines 52-54:

```typescript
{
  hostname: 'your-telemetry-server.com',  // Change server hostname
  port: 443,                               // Change port if needed
  path: '/your/endpoint/path',            // Change API path
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Add additional headers if needed (e.g., authentication)
  },
}
```

Your custom telemetry server should:
- Accept POST requests with JSON payload
- Expect the request format described in "Request Format" section
- Return HTTP 204 (No Content) on success
- Handle the CommandMetricData structure

## Implementation Notes

### App ID Generation

The app identifier is generated by hashing the first git commit:

```typescript
const firstCommitHash = await getCommandOutput('git', ['rev-list', '--max-parents=0', 'HEAD']);
const appId = createHash('sha1').update(firstCommitHash).digest('hex');
```

This provides a consistent, anonymous identifier for the project without exposing project names or paths.

### Machine ID Generation

A unique machine identifier is generated on first run:

```typescript
const machineId = uuidv4(); // Random UUID v4
```

This ID is stored in `sysconfig.json` and used as the `session_id` in telemetry payloads.

### Package Version Collection

Only Capacitor-scoped packages are collected:

```typescript
const packages = Object.entries({
  ...config.app.package.devDependencies,
  ...config.app.package.dependencies,
});
const capacitorPackages = packages.filter(([k]) => k.startsWith('@capacitor/'));
```

Package names are converted to field names (e.g., `@capacitor/core` becomes `core_version`).

### Operating System Values

The `os` field can contain one of the following values (defined in `src/definitions.ts`):

- `mac` - macOS systems
- `windows` - Windows systems
- `linux` - Linux systems
- `unknown` - Unable to determine OS

## Debugging Telemetry

To debug telemetry behavior, enable debug logging:

```bash
DEBUG=capacitor:ipc npx cap sync
```

This will output telemetry-related logs to help troubleshoot issues.

Telemetry logs are also written to:
- **Location**: Platform-specific log directory (determined by `env-paths` package)
- **Filename**: `ipc.log`

## Summary

The Capacitor CLI telemetry system is designed with the following principles:

- **Non-blocking**: Uses forked processes to avoid impacting CLI performance
- **Privacy-conscious**: Collects only anonymous usage data, no sensitive information
- **User-controlled**: Easy to disable with a simple command
- **Transparent**: Open-source implementation, documented behavior
- **Respectful**: Automatically disabled in CI/CD and non-interactive environments
- **Graceful**: Failed telemetry never affects command execution
