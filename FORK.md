# T3 Math

T3 Math is a fork of [T3 Code](https://github.com/pingdotgg/t3code) that adds opt-in LaTeX
rendering to chat. Turn it on under Settings > Appearance. Everything else is upstream, unchanged.

It is not affiliated with or supported by the T3 Code team. Report problems with T3 Math
[here](../../issues), not upstream.

## What differs from upstream

- LaTeX rendering from [pingdotgg/t3code#14574](https://github.com/pingdotgg/t3code/pull/14574)
  by Hjalmar Karlsen, merged at `2d2a16f4`.
- The desktop app is named "T3 Math".
- [`.github/workflows/t3-math-release.yml`](.github/workflows/t3-math-release.yml) and this file.

The app ID and the `t3code://` URL scheme are upstream's, so T3 Connect sign-in works and the app
shares `~/.t3` with T3 Code. Install one or the other, not both.

## Branches and builds

| Branch         | Follows                     | Release               |
| -------------- | --------------------------- | --------------------- |
| `math`         | upstream `main`             | prerelease            |
| `math-nightly` | latest upstream nightly tag | marked latest         |
| `main`         | untouched upstream mirror   | none                  |

Every Monday the release workflow merges each upstream target into its branch, runs the math
tests, builds an unsigned macOS arm64 DMG, and publishes it under
[Releases](../../releases). Run it by hand from the Actions tab to build sooner.

Builds are unsigned and carry no update feed. Download the new DMG to update. On first launch,
right-click the app and choose Open.

## When a merge conflicts

A conflict in `pnpm-lock.yaml` alone is resolved automatically. Anything else fails the run and
opens an issue listing the files. Merge the upstream commit into the branch by hand, push, and
rerun the workflow.
