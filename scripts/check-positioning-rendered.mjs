import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { parse } from "parse5";
import { findPositioningViolations } from "./lib/positioning-terms.mjs";

const outputRoot = resolve(".next/server/app");

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

function renderedText(html) {
  const document = parse(html);
  const text = [];
  const stack = [document];

  while (stack.length > 0) {
    const node = stack.pop();
    if (node.nodeName === "#text") text.push(node.value);
    if (
      node.childNodes &&
      node.tagName !== "script" &&
      node.tagName !== "style"
    ) {
      stack.push(...node.childNodes);
    }
  }

  return text.reverse().join("\n");
}

const files = await Promise.all(
  (await collectHtmlFiles(outputRoot)).map(async (path) => ({
    path: relative(process.cwd(), path).replaceAll("\\", "/"),
    content: renderedText(await readFile(path, "utf8")),
  })),
);
const violations = findPositioningViolations(files);

if (violations.length > 0) {
  console.error("Rendered positioning vocabulary check failed:");
  for (const violation of violations) {
    console.error(
      `- ${violation.path}:${violation.line} [${violation.term}] ${violation.excerpt}`,
    );
  }
  process.exit(1);
}

console.log(
  `Rendered positioning vocabulary check passed (${files.length} pages).`,
);
