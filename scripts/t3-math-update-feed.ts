#!/usr/bin/env node
// @effect-diagnostics nodeBuiltinImport:off globalConsole:off - runs before dependencies are installed.

// Merge per-architecture manifests and point the updates branch at release assets.

import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

import {
  mergeUpdateManifests,
  parseUpdateManifest,
  serializeUpdateManifest,
} from "./lib/update-manifest.ts";

const [assetsDir, feedDir, downloadUrl, track] = process.argv.slice(2);
if (!assetsDir || !feedDir || !downloadUrl || (track !== "main" && track !== "nightly")) {
  console.error(
    "Usage: t3-math-update-feed.ts <assets dir> <feed dir> <release download URL> <main|nightly>",
  );
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
  if (only && rest.length === 0) return NodeFS.readFileSync(NodePath.join(dir, only), "utf8");
  const manifest = sources
    .map((source) =>
      parseUpdateManifest(NodeFS.readFileSync(NodePath.join(dir, source), "utf8"), source, label),
    )
    .reduce((merged, next) => mergeUpdateManifests(merged, next, label));
  return serializeUpdateManifest(manifest, { platformLabel: label });
}

NodeFS.mkdirSync(feedDir, { recursive: true });
for (const feed of feeds) {
  const sources = feed.sources.filter((source) =>
    NodeFS.existsSync(NodePath.join(assetsDir, source)),
  );
  if (sources.length === 0) {
    // The platform did not build. Its feed keeps pointing at the last release.
    console.log(`Skipping ${feed.name}: no ${feed.label} build.`);
    continue;
  }

  const manifest = readFeed(assetsDir, sources, feed.label).replace(
    /^(  - url: |path: )'?([^'\n]+?)'?$/gm,
    (_line, key: string, file: string) => {
      if (!NodeFS.existsSync(NodePath.join(assetsDir, file))) {
        throw new Error(`${feed.name} lists ${file}, which is not a release asset.`);
      }
      return `${key}${downloadUrl}/${encodeURIComponent(file)}`;
    },
  );
  const version = parseUpdateManifest(manifest, feed.name, feed.label).version;
  if ((track === "nightly") !== /-nightly\.\d{8}\.\d+$/.test(version)) {
    throw new Error(`${version} does not belong to the ${track} release track.`);
  }
  const name = feed.name.replace(/^latest/, track === "nightly" ? "nightly" : "latest");
  NodeFS.writeFileSync(NodePath.join(feedDir, name), manifest);
  console.log(`Wrote ${name} from ${sources.join(", ")}.`);
}
