/**
 * Scrapes a location page from ardentcarpet.com and creates/updates the
 * corresponding Sanity page document with heroPrimary, richTextSection,
 * and contentList blocks.
 *
 * Run from studio:
 *   pnpm exec sanity exec scripts/migrate-location-page.ts --with-user-token -- <url> [url2] ...
 *
 * One-time setup (install Chromium):
 *   pnpm exec playwright install chromium
 */

import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import { getCliClient } from "sanity/cli";

const client = getCliClient();
const urls = process.argv.slice(2);

// ─── helpers ───────────────────────────────────────────────────────────────

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

function textBlock(text: string, style = "normal") {
  return {
    _type: "block",
    _key: key(),
    style,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

async function uploadImage(imageUrl: string, alt: string) {
  console.log(`  Uploading image: ${imageUrl}`);
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image ${imageUrl}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const filename = imageUrl.split("/").pop()?.split("?")[0] ?? "image.jpg";
  const asset = await client.assets.upload("image", buffer, { filename, contentType });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt,
  };
}

type PageSlugMap = Map<string, string>;
type PortableTextSpan = {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
};
type PortableTextLinkMarkDef = {
  _key: string;
  _type: "link";
  type: "external";
  external: string;
  href: string;
  openInNewTab: boolean;
};
type PortableTextBlockValue = {
  _type: "block";
  _key: string;
  style: string;
  children: PortableTextSpan[];
  markDefs: PortableTextLinkMarkDef[];
  listItem?: "bullet" | "number";
  level?: number;
};

let pageSlugMapPromise: Promise<PageSlugMap> | null = null;

async function getPageSlugMap(): Promise<PageSlugMap> {
  if (!pageSlugMapPromise) {
    pageSlugMapPromise = client
      .fetch<Array<{ _id: string; slug?: { current?: string } | null }>>(
        `*[_type == "page" && defined(slug.current)]{_id, slug}`
      )
      .then((pages) => {
        const slugMap = new Map<string, string>();
        for (const page of pages) {
          const current = page.slug?.current;
          if (!current) continue;
          slugMap.set(current.toLowerCase(), page._id);
        }
        return slugMap;
      });
  }

  return pageSlugMapPromise;
}

function slugFromUrl(url: string) {
  // e.g. https://ardentcarpet.com/Local/Rocklin → local/rocklin
  return new URL(url).pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
}

function normalizeInternalSlug(href: string, sourceUrl: string) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:") ||
    href.startsWith("javascript:")
  ) {
    return null;
  }

  try {
    const resolvedUrl = new URL(href, sourceUrl);
    if (!["http:", "https:"].includes(resolvedUrl.protocol)) return null;
    if (!/^(?:www\.)?ardentcarpet\.com$/i.test(resolvedUrl.hostname)) return null;

    const normalizedPath = resolvedUrl.pathname.replace(/\/+$/g, "") || "/";
    return normalizedPath.toLowerCase();
  } catch {
    return null;
  }
}

function resolveCustomUrl(href: string, sourceUrl: string, pageSlugMap: PageSlugMap) {
  const normalizedSlug = normalizeInternalSlug(href, sourceUrl);
  if (normalizedSlug) {
    const referenceId = pageSlugMap.get(normalizedSlug);
    if (referenceId) {
      return {
        type: "internal",
        internal: {
          _type: "reference",
          _ref: referenceId,
        },
        openInNewTab: false,
      };
    }
  }

  return {
    type: "external",
    external: href,
    openInNewTab: false,
  };
}

// ─── scraping ──────────────────────────────────────────────────────────────

interface ScrapedData {
  h1: string;
  heroDesc: string;
  heroBgImgUrl: string;
  heroButtons: Array<{ text: string; href: string; variant: "default" | "secondary" }>;
  richSection: {
    content: Array<
      | {
          type: "block";
          block: PortableTextBlockValue;
        }
      | {
          type: "image";
          imageUrl: string;
          imageAlt: string;
          position: "left" | "right";
        }
      | {
          type: "button";
          button: { text: string; href: string; variant: "default" | "secondary" };
        }
    >;
  };
  processSection: {
    content: Array<
      | {
          type: "block";
          block: PortableTextBlockValue;
        }
      | {
          type: "image";
          imageUrl: string;
          imageAlt: string;
          position: "left" | "right";
        }
      | {
          type: "button";
          button: { text: string; href: string; variant: "default" | "secondary" };
        }
    >;
  };
  spotlights: Array<{
    imageUrl: string;
    imageAlt: string;
    heading: string;
    description: PortableTextBlockValue[];
    buttons: Array<{ text: string; href: string; variant: "default" | "secondary" }>;
  }>;
}

function createButton(
  button: { text: string; href: string; variant: "default" | "secondary" },
  sourceUrl: string,
  pageSlugMap: PageSlugMap
) {
  return {
    _type: "button",
    _key: key(),
    text: button.text,
    variant: button.variant,
    size: "default",
    url: resolveCustomUrl(button.href, sourceUrl, pageSlugMap),
  };
}

function resolveRichTextBlockLinks(
  block: PortableTextBlockValue,
  sourceUrl: string,
  pageSlugMap: PageSlugMap
) {
  return {
    ...block,
    markDefs: block.markDefs.map((markDef) => {
      if (markDef._type !== "link" || !markDef.href) {
        return markDef;
      }

      const resolvedUrl = resolveCustomUrl(markDef.href, sourceUrl, pageSlugMap);
      if (resolvedUrl.type === "internal") {
        return {
          _key: markDef._key,
          _type: "link" as const,
          type: "internal" as const,
          internal: resolvedUrl.internal,
          href: markDef.href,
          openInNewTab: markDef.openInNewTab ?? false,
        };
      }

      return {
        _key: markDef._key,
        _type: "link" as const,
        type: "external" as const,
        external: resolvedUrl.external,
        href: markDef.href,
        openInNewTab: markDef.openInNewTab ?? false,
      };
    }),
  };
}

async function scrapePage(url: string): Promise<ScrapedData> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    // --- Hero: #banner ---
    const h1 = await page
      .$eval("#banner h1", (el) => el.textContent?.trim() ?? "")
      .catch(() => "");

    const heroDesc = await page
      .$eval("#banner .content p", (el) => el.textContent?.trim() ?? "")
      .catch(() => "");

    const heroBgImgUrl = await page.evaluate(() => {
      const banner = document.querySelector("#banner");
      if (!banner) return "";
      const img = banner.querySelector("img");
      if (img?.src) return img.src;
      const bg = window.getComputedStyle(banner).backgroundImage;
      const match = bg.match(/url\(['"]?(.+?)['"]?\)/);
      return match ? match[1] : "";
    });

    const heroButtons = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLAnchorElement>("#banner .content .actions .button"))
        .map((btn) => ({
          text: btn.textContent?.trim() ?? "",
          href: btn.href ?? "",
          variant: btn.classList.contains("primary")
            ? ("default" as const)
            : ("secondary" as const),
        }))
        .filter((btn) => btn.text && btn.href)
    );

    // --- Rich Sections: #one + #process ---
    const { richSection, processSection } = await page.evaluate(() => {
      const nextKey = (() => {
        let index = 0;
        return () => `html-${++index}`;
      })();

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
          markDefs: PortableTextLinkMarkDef[]
        ): PortableTextSpan[] {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ?? "";
          if (!text.trim()) return [];
          return [
            {
              _type: "span",
              _key: nextKey(),
              text,
              marks: activeMarks,
            },
          ];
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
          return [];
        }

        const element = node as HTMLElement;
        if (element.tagName === "BR") {
          return [
            {
              _type: "span",
              _key: nextKey(),
              text: "\n",
              marks: activeMarks,
            },
          ];
        }

        const marks = [...activeMarks];
        if (element.tagName === "STRONG" || element.tagName === "B") {
          marks.push("strong");
        }
        if (element.tagName === "EM" || element.tagName === "I") {
          marks.push("em");
        }
        if (element.tagName === "A") {
          const markDef = createLinkMarkDef(element as HTMLAnchorElement);
          markDefs.push(markDef);
          marks.push(markDef._key);
        }

        return Array.from(element.childNodes).flatMap((child) =>
          extractChildren(child, marks, markDefs)
        );
      }

        function createBlock(
          element: Element,
          style: string,
          options?: { listItem?: "bullet" | "number"; level?: number }
        ) {
          const markDefs: PortableTextLinkMarkDef[] = [];
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

      function extractSectionContent(selector: string, options?: { skipFirstParagraph?: boolean }) {
        const section = document.querySelector(selector);
        if (!section) return [];

        const content: Array<
          | {
              type: "block";
              block: {
                _type: "block";
                _key: string;
                style: string;
                children: Array<{
                  _type: "span";
                  _key: string;
                  text: string;
                  marks: string[];
                }>;
                markDefs: Array<{
                  _key: string;
                  _type: "link";
                  type: "external";
                  external: string;
                  href: string;
                  openInNewTab: boolean;
                }>;
                listItem?: "bullet" | "number";
                level?: number;
              };
            }
          | {
              type: "image";
              imageUrl: string;
              imageAlt: string;
              position: "left" | "right";
            }
          | {
              type: "button";
              button: { text: string; href: string; variant: "default" | "secondary" };
            }
        > = [];
        let firstPSkipped = false;
        const inner = section.querySelector(".inner") ?? section;

        Array.from(inner.children).forEach((child) => {
          if (child.tagName === "P") {
            if (options?.skipFirstParagraph && !firstPSkipped) {
              firstPSkipped = true;
              return;
            }
            const block = createBlock(child, "normal");
            if (block) {
              content.push({ type: "block", block });
            }
            return;
          }

          if (/^H[1-6]$/.test(child.tagName)) {
            const block = createBlock(child, child.tagName.toLowerCase());
            if (block) {
              content.push({ type: "block", block });
            }
            return;
          }

          if (child.tagName === "HEADER") {
            child.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6").forEach((heading) => {
              const block = createBlock(heading, heading.tagName.toLowerCase());
              if (block) {
                content.push({ type: "block", block });
              }
            });
            return;
          }

          if (child.classList.contains("image")) {
            const img = child.querySelector<HTMLImageElement>("img");
            if (img?.src) {
              content.push({
                type: "image",
                imageUrl: img.src,
                imageAlt: img.alt ?? "",
                position: child.classList.contains("right") ? "right" : "left",
              });
            }
            return;
          }

          if (child.tagName === "OL" || child.tagName === "UL") {
            if (child.classList.contains("actions")) {
              Array.from(child.querySelectorAll<HTMLAnchorElement>("a.button")).forEach((button) => {
                const text = button.textContent?.trim() ?? "";
                const href = button.getAttribute("href") ?? button.href ?? "";
                if (!text || !href) return;
                content.push({
                  type: "button",
                  button: {
                    text,
                    href,
                    variant: button.classList.contains("primary")
                      ? ("default" as const)
                      : ("secondary" as const),
                  },
                });
              });
              return;
            }

            const listItem = child.tagName === "OL" ? "number" : "bullet";
            Array.from(child.querySelectorAll(":scope > li")).forEach((item) => {
              const block = createBlock(item, "normal", { listItem, level: 1 });
              if (block) {
                content.push({ type: "block", block });
              }
            });
          }
        });

        return content;
      }

      return {
        richSection: {
          content: extractSectionContent("#one", { skipFirstParagraph: true }),
        },
        processSection: {
          content: extractSectionContent("#process"),
        },
      };
    });

    // --- Spotlights ---
        const spotlights = await page.evaluate(() => {
      const wrapper = document.querySelector(".spotlights");
      if (!wrapper) return [];

      function nextKey() {
        return `spot-${Math.random().toString(36).slice(2, 12)}`;
      }

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
        markDefs: Array<{
          _key: string;
          _type: "link";
          type: "external";
          external: string;
          href: string;
          openInNewTab: boolean;
        }>
      ): Array<{ _type: "span"; _key: string; text: string; marks: string[] }> {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ?? "";
          if (!text.trim()) return [];
          return [{ _type: "span", _key: nextKey(), text, marks: activeMarks }];
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
          return [];
        }

        const element = node as HTMLElement;
        if (element.tagName === "BR") {
          return [{ _type: "span", _key: nextKey(), text: "\n", marks: activeMarks }];
        }

        const marks = [...activeMarks];
        if (element.tagName === "STRONG" || element.tagName === "B") {
          marks.push("strong");
        }
        if (element.tagName === "EM" || element.tagName === "I") {
          marks.push("em");
        }
        if (element.tagName === "A") {
          const markDef = createLinkMarkDef(element as HTMLAnchorElement);
          markDefs.push(markDef);
          marks.push(markDef._key);
        }

        return Array.from(element.childNodes).flatMap((child) =>
          extractChildren(child, marks, markDefs)
        );
      }

      function createBlock(element: Element, style: string) {
        const markDefs: Array<{
          _key: string;
          _type: "link";
          type: "external";
          external: string;
          href: string;
          openInNewTab: boolean;
        }> = [];
        const children = extractChildren(element, [], markDefs);
        if (children.length === 0) return null;

        return {
          _type: "block" as const,
          _key: nextKey(),
          style,
          children,
          markDefs,
        };
      }

      return Array.from(wrapper.querySelectorAll("section")).map((section) => {
        const img = section.querySelector<HTMLImageElement>(".image img");
        const descriptionBlock = section.querySelector(".content p");
        const buttons = Array.from(
          section.querySelectorAll<HTMLAnchorElement>(".content .actions .button")
        ).map((btn) => ({
          text: btn.textContent?.trim() ?? "",
          href: btn.href ?? "",
          className: btn.className ?? "",
        }));

        return {
          imageUrl: img?.src ?? "",
          imageAlt: img?.alt ?? "",
          heading: section.querySelector(".content h3")?.textContent?.trim() ?? "",
          description: (() => {
            if (!descriptionBlock) return [];
            const block = createBlock(descriptionBlock, "normal");
            return block ? [block] : [];
          })(),
          buttons: buttons
            .filter((btn) => btn.text && btn.href)
            .map(({ className, ...btn }) => ({
              ...btn,
              variant: className.split(/\s+/).includes("primary")
                ? ("default" as const)
                : ("secondary" as const),
            })),
        };
      });
    });

    return { h1, heroDesc, heroBgImgUrl, heroButtons, richSection, processSection, spotlights };
  } finally {
    await browser.close();
  }
}

// ─── document builder ──────────────────────────────────────────────────────

const tagToStyle: Record<string, string> = {
  p: "normal",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
};

async function buildPageBuilder(data: ScrapedData, sourceUrl: string) {
  const pageSlugMap = await getPageSlugMap();
  const pageBuilder = [];

  const buildRichTextSection = async (section: ScrapedData["richSection"]) => {
    const richText: unknown[] = [];
    for (const item of section.content) {
      if (item.type === "image") {
        const img = await uploadImage(item.imageUrl, item.imageAlt);
        richText.push({
          _type: "floatingImage",
          _key: key(),
          image: img,
          position: item.position,
          maxWidth: 200,
        });
        continue;
      }

      if (item.type === "button") {
        richText.push(createButton(item.button, sourceUrl, pageSlugMap));
        continue;
      }

      richText.push(resolveRichTextBlockLinks(item.block, sourceUrl, pageSlugMap));
    }

    return richText;
  };

  // 1. heroPrimary
  const heroBlock: Record<string, unknown> = {
    _type: "heroPrimary",
    _key: key(),
    title: data.h1,
    subtitle: data.heroDesc,
    showBgGradient: true,
    bgGradientColor: "white",
  };
  if (data.heroBgImgUrl) {
    heroBlock.image = await uploadImage(data.heroBgImgUrl, `${data.h1} hero background`);
  }
  if (data.heroButtons.length > 0) {
    heroBlock.buttons = data.heroButtons.map((button) =>
      createButton(button, sourceUrl, pageSlugMap)
    );
  }
  pageBuilder.push(heroBlock);

  // 2. richTextSection
  const richText = await buildRichTextSection(data.richSection);
  if (richText.length > 0) {
    pageBuilder.push({ _type: "richTextSection", _key: key(), richText });
  }

  // 3. contentList
  const items: unknown[] = [];
  for (const [index, spot] of data.spotlights.entries()) {
    const item: Record<string, unknown> = {
      _type: "item",
      _key: key(),
      imagePosition: index % 2 === 0 ? "left" : "right",
      heading: spot.heading,
      description: spot.description.map((block) =>
        resolveRichTextBlockLinks(block, sourceUrl, pageSlugMap)
      ),
      buttons: spot.buttons.map((button) => createButton(button, sourceUrl, pageSlugMap)),
    };
    if (spot.imageUrl) {
      item.image = await uploadImage(spot.imageUrl, spot.imageAlt);
    }
    items.push(item);
  }
  pageBuilder.push({ _type: "contentList", _key: key(), items });

  // 4. process richTextSection
  const processRichText = await buildRichTextSection(data.processSection);
  if (processRichText.length > 0) {
    pageBuilder.push({ _type: "richTextSection", _key: key(), richText: processRichText });
  }

  return pageBuilder;
}

// ─── main ──────────────────────────────────────────────────────────────────

async function migrateUrl(url: string) {
  console.log(`\nMigrating: ${url}`);

  console.log("  Scraping page...");
  const data = await scrapePage(url);
  console.log(`  H1: ${data.h1}`);
  console.log(`  Spotlights found: ${data.spotlights.length}`);

  console.log("  Building pageBuilder (uploading images)...");
  const pageBuilder = await buildPageBuilder(data, url);

  const slug = slugFromUrl(url); // e.g. "local/rocklin"
  const title = data.h1;

  const existingId = await client.fetch<string | null>(
    `*[_type == "page" && slug.current == $slug][0]._id`,
    { slug: `/${slug}` }
  );

  if (existingId) {
    console.log(`  Patching existing document ${existingId}...`);
    await client
      .patch(existingId)
      .set({ title, slug: { _type: "slug", current: `/${slug}` }, pageBuilder })
      .commit();
  } else {
    console.log(`  Creating new page document...`);
    await client.create({
      _type: "page",
      title,
      slug: { _type: "slug", current: `/${slug}` },
      pageBuilder,
    });
  }

  console.log(`  Done! /${slug}`);
}

async function run() {
  if (urls.length === 0) {
    console.error(
      "Usage: pnpm exec sanity exec scripts/migrate-location-page.ts --with-user-token -- <url> [url2] ..."
    );
    process.exit(1);
  }

  for (const url of urls) {
    await migrateUrl(url);
  }

  console.log("\nAll done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
