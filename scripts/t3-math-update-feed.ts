#!/usr/bin/env node
// @effect-diagnostics nodeBuiltinImport:off globalConsole:off - runs before dependencies are installed.

// Writes one T3 Math track's update feed from the manifests its build jobs
// uploaded. The macOS and Windows jobs write one manifest per arch and
// electron-updater reads one per platform, so they are merged, as in upstream's
// release.yml. The feed lives on the `updates` branch, so every download points
// at the GitHub release instead.
//
//   node scripts/t3-math-update-feed.ts <assets dir> <feed dir> <release download URL>

import * as fs from "node:fs";
import * as path from "node:path";

import {
  mergeUpdateManifests,
  parseUpdateManifest,
  serializeUpdateManifest,
} from "./lib/update-manifest.ts";

const [assetsDir, feedDir, downloadUrl] = process.argv.slice(2);
if (!assetsDir || !feedDir || !downloadUrl) {
  console.error("Usage: t3-math-update-feed.ts <assets dir> <feed dir> <release download URL>");
  process.exit(1);
}

// Each feed manifest and the per-arch manifests it is made from. Upstream only
// merges the macOS and Windows ones; Linux has one manifest per arch already.
const feeds = [
  { name: "latest-mac.yml", label: "macOS", sources: ["latest-mac.yml", "latest-mac-x64.yml"] },
  { name: "latest.yml", label: "Windows", sources: ["latest-win-x64.yml", "latest-win-arm64.yml"] },
  { name: "latest-linux.yml", label: "Linux", sources: ["latest-linux.yml"] },
  { name: "latest-linux-arm64.yml", label: "Linux", sources: ["latest-linux-arm64.yml"] },
];

function readFeed(dir: string, sources: ReadonlyArray<string>, label: string): string {
  const [only, ...rest] = sources;
  if (only && rest.length === 0) return fs.readFileSync(path.join(dir, only), "utf8");
  const manifest = sources
    .map((source) =>
      parseUpdateManifest(fs.readFileSync(path.join(dir, source), "utf8"), source, label),
    )
    .reduce((merged, next) => mergeUpdateManifests(merged, next, label));
  return serializeUpdateManifest(manifest, { platformLabel: label });
}

fs.mkdirSync(feedDir, { recursive: true });
for (const feed of feeds) {
  const sources = feed.sources.filter((source) => fs.existsSync(path.join(assetsDir, source)));
  if (sources.length === 0) {
    // The platform did not build. Its feed keeps pointing at the last release.
    console.log(`Skipping ${feed.name}: no ${feed.label} build.`);
    continue;
  }

  const manifest = readFeed(assetsDir, sources, feed.label).replace(
    /^(  - url: |path: )'?([^'\n]+?)'?$/gm,
    (_line, key: string, file: string) => {
      if (!fs.existsSync(path.join(assetsDir, file))) {
        throw new Error(`${feed.name} lists ${file}, which is not a release asset.`);
      }
      return `${key}${downloadUrl}/${encodeURIComponent(file)}`;
    },
  );
  fs.writeFileSync(path.join(feedDir, feed.name), manifest);
  console.log(`Wrote ${feed.name} from ${sources.join(", ")}.`);
}
