// @effect-diagnostics nodeBuiltinImport:off - Runs the release CLI against disposable on-disk assets.
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import { assert, it } from "@effect/vitest";

import { parseUpdateManifest } from "./lib/update-manifest.ts";

it("publishes both updater channels for every platform with the same release assets", () => {
  const root = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "t3-math-feed-"));
  try {
    const assets = NodePath.join(root, "assets");
    const feed = NodePath.join(root, "feed");
    NodeFS.mkdirSync(assets);
    const sources = [
      ["latest-mac.yml", "arm64.zip"],
      ["latest-mac-x64.yml", "x64.zip"],
      ["latest-win-x64.yml", "x64.exe"],
      ["latest-win-arm64.yml", "arm64.exe"],
      ["latest-linux.yml", "x64.AppImage"],
      ["latest-linux-arm64.yml", "arm64.AppImage"],
    ] as const;
    for (const [name, asset] of sources) {
      NodeFS.writeFileSync(NodePath.join(assets, asset), "asset");
      NodeFS.writeFileSync(
        NodePath.join(assets, name),
        `version: '0.1.3-preview.20261026.11'
files:
  - url: ${asset}
    sha512: checksum-${asset}
    size: 5
releaseDate: '2026-10-26T11:35:15.103Z'
`,
      );
    }
    const downloadUrl = "https://github.com/example/fork/releases/download/test";
    const result = NodeChildProcess.spawnSync(
      process.execPath,
      [NodePath.join(import.meta.dirname, "t3-math-update-feed.ts"), assets, feed, downloadUrl],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);

    for (const [suffix, expectedAssets] of [
      ["-mac", ["arm64.zip", "x64.zip"]],
      ["", ["x64.exe", "arm64.exe"]],
      ["-linux", ["x64.AppImage"]],
      ["-linux-arm64", ["arm64.AppImage"]],
    ] as const) {
      const latest = NodeFS.readFileSync(NodePath.join(feed, `latest${suffix}.yml`), "utf8");
      const nightly = NodeFS.readFileSync(NodePath.join(feed, `nightly${suffix}.yml`), "utf8");
      assert.equal(nightly, latest);
      const manifest = parseUpdateManifest(nightly, `nightly${suffix}.yml`, "test");
      assert.equal(manifest.version, "0.1.3-preview.20261026.11");
      assert.deepStrictEqual(
        manifest.files,
        expectedAssets.map((asset) => ({
          url: `${downloadUrl}/${asset}`,
          sha512: `checksum-${asset}`,
          size: 5,
        })),
      );
    }
  } finally {
    NodeFS.rmSync(root, { recursive: true, force: true });
  }
});
