/**
 * Scrapes #two .col-8 and #service-area from https://ardentcarpet.com/ and
 * appends two richTextSection blocks to homePage.pageBuilder.
 *
 * Images inside span.image.left / span.image.right → floatingImage block
 * Images inside span.image.main (or any non-floated image span) → singleImage block
 *
 * Run from studio:
 *   pnpm exec sanity exec scripts/migrate-home-about.ts --with-user-token
 *
 * One-time setup:
 *   pnpm exec playwright install chromium
 */

import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import { getCliClient } from "sanity/cli";

const client = getCliClient();
const SOURCE_URL = "https://ardentcarpet.com/";
const HOME_PAGE_ID = "homePage";

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

type PortableTextSpan = {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
};

type PortableTextLinkMarkDef =
  | { _key: string; _type: "link"; type: "external"; external: string; href: string; openInNewTab: boolean }
  | { _key: string; _type: "link"; type: "internal"; internal: { _type: "reference"; _ref: string }; href: string; openInNewTab: boolean };

type PortableTextBlockValue = {
  _type: "block";
  _key: string;
  style: string;
  children: PortableTextSpan[];
  markDefs: PortableTextLinkMarkDef[];
  listItem?: "bullet" | "number";
  level?: number;
};

type ScrapedItem =
  | { type: "block"; block: PortableTextBlockValue }
  | { type: "floatingImage"; imageUrl: string; imageAlt: string; position: "left" | "right" }
  | { type: "singleImage"; imageUrl: string; imageAlt: string }
  | { type: "button"; button: { text: string; href: string; variant: "default" | "secondary" } };

type PageSlugMap = Map<string, string>;

// ─── page slug map + link resolution (mirrors migrate-location-page.ts) ────

let pageSlugMapPromise: Promise<PageSlugMap> | null = null;

async function getPageSlugMap(): Promise<PageSlugMap> {
  if (!pageSlugMapPromise) {
    pageSlugMapPromise = client
      .fetch<Array<{ _id: string; slug?: { current?: string } | null }>>(
        `*[_type == "page" && defined(slug.current)]{_id, slug}`
      )
      .then((pages) => {
        const map = new Map<string, string>();
        for (const page of pages) {
          const current = page.slug?.current;
          if (!current) continue;
          map.set(current.toLowerCase(), page._id);
        }
        return map;
      });
  }
  return pageSlugMapPromise;
}

function normalizeInternalSlug(href: string) {
  if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("javascript:")) return null;
  try {
    const url = new URL(href, SOURCE_URL);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!/^(?:www\.)?ardentcarpet\.com$/i.test(url.hostname)) return null;
    return (url.pathname.replace(/\/+$/g, "") || "/").toLowerCase();
  } catch {
    return null;
  }
}

function resolveCustomUrl(href: string, pageSlugMap: PageSlugMap) {
  const slug = normalizeInternalSlug(href);
  if (slug) {
    const refId = pageSlugMap.get(slug);
    if (refId) {
      return { type: "internal" as const, internal: { _type: "reference" as const, _ref: refId }, openInNewTab: false };
    }
  }
  return { type: "external" as const, external: href, openInNewTab: false };
}

function resolveBlockLinks(block: PortableTextBlockValue, pageSlugMap: PageSlugMap): PortableTextBlockValue {
  return {
    ...block,
    markDefs: block.markDefs.map((md) => {
      if (md._type !== "link" || !md.href) return md;
      const resolved = resolveCustomUrl(md.href, pageSlugMap);
      if (resolved.type === "internal") {
        return { _key: md._key, _type: "link" as const, type: "internal" as const, internal: resolved.internal, href: md.href, openInNewTab: false };
      }
      return { _key: md._key, _type: "link" as const, type: "external" as const, external: resolved.external, href: md.href, openInNewTab: false };
    }),
  };
}

// ─── upload ────────────────────────────────────────────────────────────────

async function uploadImage(imageUrl: string, alt: string) {
  console.log(`  Uploading image: ${imageUrl}`);
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image ${imageUrl}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const filename = imageUrl.split("/").pop()?.split("?")[0] ?? "image.jpg";
  const asset = await client.assets.upload("image", buffer, { filename, contentType });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

// ─── scraping (single evaluate — no closure leakage) ───────────────────────

async function scrapeSections(): Promise<{ about: ScrapedItem[]; serviceArea: ScrapedItem[] }> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    console.log(`  Loading ${SOURCE_URL}...`);
    await page.goto(SOURCE_URL, { waitUntil: "networkidle" });

    const result = await page.evaluate(() => {
      // ── shared helpers ──────────────────────────────────────────────────
      let idx = 0;
      const nextKey = () => `item-${++idx}`;

      function createLinkMarkDef(anchor: HTMLAnchorElement) {
        const href = anchor.getAttribute("href") ?? anchor.href ?? "#";
        return {
          _key: nextKey(),
          _type: "link" as const,
          type: "external" as const,
          external: href,
          href,
          openInNewTab: anchor.target === "_blank",
        };
      }

      function extractChildren(
        node: Node,
        activeMarks: string[],
        markDefs: ReturnType<typeof createLinkMarkDef>[]
      ): { _type: "span"; _key: string; text: string; marks: string[] }[] {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ?? "";
          if (!text.trim()) return [];
          return [{ _type: "span", _key: nextKey(), text, marks: activeMarks }];
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return [];
        const el = node as HTMLElement;
        if (el.tagName === "BR") return [{ _type: "span", _key: nextKey(), text: "\n", marks: activeMarks }];
        const marks = [...activeMarks];
        if (el.tagName === "STRONG" || el.tagName === "B") marks.push("strong");
        if (el.tagName === "EM" || el.tagName === "I") marks.push("em");
        if (el.tagName === "U") marks.push("underline");
        if (el.tagName === "A") {
          const md = createLinkMarkDef(el as HTMLAnchorElement);
          markDefs.push(md);
          marks.push(md._key);
        }
        return Array.from(el.childNodes).flatMap((c) => extractChildren(c, marks, markDefs));
      }

      function createBlock(
        element: Element,
        style: string,
        options?: { listItem?: "bullet" | "number"; level?: number }
      ) {
        const markDefs: ReturnType<typeof createLinkMarkDef>[] = [];
        const children = extractChildren(element, [], markDefs);
        if (children.length === 0) return null;
        return {
          _type: "block" as const,
          _key: nextKey(),
          style,
          children,
          markDefs,
          ...(options?.listItem ? { listItem: options.listItem } : {}),
          ...(options?.level ? { level: options.level } : {}),
        };
      }

      type Item =
        | { type: "block"; block: NonNullable<ReturnType<typeof createBlock>> }
        | { type: "floatingImage"; imageUrl: string; imageAlt: string; position: "left" | "right" }
        | { type: "singleImage"; imageUrl: string; imageAlt: string }
        | { type: "button"; button: { text: string; href: string; variant: "default" | "secondary" } };

      function processChild(child: Element, results: Item[]) {
        const tag = child.tagName;

        if (/^H[1-6]$/.test(tag)) {
          const block = createBlock(child, tag.toLowerCase());
          if (block) results.push({ type: "block", block });
          return;
        }

        if (tag === "HEADER") {
          child
            .querySelectorAll(":scope > h1,:scope > h2,:scope > h3,:scope > h4,:scope > h5,:scope > h6")
            .forEach((h) => {
              const block = createBlock(h, h.tagName.toLowerCase());
              if (block) results.push({ type: "block", block });
            });
          return;
        }

        if (tag === "P") {
          const block = createBlock(child, "normal");
          if (block) results.push({ type: "block", block });
          return;
        }

        if (child.classList.contains("image")) {
          const img = child.querySelector<HTMLImageElement>("img");
          if (!img?.src) return;
          const isLeft = child.classList.contains("left");
          const isRight = child.classList.contains("right");
          if (isLeft || isRight) {
            results.push({ type: "floatingImage", imageUrl: img.src, imageAlt: img.alt ?? "", position: isRight ? "right" : "left" });
          } else {
            results.push({ type: "singleImage", imageUrl: img.src, imageAlt: img.alt ?? "" });
          }
          return;
        }

        if (tag === "IMG") {
          const img = child as HTMLImageElement;
          if (img.src) results.push({ type: "singleImage", imageUrl: img.src, imageAlt: img.alt ?? "" });
          return;
        }

        if ((tag === "UL" || tag === "OL") && child.classList.contains("actions")) {
          child.querySelectorAll<HTMLAnchorElement>("a.button, a.btn").forEach((btn) => {
            const text = btn.textContent?.trim() ?? "";
            const href = btn.getAttribute("href") ?? btn.href ?? "";
            if (!text || !href) return;
            results.push({
              type: "button",
              button: { text, href, variant: btn.classList.contains("primary") ? "default" : "secondary" },
            });
          });
          return;
        }

        if (tag === "UL" || tag === "OL") {
          const listItem = tag === "OL" ? "number" : "bullet";
          child.querySelectorAll(":scope > li").forEach((li) => {
            const block = createBlock(li, "normal", { listItem, level: 1 });
            if (block) results.push({ type: "block", block });
          });
          return;
        }

        if (tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
          Array.from(child.children).forEach((c) => processChild(c, results));
        }
      }

      function extractSection(sectionSelector: string, col8Selector: string | null): Item[] {
        const items: Item[] = [];
        const section = document.querySelector(sectionSelector);
        if (!section) return items;

        // grab header above the row
        const header = section.querySelector(":scope > header, :scope > .inner > header");
        if (header) processChild(header, items);

        // content root
        const root = col8Selector
          ? (section.querySelector(col8Selector) ?? section.querySelector(".inner") ?? section)
          : (section.querySelector(".inner") ?? section);

        Array.from(root.children).forEach((c) => processChild(c, items));
        return items;
      }

      // ── extract both sections ─────────────────────────────────────────
      return {
        about: extractSection("#two", "[class*='col-8']"),
        serviceArea: extractSection("#service-area", null),
      };
    });

    return result as { about: ScrapedItem[]; serviceArea: ScrapedItem[] };
  } finally {
    await browser.close();
  }
}

// ─── rich text builder ─────────────────────────────────────────────────────

async function buildRichText(items: ScrapedItem[], pageSlugMap: PageSlugMap) {
  const richText: unknown[] = [];

  for (const item of items) {
    if (item.type === "floatingImage") {
      const uploaded = await uploadImage(item.imageUrl, item.imageAlt);
      richText.push({ _type: "floatingImage", _key: key(), position: item.position, maxWidth: 300, image: { ...uploaded, alt: item.imageAlt } });
      continue;
    }

    if (item.type === "singleImage") {
      const uploaded = await uploadImage(item.imageUrl, item.imageAlt);
      richText.push({ _type: "singleImage", _key: key(), width: "full", image: { ...uploaded, alt: item.imageAlt } });
      continue;
    }

    if (item.type === "button") {
      richText.push({ _type: "button", _key: key(), text: item.button.text, variant: item.button.variant, size: "default", href: item.button.href, openInNewTab: false });
      continue;
    }

    richText.push(resolveBlockLinks({ ...item.block, _key: key() }, pageSlugMap));
  }

  return richText;
}

function logStats(label: string, items: ScrapedItem[]) {
  const f = items.filter((i) => i.type === "floatingImage").length;
  const s = items.filter((i) => i.type === "singleImage").length;
  const b = items.filter((i) => i.type === "block").length;
  const btn = items.filter((i) => i.type === "button").length;
  console.log(`  ${label}: ${b} blocks, ${f} floating imgs, ${s} single imgs, ${btn} buttons`);
}

// ─── main ──────────────────────────────────────────────────────────────────

async function run() {
  console.log("Scraping ardentcarpet.com...");
  const { about, serviceArea } = await scrapeSections();

  logStats("#two .col-8", about);
  logStats("#service-area", serviceArea);

  if (about.length === 0 && serviceArea.length === 0) {
    console.error("No content found in either section. Aborting.");
    process.exit(1);
  }

  const pageSlugMap = await getPageSlugMap();
  console.log(`  Loaded ${pageSlugMap.size} page slugs for link resolution`);

  const blocks: unknown[] = [];

  if (about.length > 0) {
    console.log("\nBuilding about richText (uploading images)...");
    blocks.push({ _type: "richTextSection", _key: key(), richText: await buildRichText(about, pageSlugMap) });
  }

  if (serviceArea.length > 0) {
    console.log("Building service-area richText (uploading images)...");
    blocks.push({ _type: "richTextSection", _key: key(), richText: await buildRichText(serviceArea, pageSlugMap) });
  }

  console.log(`\nPatching homePage — appending ${blocks.length} richTextSection block(s)...`);
  await client
    .patch(HOME_PAGE_ID)
    .setIfMissing({ pageBuilder: [] })
    .append("pageBuilder", blocks)
    .commit();

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
