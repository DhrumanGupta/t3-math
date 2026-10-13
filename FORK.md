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
- The desktop app is named "T3 Math" and installers are named `T3-Math-…`.
- `README.md` starts with the notice in
  [`.github/t3-math-readme-header.md`](.github/t3-math-readme-header.md).
- [`t3-math-sync.yml`](.github/workflows/t3-math-sync.yml),
  [`t3-math-build.yml`](.github/workflows/t3-math-build.yml) and this file.

The app ID and the `t3code://` URL scheme are upstream's, so T3 Connect sign-in works and the app
shares `~/.t3` with T3 Code. Install one or the other, not both.

## Branches and builds

| Branch         | Follows                     | Release               |
| -------------- | --------------------------- | --------------------- |
| `math`         | upstream `main`             | prerelease            |
| `math-nightly` | latest upstream nightly tag | marked latest         |
| `main`         | untouched upstream mirror   | none                  |

Every Monday the sync workflow merges each upstream target into its branch, runs the math tests,
pushes the branch, and starts the build workflow on it. The build packages unsigned apps for macOS
(arm64, x64), Linux (x64, arm64; AppImage and `.deb`) and Windows (x64, arm64) with upstream's own
`release-desktop.yml`, then publishes them under [Releases](../../releases). Run the sync workflow
by hand from the Actions tab to build sooner.

Builds are unsigned and carry no update feed. Download the new installer to update. On macOS,
right-click the app and choose Open on first launch.

## When a merge conflicts

Conflicts in `pnpm-lock.yaml` and `README.md` are resolved automatically: the lockfile is
regenerated, and the README becomes the T3 Math notice followed by upstream's latest README. Anything else fails the run and
opens an issue listing the files. Merge the upstream commit into the branch by hand, push, and
rerun the sync workflow.
