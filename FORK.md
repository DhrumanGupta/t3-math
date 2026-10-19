# T3 Math

T3 Math is a fork of [T3 Code](https://github.com/pingdotgg/t3code) that adds opt-in LaTeX
rendering to chat, on by default. Turn it off with **Render math** under Settings → Appearance.
Everything else is upstream, unchanged.

It is not affiliated with or supported by the T3 Code team. Report problems with T3 Math
[here](../../issues), not upstream.

## What differs from upstream

- LaTeX rendering from [pingdotgg/t3code#14574](https://github.com/pingdotgg/t3code/pull/14574)
  by Hjalmar Karlsen, merged at `2d2a16f4`.
- Math rendering is on by default.
- The desktop app is named "T3 Math", has its own icon (`assets/math/`) and its own app ID
  (`com.dhrumangupta.t3math`), and installers are named `T3-Math-…`.
- Data lives in `~/.t3-math`, and remote servers are updated to the matching upstream nightly.
- `README.md` starts with the notice in
  [`.github/t3-math-readme-header.md`](.github/t3-math-readme-header.md).
- [`RUNNING_INSTRUCTIONS.md`](RUNNING_INSTRUCTIONS.md), the install and first-launch steps.
- Builds follow the T3 Math update feed instead of upstream's (`resolveT3MathUpdateFeed` in
  `scripts/build-desktop-artifact.ts`), and macOS builds are signed by
  `scripts/sign-macos-adhoc.ts`.
- [`t3-math-sync.yml`](.github/workflows/t3-math-sync.yml),
  [`t3-math-build.yml`](.github/workflows/t3-math-build.yml),
  `scripts/t3-math-update-feed.ts` and this file.

T3 Math keeps its data in `~/.t3-math` and its own Electron profile (`t3math`), so it does not
read or change T3 Code's threads and settings, and both apps can be installed side by side. The
`t3code://` URL scheme is still upstream's, so T3 Connect sign-in works.

Remote hosts run upstream's server. T3 Math updates them to the upstream nightly it was synced
against (`T3_MATH_SERVER_VERSION` at build time), because its own version is never published to
npm or upstream's releases.

## Branches and builds

| Branch         | Follows                     | Release       |
| -------------- | --------------------------- | ------------- |
| `math`         | upstream `main`             | prerelease    |
| `math-nightly` | latest upstream nightly tag | marked latest |
| `main`         | untouched upstream mirror   | none          |

Every Monday the sync workflow merges each upstream target into its branch, runs the math tests,
pushes the branch, and starts the build workflow on it. The build packages apps for macOS
(arm64, x64), Linux (x64, arm64; AppImage and `.deb`) and Windows (x64, arm64) with upstream's own
`release-desktop.yml`, then publishes them under [Releases](../../releases). Run the sync workflow
by hand from the Actions tab to build sooner.

Installed apps update themselves. Each track has its own feed on the `updates` branch
(`main/` and `nightly/`), which the build workflow points at each new release; the apps keep
upstream's "latest" channel, so leave **Update track** on Stable. The apps are not signed with a
developer certificate, so macOS and Windows block them on first launch.
[RUNNING_INSTRUCTIONS.md](RUNNING_INSTRUCTIONS.md) has the steps to open them on each system.
The macOS apps are signed ad hoc with a requirement on their bundle identifier, so the updater
accepts each new build as the same app.

## When a merge conflicts

Conflicts in `pnpm-lock.yaml` and `README.md` are resolved automatically: the lockfile is
regenerated, and the README becomes the T3 Math notice followed by upstream's latest README. Anything else fails the run and
opens an issue listing the files. Merge the upstream commit into the branch by hand, push, and
rerun the sync workflow.
