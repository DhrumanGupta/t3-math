# T3 Math: T3 Code with LaTeX rendering

> [!IMPORTANT]
> **This is an unofficial fork of [T3 Code](https://github.com/pingdotgg/t3code) that renders LaTeX math in chat.**
>
> **It is updated from upstream every week.** Each Monday it merges the latest T3 Code, rebuilds, and publishes desktop apps for macOS, Linux and Windows.
>
> **[Download the latest build](https://github.com/DhrumanGupta/t3-math/releases/latest)** · [What differs from upstream](FORK.md) · [Report a problem](https://github.com/DhrumanGupta/t3-math/issues)
>
> T3 Math is not affiliated with or supported by the T3 Code team. Everything below this notice is upstream's README, unchanged.

## Installing T3 Math

T3 Math is not signed with a paid developer certificate, so your system warns you the first time you open it.

- **macOS:** download the `.dmg` (`arm64` for Apple Silicon, `x64` for Intel) and drag T3 Math to Applications. When macOS blocks it, open System Settings → Privacy & Security and click **Open Anyway**. If macOS says the app is damaged, run this in Terminal and open it again:

  ```sh
  xattr -dr com.apple.quarantine "/Applications/T3 Math.app"
  ```

- **Windows:** run the `.exe` installer. On the SmartScreen prompt, click **More info**, then **Run anyway**.
- **Linux:** install the `.deb`, or make the `.AppImage` executable with `chmod +x` and run it.

T3 Math does not update itself. Download the new build each week to stay current. It keeps its data in `~/.t3-math`, so it can be installed next to T3 Code.

---

