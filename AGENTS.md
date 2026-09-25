# Working in the Capacitor repo

Guidance for AI agents and new contributors. **This file is how to *work* here.**
For how the system actually *works* — bridge internals, message formats, platform
details, build pipeline — read [`ARCHITECTURE.md`](./ARCHITECTURE.md). Section
references below point into it.

Human contributor policy lives in [`CONTRIBUTING.md`](./CONTRIBUTING.md) and takes
precedence over anything here.

---

## What Capacitor is

Capacitor lets a web app run as a native iOS/Android app (and as a PWA) from one
codebase, with typed access to native APIs.

The problems it solves:

- **Native APIs from web code.** Camera, filesystem, geolocation etc. are reachable as
  ordinary `async` TypeScript calls, over a JSON message bridge to a native host.
- **One implementation surface, three platforms.** A plugin exposes one interface with
  per-platform implementations; the runtime picks the right one and throws a typed
  `UNIMPLEMENTED` error when a platform has none.
- **Native projects you own.** Unlike bundler-driven tooling, `ios/` and `android/` are
  real, checked-in Xcode/Gradle projects. The CLI syncs assets and plugin wiring into
  them rather than generating them on every build.
- **Progressive migration off Cordova.** A compatibility layer runs existing Cordova
  plugins alongside Capacitor ones.

---

## Monorepo layout

npm workspaces are exactly `core`, `cli`, `ios`, `android`. Everything else is a
template or tooling.

| Path | Language | What it is | Change it when |
| --- | --- | --- | --- |
| `core/src/` | TypeScript | `@capacitor/core` — the module apps import. Plugin proxy, `WebPlugin`, built-in plugin JS. | Changing the public JS API, plugin registration, or a built-in plugin's web implementation |
| `core/native-bridge.ts` | TypeScript | The bridge IIFE injected into the web view by native. **Separate build.** | Changing the wire protocol, `fetch`/XHR/cookie patching, or bridge globals |
| `cli/src/` | TypeScript (Node) | `@capacitor/cli` — `cap add/copy/update/sync/run/build/migrate` | Changing project scaffolding, plugin discovery, or native-project wiring |
| `ios/Sources/Capacitor/` | Swift | iOS runtime — bridge, view controller, web view handlers | Changing iOS behaviour |
| `ios/Sources/CapacitorObjC/` | Objective-C | `CAPPlugin`, `CAPPluginCall`, `CAPPluginMethod` base classes + public headers | Changing the ObjC plugin base API |
| `ios/Sources/Cordova/` | Objective-C | Cordova compatibility (`CDV*`) | Cordova compat only |
| `android/capacitor/` | **Java** | `:capacitor-android` — `Bridge`, `BridgeActivity`, `Plugin`, local server | Changing Android behaviour |
| `android/capacitor-cordova/` | Java | `:capacitor-cordova-android` | Cordova compat only |
| `android-template/`, `ios-spm-template/`, `ios-pods-template/` | — | Scaffolds copied into apps by `cap add` | Changing what a *new* app looks like |
| `scripts/` | Node / shell | Asset packing, version sync, publishing | Build/release tooling |

**Android is Java. There is no Kotlin in this repo.** The CLI scans `.kt` files when
discovering *third-party plugin* classes, but the runtime itself is Java only — do not
add Kotlin sources or the Kotlin Gradle plugin.

**iOS has no Xcode project.** Since the source-first SwiftPM migration, `Package.swift`
at the repo root is the manifest and new files under `ios/Sources/` are picked up
automatically. There is no `.pbxproj` to edit.

---

## Core concepts

Condensed; see `ARCHITECTURE.md` for the full treatment.

### Plugin system

A plugin is registered once in JS and gets a `Proxy` whose methods are materialised
lazily (`core/src/runtime.ts`):

```ts
export const Camera = registerPlugin<CameraPlugin>('Camera', {
  web: () => import('./web').then((m) => new m.CameraWeb()),
});
```

Method routing is decided **by the native side**, not by JS. Native emits
`window.Capacitor.PluginHeaders` — `{ name, methods: [{ name, rtype }] }` — and the proxy
uses it to route each method to `nativePromise`, `nativeCallback`, or a JS
implementation. No JS implementation and no header entry ⇒ typed `UNIMPLEMENTED` throw.
See *ARCHITECTURE.md §4.3*.

Native plugin declarations:

- **iOS** — `@objc(MyPlugin)` class conforming to `CAPBridgedPlugin`, with `jsName` and a
  `pluginMethods` array (via the `CAP_PLUGIN`/`CAP_PLUGIN_METHOD` macros or
  `CAPPluginMethod(_:returnType:)`).
- **Android** — `@CapacitorPlugin(name = "MyPlugin")` class extending `Plugin`, with
  `public void method(PluginCall call)` marked `@PluginMethod`.

### Native bridge

One JSON message format, two transports (*ARCHITECTURE.md §4.2*):

- Web → native: `webkit.messageHandlers.bridge.postMessage(obj)` (iOS) /
  `androidBridge.postMessage(jsonString)` (Android)
- Native → web: `evaluateJavaScript("window.Capacitor.fromNative({…})")` (iOS) /
  `JavaScriptReplyProxy.postMessage` (Android, with a legacy `evaluateJavascript` fallback)

Payload is `{ callbackId, pluginId, methodName, options }` out and
`{ callbackId, success, data | error, save }` back. `callbackId: '-1'` means fire-and-forget.

### Web view

The app is served from a custom scheme (`capacitor://localhost` on iOS,
`https://localhost` on Android) by a native asset handler, not from `file://`. That
handler also rewrites extension-less paths to `/index.html` for SPA routing, and
intercepts `/_capacitor_http_interceptor_` for native HTTP. See *ARCHITECTURE.md §5.6, §6.4*.

### Lifecycle

Injection order at document-start is load-bearing: global stub → `native-bridge.js` →
per-plugin shims → app bundle. On every navigation the bridge calls `reset()`, clearing
saved calls and all plugin listeners. See *ARCHITECTURE.md §4.1, §4.4*.

---

## Conventions

### Commands

Run from the repo root unless noted:

```bash
npm install                  # workspaces
npm run lint                 # eslint + prettier --check + swiftlint
npm run fmt                  # autofix all three
npm run build:nativebridge   # REQUIRED after editing core/native-bridge.ts

npm run build  -w core       # docgen + tsc + rollup
npm test       -w core       # jest
npm run build  -w cli
npm test       -w cli
npm run verify -w ios        # xcodebuild build + test (macOS only)
npm run verify -w android    # gradlew clean lint build test
```

SwiftLint must be installed separately (`brew install swiftlint`); without macOS, CI
lints iOS for you.

### TypeScript

Prettier (`@ionic/prettier-config`): 120 cols, 2-space, single quotes, semicolons,
trailing commas everywhere, always-parens arrows.

ESLint (`@ionic/eslint-config/recommended`) — the rules agents trip over:

- `@typescript-eslint/consistent-type-imports` — type-only imports must use
  `import type { Foo } from './foo'`. This is by far the most common lint failure.
- `import/order` — groups `[builtin+external] → parent → [sibling+index]`, alphabetised
  ascending, blank line between groups.
- `@typescript-eslint/explicit-module-boundary-types` — exported functions need explicit
  return types.
- `array-type`, `prefer-optional-chain`, `prefer-for-of`, `no-duplicates`.

`core/tsconfig.json` has `noUnusedLocals` and `noUnusedParameters` on — an unused
parameter fails the build, not just the lint.

### Swift

SwiftLint (`@ionic/swiftlint-config` via `swiftlint.config.js`), scoped to `ios/`,
`ios-pods-template/`, `ios-spm-template/`, excluding `ios/Tests`. Opt-in rules that bite:
`force_unwrapping`, `implicitly_unwrapped_optional`, `lower_acl_than_parent`,
`modifier_order`, `unused_import`, `unowned_variable_capture`. Line length warns at 150.

Where an existing violation is intentional the file carries a scoped
`// swiftlint:disable <rule>` with a comment explaining why — follow that pattern rather
than widening the config.

Any method reachable from the bridge **must** be `@objc` — dispatch is
`performSelector`-based. API intended for subclassing is `open`, not `public`.

#### Swift version and concurrency — read before writing Swift

**The runtime is still Swift 5, and strict concurrency has not been adopted.** This is
deliberate, not an oversight, and it is the thing agents most often get wrong in
`ios/Sources/`.

`Package.swift` uses `swift-tools-version: 6.0` but pins the language mode back:
`swiftLanguageModes: [.v5]` at package level and `.swiftLanguageMode(.v5)` on each Swift
target. `Capacitor.podspec` declares `swift_version = '5.1'`. Tools version 6 does **not**
mean Swift 6 semantics here.

What that means in practice — current state of `ios/Sources/`:

| Construct | Count | Notes |
| --- | --- | --- |
| `async func` / `await` | 0 / 0 | No Swift concurrency anywhere |
| `actor` | 0 | |
| `Sendable` / `@unchecked Sendable` | 0 | No conformances declared |
| `nonisolated` / `@preconcurrency` | 0 | |
| `@MainActor` | 1 | WebKit-imposed signature in a `WKNavigationDelegate` method, not our adoption |
| `DispatchQueue` | 19 | How concurrency is actually expressed |

**`async` in this codebase means GCD, not Swift concurrency.** All 18 occurrences are
`DispatchQueue.main.async` (17) and `dispatchQueue.async` (1). Do not read them as
`async`/`await`.

Rules for changes:

- **Match the existing GCD idiom.** Thread hops use `DispatchQueue.main.async` and the
  bridge's serial `dispatchQueue`; completion handlers are escaping closures, not `async`
  functions.
- **Do not introduce `async`/`await`, `actor`, or `Sendable` conformances** as part of an
  unrelated change. A single `async func` in a call chain forces callers to change too,
  and most of the public surface is `@objc`-exported — which constrains what can be
  expressed anyway.
- **Do not flip the language mode or enable strict concurrency** (`.swiftLanguageMode(.v6)`,
  `.enableUpcomingFeature("StrictConcurrency")`, `-strict-concurrency=complete`) as a
  drive-by. That migration is a large, breaking piece of work needing team discussion
  first — see *Pull requests* below.
- **For shared mutable state, follow the existing pattern**, not actors: hand-rolled
  locking, e.g. `ConcurrentDictionary` in `KeyValueStore.swift` (an `NSLock` with a
  `withLock` accessor), which is what guards the bridge's `storedCalls`.
- **If you hit a data-race warning**, fix it within Swift 5 semantics rather than reaching
  for `@unchecked Sendable` to silence it.

### Java

Formatted by `prettier-plugin-java`: 140 cols, 4-space indent, no trailing commas.
Run `npm run fmt`; do not hand-format.

Android lint runs with `abortOnError = true` **and `warningsAsErrors = true`** against a
checked-in `lint-baseline.xml`. A new warning fails CI.

### Commits

Conventional Commits, enforced in spirit by Lerna's changelog generation.

```
type(scope): subject
type(scope)!: subject      # breaking change
```

Types in use: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`.
Scopes in use: `core`, `cli`, `ios`, `android`, `http`, `cordova`, `android-template`,
or a plugin name.

The breaking-change marker goes **after** the scope: `refactor(ios)!:`. A handful of old
commits use `feat!(ios):` — that form is malformed and Lerna will not detect it as
breaking. Do not copy it.

Write the subject only; skip the body unless asked. Squash-merged PRs get `(#1234)`
appended automatically — don't add it by hand.

### Pull requests

- **Branch targeting matters.** Bugfixes and non-breaking features go to the stable
  branch; anything breaking goes to the pre-release branch. `CONTRIBUTING.md` has the
  current branch map and is the source of truth — check it rather than assuming.
  `lerna.json` pins `command.version.allowBranch`, so releases can only be cut from the
  branch it names.
- **Consult the team before large changes** — open a discussion first.
- **No new third-party dependencies** without explicit approval. That means no new
  CocoaPods or Gradle dependencies, and no third-party web libraries in `core` at all.
  Prefer implementing the small piece you need. This is project policy, not a preference.
- Bug reports need a minimal reproduction app.

---

## Common pitfalls

Ordered roughly by how often they actually happen.

1. **Editing `core/native-bridge.ts` without rebuilding.** The file that runs at runtime
   is the *generated* `android/capacitor/src/main/assets/native-bridge.js` and
   `ios/Sources/Capacitor/assets/native-bridge.js`. Run `npm run build:nativebridge` and
   commit both generated files, or your change does nothing.

2. **Editing generated files directly.** These are all overwritten:
   `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle` (both carry
   a `DO NOT EDIT` banner), `ios/App/CapApp-SPM/Package.swift`, the `capacitor_pods`
   block in `Podfile`, the two `native-bridge.js` copies, and everything in `cli/assets/`.
   Change the *generator* in `cli/src/` instead.

3. **Settling a bridge call zero times or twice.** Every `PluginCall` must resolve or
   reject exactly once, unless it is explicitly kept alive:
   - `call.resolve(data)` / `call.reject(msg, code, err, data)`
   - For listeners or repeated callbacks: `call.setKeepAlive(true)` (Android) /
     `call.keepAlive = true` (iOS), then resolve repeatedly.
   - An early `return` on an error path without rejecting hangs the caller's `await`
     forever. There is a known instance of this in iOS `handleJSCall` — do not add more.

4. **Blocking the plugin queue.** Both platforms run *every* plugin method on one serial
   queue — `DispatchQueue(label: "bridge")` on iOS, `HandlerThread("CapacitorPlugins")` on
   Android. Blocking it stalls every plugin in the app. Dispatch long work onward and
   resolve the call from the completion handler. To touch UI, hop explicitly:
   `DispatchQueue.main.async` / `bridge.executeOnMainThread(...)`.

5. **Forgetting `@objc` on an iOS plugin method.** It compiles cleanly and fails only at
   runtime with a "does not respond to method call" log — and the JS promise never
   settles. Same for `@objc(ClassName)` on the class, which the CLI's plugin scanner
   relies on.

6. **Adding a built-in plugin and missing a touchpoint.** A new core plugin needs *all*
   of these. The SystemBars plugin (`a32216ac`) is the reference commit, though it
   predates the iOS SPM move — its iOS paths and `.pbxproj` edit no longer apply. Paths
   below are current:
   - `core/src/core-plugins.ts` — interface, web implementation, `registerPlugin` call
   - `core/src/index.ts` — export the plugin object **and** its types
   - `core/package.json` — add a `docgen --api …Plugin --output-readme ….md` entry
   - `core/<name>.md` — the generated doc, committed
   - `cli/src/declarations.ts` — config options, if any
   - `ios/Sources/Capacitor/Plugins/<Name>.swift` — **and** add the class to `pluginList`
     in `CapacitorBridge.registerPlugins()`
   - `android/.../com/getcapacitor/plugin/<Name>.java` — **and** add
     `this.registerPlugin(...)` to `Bridge.registerAllPlugins()`

   Forgetting the two registration lists is the single most common miss: the plugin
   builds, exports cleanly, and is simply absent at runtime.

7. **Changing a built-in plugin's interface without regenerating docs.**
   `core/cookies.md`, `core/http.md` and `core/system-bars.md` are committed docgen
   output. Run `npm run docgen -w core` (or a full `npm run build -w core`) and commit them.

8. **Adding a file to a template without `git add`.** `scripts/pack-cli-assets.mjs` builds
   the CLI tarballs from `git ls-files`. An untracked file in `android-template/` or
   `ios-spm-template/` silently never ships.

9. **Type-only imports.** `import { Foo }` where `Foo` is only a type fails lint. Use
   `import type`.

10. **Assuming Kotlin, an Xcode project, or modern Swift concurrency.** None of the three
    exist here. Android is Java and there is no `.pbxproj` (see *Monorepo layout*); the
    Swift runtime is language mode 5 with zero `async`/`await`, actors or `Sendable`
    (see *Swift version and concurrency*). Reaching for any of them is a change of
    direction, not a cleanup.

11. **Targeting the wrong branch.** A breaking change opened against the stable branch
    will be sent back. See `CONTRIBUTING.md`.

12. **Adding comments nobody asked for.** Match the surrounding density. The existing
    comments in the bridge files explain *non-obvious constraints* (why a counter is
    randomised, why a notification is dropped rather than deferred) — that is the bar.

---

## Verifying a change

Report actual results; never claim success unverified.

| Changed | Run |
| --- | --- |
| `core/src/**` | `npm test -w core` + `npm run build -w core` |
| `core/native-bridge.ts` | `npm run build:nativebridge`, then `npm test -w core` |
| `cli/src/**` | `npm run build -w cli` + `npm test -w cli` |
| `ios/**` | `npm run verify -w ios` (macOS + Xcode required) |
| `android/**` | `npm run verify -w android` (JDK 21) |
| anything | `npm run lint` |

Markdown is not linted or formatted by this repo — the prettier glob is
`**/*.{css,html,java,js,mjs,ts}`.
