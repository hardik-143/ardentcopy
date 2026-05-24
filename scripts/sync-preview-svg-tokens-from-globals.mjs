#!/usr/bin/env node
/**
 * Injects theme tokens from utils/ui/styles/globals.css into
 * studio/static/preview-*.svg (standalone SVGs cannot load the web CSS).
 *
 * Source of truth: :root { ... } and .dark { ... } in globals.css.
 * Appends --preview-hero-* / --preview-icon-circle from .dark for hero wireframes.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const globalsPath = join(repoRoot, "utils/ui/styles/globals.css");
const staticDir = join(repoRoot, "studio/static");

/**
 * @param {string} css
 * @param {RegExp} openRe  e.g. /:root\s*\{/ — must not match inside @custom-variant (.dark *)
 */
function extractBlockInner(css, openRe) {
  const open = openRe.exec(css);
  if (!open) {
    throw new Error(`sync-preview-svg-tokens: missing block opening ${openRe} in globals.css`);
  }
  const braceStart = open.index + open[0].length - 1;
  if (css[braceStart] !== "{") {
    throw new Error("sync-preview-svg-tokens: internal error locating opening brace");
  }
  let depth = 0;
  for (let i = braceStart; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return css.slice(braceStart + 1, i).trim();
      }
    }
  }
  throw new Error(`sync-preview-svg-tokens: unclosed block for ${openRe}`);
}

/**
 * @param {string} body
 * @returns {Map<string, string>}
 */
function parseCustomProperties(body) {
  const stripped = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const map = new Map();
  for (const part of stripped.split(";")) {
    const line = part.trim().replace(/\s+/g, " ");
    if (!line) {
      continue;
    }
    const m = /^(--[\w-]+)\s*:\s*(.+)$/u.exec(line);
    if (m) {
      map.set(m[1], m[2].trim());
    }
  }
  return map;
}

function requireVar(map, name) {
  const v = map.get(name);
  if (!v) {
    throw new Error(`sync-preview-svg-tokens: missing ${name} in globals.css theme block`);
  }
  return v;
}

function buildSvgStyleSheet(lightInner, darkMap) {
  const heroFromDark = [
    `    --preview-hero-bg: ${requireVar(darkMap, "--background")};`,
    `    --preview-hero-fg: ${requireVar(darkMap, "--foreground")};`,
    `    --preview-hero-muted: ${requireVar(darkMap, "--muted-foreground")};`,
    `    --preview-icon-circle: ${requireVar(darkMap, "--card")};`,
  ].join("\n");

  const indentedLight = lightInner
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `    ${line}`)
    .join("\n");

  const inner = `${indentedLight}\n${heroFromDark}`;

  return `<style>
    :root {
${inner}
    }
    text {
      font-family: var(--font-sans), system-ui, sans-serif;
    }
  </style>`;
}

function main() {
  const css = readFileSync(globalsPath, "utf8");
  const lightInner = extractBlockInner(css, /:root\s*\{/);
  const darkInner = extractBlockInner(css, /\.dark\s*\{/);
  const darkMap = parseCustomProperties(darkInner);
  const styleBlock = buildSvgStyleSheet(lightInner, darkMap);

  const files = readdirSync(staticDir).filter(
    (f) => f.startsWith("preview-") && f.endsWith(".svg")
  );

  const styleRe = /<style>[\s\S]*?<\/style>/u;
  let updated = 0;
  for (const name of files) {
    const path = join(staticDir, name);
    const svg = readFileSync(path, "utf8");
    if (!styleRe.test(svg)) {
      throw new Error(`sync-preview-svg-tokens: no <style> block in ${name}`);
    }
    const next = svg.replace(styleRe, styleBlock);
    writeFileSync(path, next, "utf8");
    updated++;
  }

  process.stdout.write(
    `sync-preview-svg-tokens: updated ${updated} SVG(s) from globals.css\n`
  );
}

main();
