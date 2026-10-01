# Working in the Capacitor repo

Guidance for AI agents and new contributors. **This file is how to *work* here.**
For how the system actually *works* — bridge internals, message formats, platform
details, build pipeline — read [`ARCHITECTURE.md`](./ARCHITECTURE.md). Links below point
into it.

Human contributor policy lives in [`CONTRIBUTING.md`](./CONTRIBUTING.md) and takes
precedence over anything here.

---

## Design stance

Capacitor hosts a web app in a native shell and gives it typed access to the device. The
choices below are deliberate and should shape any change made here:

- **Stability over features.** The project optimises for apps that upgrade painlessly
  across majors. Prefer the boring implementation; avoid clever abstractions in the runtime.
- **No third-party dependencies.** No new CocoaPods, Gradle, or npm runtime dependencies
  without explicit approval, and no third-party web libraries in `core` at all. Implement
  the small piece you need. This is policy (`CONTRIBUTING.md`), not preference.
- **Developers own their native projects.** In an app, `ios/` and `android/` are real
  Xcode/Gradle projects the developer can read and edit. The CLI syncs into them; it does
  not regenerate them on every build. Anything the CLI writes must stay legible.
- **Plugins are thin typed bridges.** A plugin exposes one small interface with
  per-platform implementations behind a JSON bridge. Keep scope narrow and normalise
  values across platforms rather than leaking platform shapes into JS.
- **Cordova is a compatibility target, not a model.** Existing Cordova plugins run
  alongside Capacitor ones; new work should not take Cordova's shape.

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

**The iOS runtime has no Xcode project.** Since the source-first SwiftPM migration,
`Package.swift` at the repo root is the manifest and new files under `ios/Sources/` are
picked up automatically. The only `.pbxproj` files are the app scaffolds in
`ios-spm-template/App/` and `ios-pods-template/App/`.

---

## Things that will surprise you

The full treatment is in `ARCHITECTURE.md`; these are the facts that change how you edit.

- **Native decides routing, not JS.** The plugin proxy routes a method to native only if
  native emitted it in `window.Capacitor.PluginHeaders`. A JS method with no native
  declaration (`@objc` + `CAP_PLUGIN_METHOD` on iOS, `@PluginMethod` on Android) throws
  `UNIMPLEMENTED` at runtime, not at build time.
  [§4.3](./ARCHITECTURE.md#43-callback-identity-and-async-modes)
- **Every call settles exactly once** unless `keepAlive` is set. An early `return` without
  a `reject` hangs the caller's `await` forever.
  [§4.4](./ARCHITECTURE.md#44-keeping-calls-alive)
- **Navigation resets the bridge.** `reset()` clears saved calls and all plugin listeners
  on every page load. State that must survive navigation belongs on the native side.
  [§4.1](./ARCHITECTURE.md#41-bootstrap-order)
- **The app is not served from `file://`.** It comes from `capacitor://localhost` (iOS) or
  `https://localhost` (Android) via a native asset handler that also rewrites
  extension-less paths to `/index.html` and intercepts `/_capacitor_http_interceptor_`.
  [§5.6](./ARCHITECTURE.md#56-assets-schemes-and-navigation),
  [§6.4](./ARCHITECTURE.md#64-asset-serving-and-the-local-server)
- **Only JSON crosses the bridge.** JS `null` arrives as `NSNull` on iOS, and `Date` is
  stringified to ISO 8601 in both directions.
  [§4.2](./ARCHITECTURE.md#42-message-format)
- **Injection order at document-start is load-bearing:** global stub → `native-bridge.js`
  → per-plugin shims → app bundle.
  [§4.1](./ARCHITECTURE.md#41-bootstrap-order)

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
npm run verify -w ios        # xcodebuild build + test (macOS; test step targets the iPhone 17 / iOS 26.5 simulator)
npm run verify -w android    # gradlew clean/lint/build/test for :capacitor-android only (not :capacitor-cordova-android)
```

SwiftLint must be installed separately (`brew install swiftlint`); without macOS, CI
lints iOS for you.

### TypeScript

Prettier (`@ionic/prettier-config`): 120 cols, 2-space, single quotes, semicolons,
trailing commas everywhere, always-parens arrows.

ESLint — `@ionic/eslint-config/recommended`, pinned at `^0.4.0`. Verify against
`node_modules/@ionic/eslint-config/recommended.js` before trusting any list of rules,
including this one; newer published versions of that package differ. As installed, the
rules it adds are:

- `@typescript-eslint/consistent-type-imports` — type-only imports must use
  `import type { Foo } from './foo'`. This is by far the most common lint failure.
- `@typescript-eslint/explicit-module-boundary-types` — exported functions need explicit
  return types (`allowArgumentsExplicitlyTypedAsAny`).
- `@typescript-eslint/array-type`, `consistent-type-assertions`, `prefer-for-of`,
  `prefer-optional-chain`.
- `import/order` — groups `[builtin+external] → parent → [sibling+index]`, alphabetised
  ascending, blank line between groups. Note the prefix is `import/`, not `import-x/`.
- `import/first`, `import/newline-after-import`, `import/no-duplicates`,
  `import/no-mutable-exports`.

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

What that means in practice — current state of `ios/Sources/`: there is **no**
`async func`, `await`, `actor`, `Sendable`, `nonisolated` or `@preconcurrency` anywhere.
The single `@MainActor` is a WebKit-imposed signature in a `WKNavigationDelegate` method,
not our adoption. Concurrency is expressed with GCD: `DispatchQueue.main.async` for UI
hops and the bridge's serial `dispatchQueue` for plugin work.

**`.async` in this codebase means GCD, not Swift concurrency.** Do not read it as
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
Scopes in use: `core`, `cli`, `ios`, `android`, `ci`, `http`, `android-template`, or a
plugin name (e.g. `SystemBars`).

The breaking-change marker goes **after** the scope: `refactor(ios)!:`. Several commits,
including recent ones such as `feat!(ios): adopting SwiftUI`, put it before the scope.
That form is malformed: Lerna does not detect it as breaking and the change is missing
from the generated changelog. Do not copy it.

Write the subject only; skip the body unless asked. Squash-merged PRs get `(#1234)`
appended automatically — don't add it by hand.

### Pull requests

- **Branch targeting matters.** Bugfixes and non-breaking features go to the stable
  branch; anything breaking goes to the pre-release branch. `CONTRIBUTING.md` has the
  current branch map and is the source of truth — check it rather than assuming.
  `lerna.json` pins `command.version.allowBranch`, so releases can only be cut from the
  branch it names.
- **Consult the team before large changes** — open a discussion first.
- **No new dependencies** — see *Design stance*.
- Bug reports need a minimal reproduction app.

---

## Common pitfalls

Ordered roughly by how often they actually happen.

1. **Editing `core/native-bridge.ts` without rebuilding.** The file that runs at runtime
   is the *generated* `android/capacitor/src/main/assets/native-bridge.js` and
   `ios/Sources/Capacitor/assets/native-bridge.js`. Run `npm run build:nativebridge` and
   commit both generated files, or your change does nothing.

2. **Editing generated files directly.** In this repo the only generated, committed
   files are the two `native-bridge.js` copies (see pitfall 1). `cli/assets/*.tar.gz` is
   build output from `scripts/pack-cli-assets.mjs` and is gitignored. The files you may
   think of as "generated" — `capacitor.settings.gradle`, `app/capacitor.build.gradle`,
   `CapApp-SPM/Package.swift`, the `capacitor_pods` block in `Podfile` — live in
   *consumer apps*, not here. To change what they contain, change the generators:
   `cli/src/android/update.ts`, `cli/src/ios/update.ts`, `cli/src/util/spm.ts`.

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

5. **Sending non-JSON data over the bridge.** Only JSON-representable values cross —
   class instances, functions, `Blob`s and typed arrays must be converted first. Two
   traps on the native side: JS `null` arrives as `NSNull`, not `nil` (Objective-C
   collections cannot hold `nil`), so type-check values instead of testing for key
   presence; and `Date` is a valid `JSValue` natively but is stringified to ISO 8601 in
   both directions. See [§4.2](./ARCHITECTURE.md#42-message-format).

6. **Forgetting `@objc` on an iOS plugin method.** It compiles cleanly and fails only at
   runtime with a "does not respond to method call" log — and the JS promise never
   settles. Same for `@objc(ClassName)` on the class, which the CLI's plugin scanner
   relies on.

7. **Adding a built-in plugin and missing a touchpoint.** A new core plugin needs *all*
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

8. **Changing a built-in plugin's interface without regenerating docs.**
   `core/cookies.md`, `core/http.md` and `core/system-bars.md` are committed docgen
   output. Run `npm run docgen -w core` (or a full `npm run build -w core`) and commit them.
   User-facing API changes may also need a PR to
   [`ionic-team/capacitor-docs`](https://github.com/ionic-team/capacitor-docs), which is a
   separate repo — the published docs do not update themselves.

9. **Adding a file to a template without `git add`.** `scripts/pack-cli-assets.mjs` builds
   the CLI tarballs from `git ls-files`. An untracked file in `android-template/` or
   `ios-spm-template/` silently never ships.

10. **Type-only imports.** `import { Foo }` where `Foo` is only a type fails lint. Use
    `import type`.

11. **Assuming Kotlin, an Xcode project, or modern Swift concurrency.** None of the three
    exist here. Android is Java and there is no `.pbxproj` (see *Monorepo layout*); the
    Swift runtime is language mode 5 with zero `async`/`await`, actors or `Sendable`
    (see *Swift version and concurrency*). Reaching for any of them is a change of
    direction, not a cleanup.

12. **Targeting the wrong branch.** A breaking change opened against the stable branch
    will be sent back. See `CONTRIBUTING.md`.

13. **Adding comments nobody asked for.** Match the surrounding density. The existing
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

---

## External references

The published docs describe the **released** version; this repo may be ahead of them.
Where the two disagree, the source in this repo wins.

- [capacitorjs.com/docs](https://capacitorjs.com/docs) — end-user documentation
- [Creating plugins](https://capacitorjs.com/docs/plugins/creating-plugins) — the
  third-party plugin authoring model, and the design guidance core plugins also follow
  (keep plugins small in scope; normalise values across platforms — e.g. ISO 8601
  datetimes with timezones)
- [Bridge data types](https://capacitorjs.com/docs/core-apis/data-types) — what may cross
  the bridge, from the plugin author's side

Related repos, per `CONTRIBUTING.md`:

| Repo | What it is |
| --- | --- |
| `ionic-team/capacitor-plugins` | Official plugins |
| `ionic-team/capacitor-docs` | The docs site — **update it when changing user-facing API** |
| `ionic-team/capacitor-testapp` | The app the core team develops against |
| `capacitor-community/*` | Community plugins and platforms |

Background reading: Max Lynch's [How Capacitor
Works](https://ionic.io/blog/how-capacitor-works-2), which `CONTRIBUTING.md` cites for the
project's design philosophy.
