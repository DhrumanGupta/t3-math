# Running T3 Math

T3 Math is not signed with a paid developer certificate, so macOS and Windows warn you the first
time you open it. The steps below get you past that warning. You only need to do them once per
install.

Download the installer for your system from the
[latest release](https://github.com/DhrumanGupta/t3-math/releases/latest).

| System               | File                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| macOS, Apple Silicon | `T3-Math-<version>-arm64.dmg`                                        |
| macOS, Intel         | `T3-Math-<version>-x64.dmg`                                          |
| Windows, x64         | `T3-Math-<version>-x64.exe`                                          |
| Windows, ARM         | `T3-Math-<version>-arm64.exe`                                        |
| Linux, x64           | `T3-Math-<version>-x86_64.AppImage` or `T3-Math-<version>-amd64.deb` |
| Linux, ARM           | `T3-Math-<version>-arm64.AppImage` or `T3-Math-<version>-arm64.deb`  |

## macOS

1. Open the `.dmg` and drag **T3 Math** to **Applications**.
2. Open T3 Math from Applications. macOS shows **"T3 Math" Not Opened**, saying Apple could not
   verify it is free of malware. Click **Done**. Do not click Move to Bin.
3. Open **System Settings → Privacy & Security** and scroll down to **Security**. Next to the
   message that T3 Math was blocked, click **Open Anyway**.
4. Confirm with **Open Anyway** again and enter your password or use Touch ID.

T3 Math opens, and macOS does not ask again for this install.

If macOS instead says T3 Math **is damaged and can't be opened**, or you would rather skip the
steps above, run this in Terminal and open the app again:

```sh
xattr -dr com.apple.quarantine "/Applications/T3 Math.app"
```

## Windows

1. Run the `.exe` installer.
2. On the **Windows protected your PC** prompt, click **More info**, then **Run anyway**.
3. Finish the installer and open T3 Math from the Start menu.

## Linux

- **Debian or Ubuntu:** install the `.deb` with `sudo apt install ./T3-Math-<version>-<arch>.deb`.
- **Other distributions:** make the AppImage executable and run it:

  ```sh
  chmod +x T3-Math-<version>-<arch>.AppImage
  ./T3-Math-<version>-<arch>.AppImage
  ```

## After installing

- **Math rendering** is on by default. Turn it off with **Render math** under Settings →
  Appearance.
- **Updates:** T3 Math updates itself. A new build is published every week; the app downloads
  it and installs it when you restart. Older builds say "no update feed is configured" in
  Settings; install the latest build by hand once to get updates.
- **Update track:** leave **Update track** in Settings on **Stable**. Each install follows the
  track it was downloaded from (main or nightly); to switch, install a build from the other
  track.
- **Next to T3 Code:** T3 Math keeps its data in `~/.t3-math`, so it can be installed alongside
  T3 Code. It starts with its own empty history and settings.

The macOS steps were checked on Apple Silicon. The Windows and Linux steps are the standard ones
for unsigned apps and have not been tested on these builds; please
[report a problem](https://github.com/DhrumanGupta/t3-math/issues) if they don't work.
