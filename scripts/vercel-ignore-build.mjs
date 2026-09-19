#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const previous = process.env.VERCEL_GIT_PREVIOUS_SHA?.trim();
const current = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || "HEAD";

function build() {
  console.log("[relyo] Relevant app change or unknown diff base: run Vercel build.");
  process.exit(1);
}

if (!previous || /^0+$/.test(previous)) build();

const workspaceRoots = ["apps", "packages"];
const packages = new Map();

for (const root of workspaceRoots) {
  let entries = [];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    continue;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      if (typeof pkg.name === "string") packages.set(pkg.name, { dir, pkg });
    } catch {
      // Non-package directories are irrelevant to the workspace graph.
    }
  }
}

const required = new Set(["@relyo/web"]);
const queue = ["@relyo/web"];

while (queue.length) {
  const name = queue.shift();
  const item = packages.get(name);
  if (!item) continue;
  const fields = [
    item.pkg.dependencies,
    item.pkg.optionalDependencies,
    item.pkg.peerDependencies,
  ];
  for (const field of fields) {
    for (const dep of Object.keys(field ?? {})) {
      if (packages.has(dep) && !required.has(dep)) {
        required.add(dep);
        queue.push(dep);
      }
    }
  }
}

const paths = [
  "apps/web",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "vercel.json",
  ".vercel-deploy-trigger",
  "scripts/vercel-ignore-build.mjs",
];

for (const name of required) {
  const item = packages.get(name);
  if (item && item.dir !== "apps/web") paths.push(item.dir);
}

const diff = spawnSync("git", ["diff", "--quiet", previous, current, "--", ...paths], {
  stdio: "inherit",
});

if (diff.status === 0) {
  console.log("[relyo] No web/transitive dependency change: skip Vercel build to preserve Hobby quota.");
  process.exit(0);
}

if (diff.status === 1) build();

console.warn("[relyo] Could not determine affected files safely; building instead.");
process.exit(1);
