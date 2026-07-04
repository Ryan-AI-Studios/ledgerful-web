import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { findPositioningViolations } from "./lib/positioning-terms.mjs";

const roots = ["src/app", "src/components", "src/lib/content"];
const includedExtensions = /\.(?:[cm]?[jt]sx?|mdx?|json|txt)$/i;

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile() && includedExtensions.test(entry.name)) {
      files.push({
        path: relative(process.cwd(), path).replaceAll("\\", "/"),
        content: await readFile(path, "utf8"),
      });
    }
  }

  return files;
}

const files = (
  await Promise.all(roots.map((root) => collectFiles(resolve(root))))
).flat();
const violations = findPositioningViolations(files);

if (violations.length > 0) {
  console.error("Positioning vocabulary check failed:");
  for (const violation of violations) {
    console.error(
      `- ${violation.path}:${violation.line} [${violation.term}] ${violation.excerpt}`,
    );
  }
  process.exit(1);
}

console.log(`Positioning vocabulary check passed (${files.length} files).`);
