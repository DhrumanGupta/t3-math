// @effect-diagnostics nodeBuiltinImport:off - electron-builder calls this hook outside Effect.
import * as NodeChildProcess from "node:child_process";
import * as NodePath from "node:path";

import { sign as signApplication, type SignOptions } from "@electron/osx-sign";

// T3 Math signs its macOS apps ad hoc. An ad hoc signature's designated
// requirement defaults to the bundle's own hash, which every build changes, so
// the updater would reject each new build as a different app. The app bundle
// requires its bundle identifier instead. Nested code keeps the default.
export default async function sign(options: SignOptions): Promise<void> {
  const bundleId = NodeChildProcess.execFileSync(
    "/usr/bin/plutil",
    ["-extract", "CFBundleIdentifier", "raw", NodePath.join(options.app, "Contents/Info.plist")],
    { encoding: "utf8" },
  ).trim();
  const optionsForFile = options.optionsForFile;
  await signApplication({
    ...options,
    batchCodesignCalls: true,
    optionsForFile: (filePath, context) => ({
      ...optionsForFile?.(filePath, context),
      ...(filePath === options.app
        ? { requirements: `=designated => identifier "${bundleId}"` }
        : {}),
    }),
  });
}
