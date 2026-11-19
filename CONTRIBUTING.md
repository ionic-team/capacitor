# Contributing to Capacitor

This guide covers contributing to Capacitor through [issues & discussions](#issues--discussions) and [code](#developing-capacitor). It is written to be followed literally, by people and by AI coding agents alike.

> **For AI agents:** read this file in full before changing anything, then read [`AGENTS.md`](./AGENTS.md) for repo-specific technical conventions and pitfalls. If the two disagree, this file wins. If a rule here does not cover your situation, ask the human you are working for. If you are running autonomously and cannot ask, take the most conservative option this guide describes, and state the assumption you made in the PR description under "Notes / Comments".

## Contents

- [Issues & Discussions](#issues--discussions)
- [Developing Capacitor](#developing-capacitor)
  - [Before you start](#before-you-start)
  - [Local setup](#local-setup)
  - [Choosing the target branch](#choosing-the-target-branch)
  - [Branches and commits](#branches-and-commits)
  - [Which tests to run](#which-tests-to-run)
  - [Changelog and versioning](#changelog-and-versioning)
  - [Opening the pull request](#opening-the-pull-request)
  - [Review rubric](#review-rubric)
  - [Pre-PR checklist](#pre-pr-checklist)
  - [Repositories](#repositories)
  - [Directory structure](#directory-structure)

## Issues & Discussions

The Capacitor repo uses GitHub [issues](https://github.com/ionic-team/capacitor/issues) and [discussions](https://github.com/ionic-team/capacitor/discussions) to track bugs and feature requests, as well as to provide a place for community questions, ideas, and discussions.

* **When to use [issues](https://github.com/ionic-team/capacitor/issues)**:
    * To report specific, reproducible bugs (see [Creating a Code Reproduction](#creating-a-code-reproduction)).
    * To propose detailed feature requests.
* **When to use [discussions](https://github.com/ionic-team/capacitor/discussions)**:
    * To ask for help.
    * To ask general questions.
    * To show off cool stuff.
    * To propose ideas for improvement.
    * If you think you found a bug, but may need help to further uncover it.
    * Anything else! :rainbow:

### Creating a Code Reproduction

When reporting bugs, we ask you to provide a minimal sample application that demonstrates the issue. Without a reliable code reproduction, it is unlikely we will be able to resolve the issue, leading to it being closed.

To create a code reproduction:

* Create a new application using `npm init @capacitor/app` (or `ionic start --capacitor`).
* Add the minimum amount of code necessary to recreate the issue you're experiencing.
* Push the code reproduction to a public GitHub repository and include a link when you create a bug report.
* Be sure to include steps to reproduce the issue.

## Developing Capacitor

### Before you start

1. **Find or open an issue, when one is warranted.** For a bug that affects users, make sure an issue with a reproduction exists (see above) and reference it in your PR. For a large change, see step 2. Small changes with no user-facing bug, such as lint fixes, chores, docs or tests, do not need an issue; write "No related issue" and a one-line reason in the PR instead. If a user-facing bug has no issue and you cannot open one (for example you are an AI agent working without access to GitHub), say so in the PR and ask the human you are working for to open or link the issue.
2. **Consult the team before large changes.** A change is "large" if it adds a public API, a built-in plugin, a configuration option, or a dependency; changes behavior apps rely on; touches the bridge protocol; or spans more than one platform. [Open a discussion](https://github.com/ionic-team/capacitor/discussions) and wait for a maintainer's go-ahead. A large PR with no prior discussion is likely to be closed, however good the code is.
3. **Understand the design philosophy.** Read Max Lynch's essay [How Capacitor Works](https://ionic.io/blog/how-capacitor-works-2), so you don't invest time in something that doesn't fit the goals of the project.
4. **Keep the PR to one logical change.** Do not mix a fix with refactors, formatting changes, dependency bumps or unrelated cleanups. Do not reformat files you are not otherwise changing.
5. **No new third-party dependencies without explicit approval.** To keep Capacitor stable and easy to upgrade:
    * Native: do not add any new CocoaPod, Swift package or Gradle dependency. If you need a small bit of functionality, implement it in the codebase.
    * Web (`core`): do not add third-party libraries such as Firebase or Lodash. Use pure Web APIs, even if it means more work.
    * Node (`cli`): do not add an npm dependency unless a maintainer has approved it in the discussion or issue.

### Local setup

Required tools (versions are the ones CI uses on `next`; check `.github/workflows/ci.yml` if in doubt. Older branches such as `main` may use older versions, for example Node 22 and Xcode 26):

| Tool | Version | Needed for |
| --- | --- | --- |
| Node.js | 24 or newer | everything |
| npm | the one bundled with Node | everything |
| JDK | 21 | Android (`android/`) |
| Android SDK | installed through Android Studio; Gradle itself runs through `android/gradlew` | Android |
| macOS, Xcode 27 and an iOS 27 simulator (iPhone 17) | CI uses Xcode 27.0 | iOS (`ios/`) |
| SwiftLint | latest (`brew install swiftlint`) | iOS linting, macOS only |

You can only build and test the platforms your machine supports. Without macOS you cannot run the iOS tests locally. Say so in the PR; CI runs them.

```shell
# 1. Fork https://github.com/ionic-team/capacitor, then:
git clone git@github.com:<your-user>/capacitor.git
cd capacitor
git remote add upstream git@github.com:ionic-team/capacitor.git
git fetch upstream            # gets both upstream/main and upstream/next

# 2. Install dependencies for every workspace (core, cli, ios, android)
npm install

# 3. macOS only: SwiftLint is required to lint iOS code locally
brew install swiftlint
```

Record the baseline before changing anything, so you can tell your failures from existing ones. Run the build and tests for the area you are about to touch (see [Which tests to run](#which-tests-to-run)), plus lint. For example, for `core` or `cli`:

```shell
npm run build -w core && npm test -w core     # or: npm run build -w cli && npm test -w cli
npm run lint
```

`npm run lint` chains several steps and stops at the first one that fails. Run the steps one at a time to see all of them:

```shell
npm run eslint
npm run prettier -- --check
npm run swiftlint -- lint        # macOS only
npm run lint:package-swift
```

If something fails on an untouched checkout, work out why:

* **Your environment is wrong** (missing tool, wrong Node or JDK version, missing simulator): fix the environment. Do not change the repository to make it pass.
* **The failure exists on the target branch itself** (for example Prettier already fails on files you have no reason to touch): leave those files alone, do not mix unrelated formatting fixes into your PR, and list the pre-existing failures in the PR under "Notes / Comments". The bar for your PR is "no new failures", not "everything is green".
* **The failure is the bug you were asked to fix** (for example a lint error in the code you are changing): fix it as your change.
* **A step cannot run at all** (for example a tool fails to load its configuration, or a simulator or scheme is missing and you cannot install it): do not skip it silently and do not change the repository to make it run. Say in the PR under "Tests or Reproductions" which step you could not run and why, and mark it as unverified so CI or a reviewer can confirm it.

Warnings that already exist, such as the many SwiftLint warnings, are not yours to clean up. Make sure your change adds none.

### Choosing the target branch

Pick the branch by the kind of change. **A PR opened against the wrong branch will be sent back.**

| Your change | Target branch |
| --- | --- |
| Bug fix, or non-breaking feature, for the current stable major | [`main`](https://github.com/ionic-team/capacitor/tree/main) |
| Anything breaking (see [below](#what-counts-as-breaking)), or work for the next major | [`next`](https://github.com/ionic-team/capacitor/tree/next) |
| Fix that must also ship in a maintained older major | the matching `N.x` branch, only if a maintainer asks for it |

Current branches:

* [`main`](https://github.com/ionic-team/capacitor/tree/main): latest stable Capacitor (8.x). Bugfixes and non-breaking features.
* [`next`](https://github.com/ionic-team/capacitor/tree/next): the next major (9.0 pre-release). Any PR that contains breaking changes goes here.
* [`7.x`](https://github.com/ionic-team/capacitor/tree/7.x): Capacitor 7
* [`6.x`](https://github.com/ionic-team/capacitor/tree/6.x): Capacitor 6 (not maintained)
* [`5.x`](https://github.com/ionic-team/capacitor/tree/5.x): Capacitor 5 (not maintained)
* [`4.x`](https://github.com/ionic-team/capacitor/tree/4.x): Capacitor 4 (not maintained)
* [`3.x`](https://github.com/ionic-team/capacitor/tree/3.x): Capacitor 3 (not maintained)
* [`2.x`](https://github.com/ionic-team/capacitor/tree/2.x): Capacitor 2 (not maintained)
* [`1.x`](https://github.com/ionic-team/capacitor/tree/1.x): Capacitor 1 (not maintained)

Do not open PRs against unmaintained branches.

#### Which branch do I start from?

Decide using the first rule that applies:

1. **You were told which branch to use** (by a maintainer, in the issue, or by the human you are working for): use that branch.
2. **The change is breaking, or only makes sense for the next major:** start from and target `next`.
3. **The code you are changing exists only on `next`** (for example something introduced by a `next`-only change, or a file that does not exist on `main`): start from and target `next`.
4. **The code exists on both `main` and `next`** (the usual case for a bug fix): start from `main` and target `main`. Check by searching for the same function, class or string on both branches (`git grep <symbol> upstream/main` and `git grep <symbol> upstream/next`), not by file path, because paths can differ between the branches. If you are not sure, treat it as existing on both.
5. **Still unsure:** target `main`, say so in the PR description, and a maintainer will retarget it.

Create your branch from the matching remote branch, never from a local branch of unknown age:

```shell
git fetch upstream
git switch -c <branch-name> upstream/main      # or upstream/next
```

If you are already working in a checkout of `next` and rule 4 says `main`, move your change over: create a branch from `upstream/main`, and re-apply the change there instead of rebasing, because the branches differ.

**Fixes may need two PRs.** `main` and `next` are kept in sync by porting changes by hand. If you fix a bug on `main` and the same code exists on `next`, a maintainer may ask you to open a second PR with the same change against `next` (see #8683 and #8684 for an example). Do not do this unprompted; mention in the first PR that the code also exists on `next`. The two branches differ in places (for example the iOS project layout, Node and Xcode versions), so check out the other branch and re-run its tests instead of assuming the change applies cleanly.

#### What counts as breaking

A change is breaking if an app that works today could stop working or need changes after upgrading, without editing its own code. For example:

* removing or renaming a public API, config option, CLI flag or CLI command;
* changing the signature or default behavior of a public API or config option;
* raising a minimum platform version, minimum Node version, or a Gradle/AGP/Xcode requirement;
* changing what `cap add` or `cap migrate` writes into an app in a way that requires a migration.

Breaking changes are marked with `!` after the scope in the PR title, and described in a `BREAKING CHANGE:` paragraph in the PR description. A maintainer adds that paragraph as a footer to the squash commit message when merging, because Lerna only treats a commit as breaking when it has that footer (see [Commit messages](#commit-messages)).

### Branches and commits

#### Branch names

Create a branch off the up-to-date branch chosen in [Which branch do I start from?](#which-branch-do-i-start-from). Branch names are not enforced by CI, but use this format:

```
<type>/<short-kebab-description>        e.g. fix/android-lifecycle-bridge-guard
<type>/<issue-number>-<description>     e.g. fix/8637-android-lifecycle-bridge-guard
```

where `<type>` is one of the commit types below. Never work directly on `main` or `next`.

```shell
git fetch upstream
git switch -c fix/android-lifecycle-bridge-guard upstream/main    # or upstream/next
```

#### Commit messages

Capacitor uses [Conventional Commits](https://www.conventionalcommits.org). **This is load-bearing:** Lerna generates the changelog and decides the version bump from commit messages, so a malformed message means a missing or wrong changelog entry.

```
type(scope): subject
type(scope)!: subject        # breaking change, by project convention (see below)
```

A breaking change also needs a `BREAKING CHANGE:` footer in the final commit message, like this:

```
feat(cli)!: drop support for Node 20

BREAKING CHANGE: Node 20 is no longer supported. Upgrade to Node 22 or newer.
```

Because the repository squash-merges with the PR title as the commit message, **you cannot add that footer yourself**: the PR description and the commit messages on your branch are not kept. Write the `BREAKING CHANGE:` paragraph in the PR description (under "Notes / Comments") and a maintainer pastes it into the squash commit message when merging.

* **type**, one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `revert`.
* **scope**: the area changed. In use: `core`, `cli`, `ios`, `android`, `ci`, `http`, `android-template`, or the name of a built-in plugin (for example `SystemBars`). Use one scope; if a change spans platforms, use the primary one, or `core` when the JS API changes. A change that touches no single area (repo-wide tooling or docs) may omit the scope, for example `chore: add Backstage catalog-info.yaml`.
* **subject**: imperative mood ("skip lifecycle events"), lower-case first letter, no trailing period, describing the user-visible effect rather than the implementation.
* **breaking marker**: by project convention, put `!` **after the scope**: `feat(cli)!: drop support for Node 20` (not `feat!(cli):`). The `!` is for people reading the log. Lerna's changelog tooling does not read it: commits that have only the `!` are missing from the generated `CHANGELOG.md`. Only the footer shown above makes a change count as breaking.
* **body**: not needed. Only the PR title is kept on merge. For a breaking change, put a paragraph starting with `BREAKING CHANGE:` in the PR description, explaining what breaks and how to migrate, as described above.
* Do not add `(#1234)` to the subject. GitHub appends the PR number when the PR is squash-merged.

Examples taken from the project history:

```
fix(android): skip lifecycle events when the Capacitor bridge is not present
fix(android): keep callbacks on non-public base classes from R8
feat(cli): recognize @capacitor-community/ssl-pinning for auto cert copy
fix(SystemBars): respect windowSoftInputMode="adjustNothing"
chore: add Backstage catalog-info.yaml
feat(android)!: enable R8 by default in release builds
```

Which type to pick:

| Type | Use for | Appears in changelog | Version bump |
| --- | --- | --- | --- |
| `fix` | bug fix | yes, under "Bug Fixes" | patch |
| `feat` | new user-facing capability | yes, under "Features" | minor |
| any type with `!`, plus a `BREAKING CHANGE:` footer added at merge | breaking change | yes, as a breaking change (only with the footer) | major |
| `refactor`, `chore`, `docs`, `test`, `ci` | no user-visible behavior change | no | none |

Choosing between them when the change has no user-visible effect:

* `chore`: lint or formatting fixes, dependency or tooling updates, and other maintenance that does not fit below. A lint-only fix is a `chore`. (A maintainer may ask you to retype it, as the history is not fully consistent on this.)
* `refactor`: restructuring code with identical behavior.
* `docs`: documentation or comments only. `test`: tests only. `ci`: workflow files only.
* If users will notice the difference (a bug is fixed, a crash goes away), it is a `fix`, even if the diff is one line.

Your PR is squashed on merge, and **the PR title becomes the commit message**, so the PR title must follow the same format (see [Opening the pull request](#opening-the-pull-request)). Only the PR title (with the PR number appended) is kept in the history: the PR description and the commits on your branch are discarded on merge. Intermediate commits on your branch are not checked, but keep them tidy.

### Which tests to run

Run the checks for every area you touched **before** opening the PR, and report what you ran and the result in the PR. All commands run from the repository root.

| You changed | Run | Notes |
| --- | --- | --- |
| `core/src/**` | `npm run build -w core` then `npm test -w core` | Jest. `build` also regenerates the plugin docs (`core/*.md`); commit any docs it changes. |
| `core/native-bridge.ts` | `npm run build:nativebridge`, then `npm test -w core` | Commit the regenerated `native-bridge.js` files under `android/` and `ios/`, otherwise your change does nothing at runtime. |
| `cli/src/**` | `npm run build -w cli` then `npm test -w cli` | Jest, run serially. |
| `ios/**` | `npm run verify -w ios` | macOS and Xcode only. Builds and runs the iOS unit tests through the root `Package.swift`. There is no Xcode project for the runtime. |
| `Package.swift` (repo root) | `npm run build:package-swift` | Regenerates `ios/Package.swift`; commit both. Never edit `ios/Package.swift` by hand. |
| `android/**` | `npm run verify -w android` | Needs JDK 21. Runs Gradle `clean lint build test` for `:capacitor-android`. Lint treats warnings as errors. |
| `android-template/`, `ios-spm-template/`, `ios-pods-template/` | `npm run build -w cli` then `npm test -w cli` | Templates ship through the CLI. New template files must be `git add`-ed, or they are silently left out of the package. |
| anything | `npm run lint` | ESLint, Prettier check, SwiftLint and a check that `ios/Package.swift` is up to date. `npm run fmt` fixes most findings automatically. |

#### Writing new tests

* **A bug fix needs a regression test** that fails without the fix, unless the code cannot be tested with the existing infrastructure. If you cannot add one, say why in the PR. A change that only fixes lint or formatting, or only touches tooling, docs or CI, does not need a regression test.
* **A new feature needs tests for the new behavior**, including at least one failure or edge case.
* Put tests next to the existing tests for that area and copy their style:
    * `core`: Jest specs in `core/src/tests/` (`*.spec.ts`).
    * `cli`: Jest specs in `cli/test/` (`*.spec.ts`).
    * `ios`: XCTest tests in `ios/Tests/CapacitorTests/` (Swift) and `ios/Tests/CapacitorObjCTests/` (Objective-C).
    * `android`: JUnit tests in `android/capacitor/src/test/`; instrumented tests in `android/capacitor/src/androidTest/`.
* Tests must be deterministic and must not need network access, a device or an emulator unless the existing tests in that area already do.
* Do not delete, skip or weaken an existing test to make your change pass. If an existing test is wrong, explain why in the PR.

CI (`.github/workflows/ci.yml`) runs lint, `test-core`, `test-cli`, `test-ios` and `test-android` on every PR. All of them must be green before merge.

### Changelog and versioning

**Do not edit any `CHANGELOG.md` and do not bump any version number.** Both are generated by Lerna from commit messages when maintainers cut a release. The changelog entry for your change is your PR's squashed commit message, which is why the PR title format matters. For the same reason, do not edit `lerna.json` or the `version` field of any `package.json`.

The version bump follows from the commit type (see the table in [Commit messages](#commit-messages)):

* **patch**: `fix`
* **minor**: `feat`
* **major**: a commit with a `BREAKING CHANGE:` footer, which a maintainer adds at merge from your PR description. A `!` in the title alone is not read by Lerna. Majors are released from `next`.

If your change affects documented user-facing behavior (config options, CLI flags, public APIs), the documentation lives in a separate repository: open a companion PR to [`ionic-team/capacitor-docs`](https://github.com/ionic-team/capacitor-docs) and link it from your PR.

### Opening the pull request

1. Push your branch to your fork and open the PR against the [correct target branch](#choosing-the-target-branch).
2. **Title:** exactly the commit message you want in the changelog, in the [Conventional Commit format](#commit-messages), for example `fix(android): skip lifecycle events when the Capacitor bridge is not present`.
3. **Description:** use the following template and fill in every section. Delete the HTML comments. Write "N/A" for sections that do not apply rather than removing them.

```markdown
## Description
<!--- Describe your changes in detail -->

## Change Type
- [ ] Fix
- [ ] Feature
- [ ] Refactor
- [ ] Breaking Change
- [ ] Documentation
- [ ] Other (CI, chores, etc.)

## Rationale / Problems Fixed
<!--- Why is this PR needed, or what problem does it fix? -->
<!--- Link related issues or discussions. Use "Fixes #1234" so the issue closes on merge. -->
<!--- If there is no issue, write "No related issue" and a one-line reason (for example, a small chore). -->

## Tests or Reproductions
<!--- Which tests did you add or run, and with what result? -->
<!--- Or link a minimal project that can be used to validate the change. -->

## Screenshots / Media
<!--- (Optional) screenshots, videos or other files relevant to the PR -->

## Platforms Affected
- [ ] Android
- [ ] iOS
- [ ] Web

## Notes / Comments
<!--- Anything else the reviewers should know -->
<!--- Breaking change? Add a paragraph starting with "BREAKING CHANGE:" explaining what breaks and how to migrate. -->
```

4. **Required checks:** all CI jobs must pass (`lint`, `test-core`, `test-cli`, `test-ios`, `test-android`). If one fails for a reason unrelated to your change, say so in a comment. Do not disable or edit CI to get green.
5. **Review:** a maintainer reviews every PR and squash-merges it once approved. Respond to every review comment, either with a change or with a reason. Push follow-up commits instead of force-pushing over a review in progress.
6. **Disclose AI assistance.** If an AI tool wrote or substantially shaped the change, say so in the "Notes / Comments" section of the PR description (for example, "AI assistance: written with <tool>; the commands listed under Tests were run; a human has not yet reviewed it", adjusting it to what is true). You remain responsible for the change: you must have read, understood and run all of it, and you must be able to answer review questions about it.

### Review rubric

Reviewers check the following, roughly in this order. Check them yourself first.

1. **Right branch, right size.** Correct target branch; one logical change; no drive-by refactors or formatting churn.
2. **Discussed.** Large changes were agreed in advance.
3. **Conventional title.** The PR title is a valid Conventional Commit. For breaking changes it has `!` after the scope, and the PR description has a `BREAKING CHANGE:` paragraph for the maintainer to add at merge.
4. **Tests.** A regression test for fixes, new tests for features, and the relevant suites from [Which tests to run](#which-tests-to-run) were run, with results reported.
5. **CI green.** Including lint: no new Android lint warnings (they fail the build) and no new SwiftLint violations. Pre-existing failures are listed in the PR, not silently fixed or ignored.
6. **Generated files are regenerated, not hand-edited, and none is missing.** The `native-bridge.js` copies, `ios/Package.swift` and the `core/*.md` plugin docs.
7. **No dead code left behind.** If your change makes code obsolete, remove it, including related checks and handlers elsewhere. Reviewers regularly ask for this.
8. **Cross-platform consistency.** If the behavior exists on Android, iOS and web, the PR changes all of them or explains why not.
9. **Bridge correctness.** Every plugin call is resolved or rejected exactly once (unless `keepAlive` is set), the plugin queue is never blocked, and only JSON-representable values cross the bridge.
10. **Edge cases.** Empty results, a missing bridge or configuration, and older OS versions are handled. Reviewers regularly ask "what happens if this is empty or absent?".
11. **No new dependencies.** See [Before you start](#before-you-start).
12. **Useful comments and docs.** Comments explain non-obvious constraints, not what the code already says. User-facing changes link a docs PR.

Common reasons PRs are sent back or closed:

* opened against `main` when the change is breaking (or against `next` when it is not);
* breaking change with no `BREAKING CHANGE:` paragraph in the PR description (a `!` alone does not reach the changelog or trigger a major), or with `!` before the scope (`feat!(cli):`) instead of after it;
* edited `CHANGELOG.md` or a version number by hand;
* changed `core/native-bridge.ts` without rebuilding and committing the generated `native-bridge.js` files;
* edited `ios/Package.swift` directly instead of the root `Package.swift`;
* added a dependency, or a new public API, without prior discussion;
* no tests, or tests that don't fail without the fix;
* unrelated changes mixed into one PR;
* an unverified claim in the description (for example "tested on iOS" when it was not).

### Pre-PR checklist

Tick each item before you open the PR.

- [ ] A bug has an issue with a reproduction (or the PR says "No related issue" and why), and large changes were agreed with the team
- [ ] Branched from the latest remote `upstream/main` or `upstream/next`, chosen with [Which branch do I start from?](#which-branch-do-i-start-from)
- [ ] The change is one logical change, with no unrelated edits
- [ ] No new dependencies, no hand-edited generated files, no `CHANGELOG.md` or version edits
- [ ] Regression or new tests added (unless the change is exempt: lint, formatting, tooling, docs or CI only)
- [ ] Ran the commands from [Which tests to run](#which-tests-to-run) for every touched area, plus the lint steps, and your change adds no new failures or warnings (list any pre-existing failures in the PR; see [Local setup](#local-setup))
- [ ] Regenerated and committed generated files (`native-bridge.js`, `ios/Package.swift`, `core/*.md`) where needed
- [ ] PR title is a valid Conventional Commit, with `!` after the scope, and a `BREAKING CHANGE:` paragraph in the PR description, if breaking
- [ ] PR description template filled in, including tests run and platforms affected
- [ ] AI assistance disclosed, if applicable

### Repositories

* [Capacitor](https://github.com/ionic-team/capacitor) (this repo): Core Capacitor platforms, CLI, and APIs
* [Capacitor Plugins](https://github.com/ionic-team/capacitor-plugins): Official Capacitor plugins
* [Capacitor Community](https://github.com/capacitor-community/): GitHub org for Capacitor Community plugins and platforms
* [Capacitor Docs](https://github.com/ionic-team/capacitor-docs): Capacitor online documentation
* [Capacitor TestApp](https://github.com/ionic-team/capacitor-testapp): Test app used by the core team for developing Capacitor

### Directory structure

This monorepo contains core Capacitor components. The npm workspaces are `android`, `ios`, `cli` and `core`; everything else is a template or tooling. The current directory structure looks like this:

* `android`: Capacitor Android Runtime
* `android-template`: Default Android App installed by the CLI
* `cli`: Capacitor CLI/Build scripts
* `core`: Capacitor Core JS library
* `ios`: Capacitor iOS Runtime
* `ios-pods-template`: Default iOS CocoaPods App installed by the CLI
* `ios-spm-template`: Default iOS SPM App installed by the CLI
* `scripts`: asset packing, version sync and publishing tooling

For how the runtime works (bridge internals, message formats, build pipeline) see [`ARCHITECTURE.md`](./ARCHITECTURE.md).
