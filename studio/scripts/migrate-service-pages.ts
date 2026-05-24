/**
 * Scrapes service pages from ardentcarpet.com and patches the matching Sanity
 * page documents (matched by lowercase slug).
 *
 * Sections scraped per page:
 *   #banner     → heroPrimary block
 *   #about      → richTextSection block
 *   .spotlights → contentList block
 *   #process    → richTextSection block
 *   #cost       → richTextSection block (with buttonsGroup)
 *
 * Run from studio:
 *   pnpm exec sanity exec scripts/migrate-service-pages.ts --with-user-token
 *
 * One-time setup:
 *   pnpm exec playwright install chromium
 */

import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const SERVICE_URLS = [
  "https://ardentcarpet.com/Commercial/",
  "https://ardentcarpet.com/Upholstery/",
  "https://ardentcarpet.com/TileCleaning/",
  "https://ardentcarpet.com/Restretching/",
  "https://ardentcarpet.com/CarpetCleaning/",
  "https://ardentcarpet.com/CarpetRepair/",
];

// ─── helpers ───────────────────────────────────────────────────────────────

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

async function uploadImage(imageUrl: string, alt: string) {
  console.log(`    Uploading: ${imageUrl}`);
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch ${imageUrl}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const filename = imageUrl.split("/").pop()?.split("?")[0] ?? "image.jpg";
  const asset = await client.assets.upload("image", buffer, { filename, contentType });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

// ─── slug map + link resolution ────────────────────────────────────────────

type PageSlugMap = Map<string, string>;
let slugMapCache: Promise<PageSlugMap> | null = null;

async function getPageSlugMap(): Promise<PageSlugMap> {
  if (!slugMapCache) {
    slugMapCache = client
      .fetch<Array<{ _id: string; slug?: { current?: string } | null }>>(
        `*[_type == "page" && defined(slug.current)]{_id, slug}`
      )
      .then((pages) => {
        const map = new Map<string, string>();
        for (const p of pages) {
          const c = p.slug?.current;
          if (c) map.set(c.toLowerCase(), p._id);
        }
        console.log(`Loaded ${map.size} page slugs`);
        return map;
      });
  }
  return slugMapCache;
}

function normalizeInternalSlug(href: string, sourceUrl: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("javascript:")) return null;
  try {
    const url = new URL(href, sourceUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!/^(?:www\.)?ardentcarpet\.com$/i.test(url.hostname)) return null;
    return (url.pathname.replace(/\/+$/g, "") || "/").toLowerCase();
  } catch {
    return null;
  }
}

function resolveCustomUrl(href: string, sourceUrl: string, slugMap: PageSlugMap) {
  const slug = normalizeInternalSlug(href, sourceUrl);
  if (slug) {
    const refId = slugMap.get(slug);
    if (refId) return { type: "internal" as const, internal: { _type: "reference" as const, _ref: refId }, openInNewTab: false };
  }
  return { type: "external" as const, external: href, openInNewTab: false };
}

function createButton(btn: { text: string; href: string; variant: "default" | "secondary" }, sourceUrl: string, slugMap: PageSlugMap) {
  return {
    _type: "button",
    _key: key(),
    text: btn.text,
    variant: btn.variant,
    size: "default",
    url: resolveCustomUrl(btn.href, sourceUrl, slugMap),
  };
}

// ─── portable text types ───────────────────────────────────────────────────

type PTSpan = { _type: "span"; _key: string; text: string; marks: string[] };
type PTMarkDefExternal = { _key: string; _type: "link"; type: "external"; external: string; href: string; openInNewTab: boolean };
type PTMarkDef =
  | PTMarkDefExternal
  | { _key: string; _type: "link"; type: "internal"; internal: { _type: "reference"; _ref: string }; href: string; openInNewTab: boolean };
type PTBlock = {
  _type: "block"; _key: string; style: string;
  children: PTSpan[]; markDefs: PTMarkDefExternal[];
  listItem?: "bullet" | "number"; level?: number;
};

type ScrapedItem =
  | { type: "block"; block: PTBlock }
  | { type: "image"; imageUrl: string; imageAlt: string; position: "left" | "right" }
  | { type: "button"; button: { text: string; href: string; variant: "default" | "secondary" } };

type Spotlight = {
  imageUrl: string; imageAlt: string; heading: string;
  description: PTBlock[];
  buttons: Array<{ text: string; href: string; variant: "default" | "secondary" }>;
};

function resolveBlockLinks(block: PTBlock, sourceUrl: string, slugMap: PageSlugMap) {
  return {
    ...block,
    markDefs: block.markDefs.map((md): PTMarkDef => {
      if (!md.href) return md;
      const resolved = resolveCustomUrl(md.href, sourceUrl, slugMap);
      if (resolved.type === "internal") {
        return { _key: md._key, _type: "link", type: "internal", internal: resolved.internal, href: md.href, openInNewTab: false };
      }
      return { _key: md._key, _type: "link", type: "external", external: resolved.external, href: md.href, openInNewTab: md.openInNewTab };
    }),
  };
}

// ─── scraping ──────────────────────────────────────────────────────────────

interface ScrapedData {
  h1: string;
  heroDesc: string;
  heroBgImgUrl: string;
  heroButtons: Array<{ text: string; href: string; variant: "default" | "secondary" }>;
  aboutSection: ScrapedItem[];
  spotlights: Spotlight[];
  processSection: ScrapedItem[];
  costParagraphs: string[];
  costButtons: Array<{ text: string; href: string; variant: "default" | "secondary" }>;
}

async function scrapePage(
  url: string,
  browser: Awaited<ReturnType<typeof chromium.launch>>
): Promise<ScrapedData> {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    const pageUrl = page.url();

    // ── #banner ─────────────────────────────────────────────────────────────
    const h1 = await page.$eval("#banner h1", (el) => el.textContent?.trim() ?? "").catch(() => "");
    const heroDesc = await page.$eval("#banner .content p", (el) => el.textContent?.trim() ?? "").catch(() => "");

    const heroBgImgUrl = await page.evaluate((baseUrl) => {
      const banner = document.querySelector("#banner");
      if (!banner) return "";
      const img = banner.querySelector<HTMLImageElement>("img");
      if (img) {
        const raw = img.getAttribute("src") ?? "";
        try { return raw ? new URL(raw, baseUrl).href : ""; } catch { return raw; }
      }
      const bg = window.getComputedStyle(banner).backgroundImage;
      const match = bg.match(/url\(['"]?(.+?)['"]?\)/);
      return match ? match[1]! : "";
    }, pageUrl);

    const heroButtons = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLAnchorElement>("#banner .content .actions .button"))
        .map((btn) => ({
          text: btn.textContent?.trim() ?? "",
          href: btn.getAttribute("href") ?? btn.href ?? "",
          variant: btn.classList.contains("primary") ? ("default" as const) : ("secondary" as const),
        }))
        .filter((b) => b.text && b.href)
    );

    // ── all content sections in one evaluate ────────────────────────────────
    const scraped = await page.evaluate((baseUrl) => {
      let idx = 0;
      const nextKey = () => `s-${++idx}`;

      type SpanL = { _type: "span"; _key: string; text: string; marks: string[] };
      type MarkDefL = { _key: string; _type: "link"; type: "external"; external: string; href: string; openInNewTab: boolean };
      type BlockL = { _type: "block"; _key: string; style: string; children: SpanL[]; markDefs: MarkDefL[]; listItem?: "bullet" | "number"; level?: number };
      type ItemL =
        | { type: "block"; block: BlockL }
        | { type: "image"; imageUrl: string; imageAlt: string; position: "left" | "right" }
        | { type: "button"; button: { text: string; href: string; variant: "default" | "secondary" } };

      function mkMarkDef(a: HTMLAnchorElement): MarkDefL {
        const href = a.getAttribute("href") ?? "#";
        return { _key: nextKey(), _type: "link", type: "external", external: href, href, openInNewTab: a.target === "_blank" };
      }

      function extractChildren(node: Node, marks: string[], markDefs: MarkDefL[]): SpanL[] {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ?? "";
          if (!text.trim()) return [];
          return [{ _type: "span", _key: nextKey(), text, marks }];
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return [];
        const el = node as HTMLElement;
        if (el.tagName === "BR") return [{ _type: "span", _key: nextKey(), text: "\n", marks }];
        const m = [...marks];
        if (el.tagName === "STRONG" || el.tagName === "B") m.push("strong");
        if (el.tagName === "EM" || el.tagName === "I") m.push("em");
        if (el.tagName === "U") m.push("underline");
        if (el.tagName === "A") { const md = mkMarkDef(el as HTMLAnchorElement); markDefs.push(md); m.push(md._key); }
        return Array.from(el.childNodes).flatMap((c) => extractChildren(c, m, markDefs));
      }

      function mkBlock(el: Element, style: string, opts?: { listItem?: "bullet" | "number"; level?: number }): BlockL | null {
        const markDefs: MarkDefL[] = [];
        const children = extractChildren(el, [], markDefs);
        if (!children.length) return null;
        return { _type: "block", _key: nextKey(), style, children, markDefs, ...opts };
      }

      function imgSrc(img: HTMLImageElement): string {
        const raw = img.getAttribute("src") ?? "";
        try { return raw ? new URL(raw, baseUrl).href : ""; } catch { return raw; }
      }

      function processEl(el: Element, items: ItemL[]) {
        const tag = el.tagName;
        if (/^H[1-6]$/.test(tag)) { const b = mkBlock(el, tag.toLowerCase()); if (b) items.push({ type: "block", block: b }); return; }
        if (tag === "HEADER") {
          el.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => { const b = mkBlock(h, h.tagName.toLowerCase()); if (b) items.push({ type: "block", block: b }); });
          return;
        }
        if (tag === "P") { const b = mkBlock(el, "normal"); if (b) items.push({ type: "block", block: b }); return; }
        if (el.classList.contains("image")) {
          const img = el.querySelector<HTMLImageElement>("img");
          if (img) { const src = imgSrc(img); if (src) items.push({ type: "image", imageUrl: src, imageAlt: img.alt ?? "", position: el.classList.contains("right") ? "right" : "left" }); }
          return;
        }
        if (tag === "UL" || tag === "OL") {
          if (el.classList.contains("actions")) {
            el.querySelectorAll<HTMLAnchorElement>("a.button, a.btn").forEach((a) => {
              const text = a.textContent?.trim() ?? "", href = a.getAttribute("href") ?? a.href ?? "";
              if (text && href) items.push({ type: "button", button: { text, href, variant: a.classList.contains("primary") ? "default" : "secondary" } });
            });
            return;
          }
          const li = (tag === "OL" ? "number" : "bullet") as "bullet" | "number";
          el.querySelectorAll(":scope > li").forEach((item) => { const b = mkBlock(item, "normal", { listItem: li, level: 1 }); if (b) items.push({ type: "block", block: b }); });
          return;
        }
        if (tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
          Array.from(el.children).forEach((c) => processEl(c, items));
        }
      }

      function extractSection(selector: string): ItemL[] {
        const section = document.querySelector(selector);
        if (!section) return [];
        const items: ItemL[] = [];
        const root = section.querySelector(".inner") ?? section;

        // header above row
        const header = root.querySelector(":scope > header");
        if (header) {
          header.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => { const b = mkBlock(h, h.tagName.toLowerCase()); if (b) items.push({ type: "block", block: b }); });
        }
        Array.from(root.children).forEach((c) => { if (c !== header) processEl(c, items); });
        return items;
      }

      // spotlights (.spotlights wrapper or #spotlights)
      const spotlightsEl = document.querySelector(".spotlights") ?? document.querySelector("#spotlights");
      const spotlights = spotlightsEl
        ? Array.from(spotlightsEl.querySelectorAll("section")).map((sec) => {
            const img = sec.querySelector<HTMLImageElement>(".image img");
            const descP = sec.querySelector(".content p");
            const buttons = Array.from(sec.querySelectorAll<HTMLAnchorElement>(".content .actions .button"))
              .map((a) => ({
                text: a.textContent?.trim() ?? "",
                href: a.getAttribute("href") ?? a.href ?? "",
                variant: a.classList.contains("primary") ? ("default" as const) : ("secondary" as const),
              }))
              .filter((b) => b.text && b.href);
            return {
              imageUrl: img ? imgSrc(img) : "",
              imageAlt: img?.alt ?? "",
              heading: sec.querySelector(".content h3")?.textContent?.trim() ?? "",
              description: (() => { if (!descP) return []; const b = mkBlock(descP, "normal"); return b ? [b] : []; })() as BlockL[],
              buttons,
            };
          })
        : [];

      // #cost
      const costSection = document.querySelector("#cost");
      const costParagraphs: string[] = [];
      const costButtons: Array<{ text: string; href: string; variant: "default" | "secondary" }> = [];
      if (costSection) {
        costSection.querySelectorAll("p").forEach((p) => { const t = p.textContent?.trim(); if (t) costParagraphs.push(t); });
        costSection.querySelectorAll<HTMLAnchorElement>("a.button, a[class*='btn'], .actions a, .buttons a").forEach((a) => {
          const text = a.textContent?.trim() ?? "", href = a.getAttribute("href") ?? a.href ?? "";
          if (text && href) costButtons.push({ text, href, variant: a.classList.contains("primary") ? "default" : "secondary" });
        });
      }

      return {
        aboutSection: extractSection("#about"),
        processSection: extractSection("#process"),
        spotlights,
        costParagraphs,
        costButtons,
      };
    }, pageUrl);

    return {
      h1,
      heroDesc,
      heroBgImgUrl,
      heroButtons,
      aboutSection: scraped.aboutSection as ScrapedItem[],
      spotlights: scraped.spotlights as Spotlight[],
      processSection: scraped.processSection as ScrapedItem[],
      costParagraphs: scraped.costParagraphs,
      costButtons: scraped.costButtons,
    };
  } finally {
    await page.close();
  }
}

// ─── build pageBuilder ─────────────────────────────────────────────────────

async function buildRichTextItems(items: ScrapedItem[], sourceUrl: string, slugMap: PageSlugMap) {
  const richText: unknown[] = [];
  for (const item of items) {
    if (item.type === "image") {
      try {
        const img = await uploadImage(item.imageUrl, item.imageAlt);
        richText.push({ _type: "floatingImage", _key: key(), image: { ...img, alt: item.imageAlt }, position: item.position, maxWidth: 300 });
      } catch (e) {
        console.warn(`    Image upload failed (${item.imageUrl}): ${e}`);
      }
    } else if (item.type === "button") {
      richText.push(createButton(item.button, sourceUrl, slugMap));
    } else {
      richText.push(resolveBlockLinks(item.block, sourceUrl, slugMap));
    }
  }
  return richText;
}

async function buildPageBuilder(data: ScrapedData, sourceUrl: string, slugMap: PageSlugMap) {
  const blocks: unknown[] = [];

  // 1. heroPrimary
  const hero: Record<string, unknown> = {
    _type: "heroPrimary",
    _key: key(),
    title: data.h1,
    subtitle: data.heroDesc,
    showBgGradient: true,
    bgGradientColor: "white",
  };
  if (data.heroBgImgUrl) {
    try { hero.image = await uploadImage(data.heroBgImgUrl, `${data.h1} hero`); }
    catch (e) { console.warn(`  Hero image failed: ${e}`); }
  }
  if (data.heroButtons.length > 0) {
    hero.buttons = data.heroButtons.map((b) => createButton(b, sourceUrl, slugMap));
  }
  blocks.push(hero);

  // 2. #about → richTextSection
  if (data.aboutSection.length > 0) {
    const richText = await buildRichTextItems(data.aboutSection, sourceUrl, slugMap);
    if (richText.length > 0) blocks.push({ _type: "richTextSection", _key: key(), richText });
  }

  // 3. .spotlights → contentList
  if (data.spotlights.length > 0) {
    const items: unknown[] = [];
    for (const [i, spot] of data.spotlights.entries()) {
      const item: Record<string, unknown> = {
        _type: "item",
        _key: key(),
        heading: spot.heading,
        description: spot.description.map((b) => resolveBlockLinks(b, sourceUrl, slugMap)),
        buttons: spot.buttons.map((b) => createButton(b, sourceUrl, slugMap)),
      };
      if (spot.imageUrl) {
        try { item.image = await uploadImage(spot.imageUrl, spot.imageAlt || spot.heading); }
        catch (e) { console.warn(`  Spotlight ${i} image failed: ${e}`); }
      }
      items.push(item);
    }
    blocks.push({ _type: "contentList", _key: key(), items });
  }

  // 4. #process → richTextSection
  if (data.processSection.length > 0) {
    const richText = await buildRichTextItems(data.processSection, sourceUrl, slugMap);
    if (richText.length > 0) blocks.push({ _type: "richTextSection", _key: key(), richText });
  }

  // 5. #cost → richTextSection
  if (data.costParagraphs.length > 0 || data.costButtons.length > 0) {
    const richText: unknown[] = [
      ...data.costParagraphs.map((p) => ({
        _type: "block", _key: key(), style: "normal",
        children: [{ _type: "span", _key: key(), text: p, marks: [] }],
        markDefs: [],
      })),
      ...(data.costButtons.length > 0
        ? [{
            _type: "buttonsGroup",
            _key: key(),
            buttons: data.costButtons.map((b) => ({
              _type: "button", _key: key(),
              text: b.text, variant: b.variant, size: "default",
              url: resolveCustomUrl(b.href, sourceUrl, slugMap),
            })),
          }]
        : []),
    ];
    blocks.push({ _type: "richTextSection", _key: key(), anchorId: "service-pricing", richText });
  }

  return blocks;
}

// ─── main ──────────────────────────────────────────────────────────────────

async function migrateUrl(
  url: string,
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  slugMap: PageSlugMap
) {
  console.log(`\n── ${url}`);

  let data: ScrapedData;
  try {
    data = await scrapePage(url, browser);
  } catch (e) {
    console.error(`  Scrape failed: ${e}`);
    return;
  }

  console.log(
    `  H1: "${data.h1}" | about: ${data.aboutSection.length} | spotlights: ${data.spotlights.length} | process: ${data.processSection.length} | cost paras: ${data.costParagraphs.length}`
  );

  if (!data.h1 && data.aboutSection.length === 0 && data.spotlights.length === 0) {
    console.warn("  No content scraped — skipping");
    return;
  }

  console.log("  Building pageBuilder (uploading images)...");
  const pageBuilder = await buildPageBuilder(data, url, slugMap);

  const slug = "/" + new URL(url).pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  console.log(`  Slug: ${slug}`);

  const existingId = await client.fetch<string | null>(
    `*[_type == "page" && slug.current == $slug][0]._id`,
    { slug }
  );

  if (!existingId) {
    console.warn(`  No Sanity document found for "${slug}" — skipping`);
    return;
  }

  await client
    .patch(existingId)
    .set({ title: data.h1, pageBuilder })
    .commit();

  console.log(`  ✓ Patched ${existingId}`);
}

async function run() {
  const slugMap = await getPageSlugMap();
  const browser = await chromium.launch();

  try {
    for (const url of SERVICE_URLS) {
      await migrateUrl(url, browser, slugMap);
    }
  } finally {
    await browser.close();
  }

  console.log("\nAll done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
