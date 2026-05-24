/**
 * Scrapes the #awards and #cost sections from live ardentcarpet.com/Local/* pages
 * and patches the matching Sanity page documents with:
 *   1. An `awardsAndReviews` block (award images shared across all pages)
 *   2. A `richTextSection` block with city-specific service pricing content
 *
 * Award images are uploaded ONCE from the Rocklin page and reused for all pages.
 * The awards button is pre-linked to the pricing section via sectionId.
 *
 * Run from studio:
 *   pnpm exec sanity exec scripts/migrate-awards-pricing.ts --with-user-token
 *
 * Requires Chromium (one-time setup):
 *   pnpm exec playwright install chromium
 */

import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const ROCKLIN_URL = "https://ardentcarpet.com/Local/Rocklin/";

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

function linkedTextBlock(
  segments: Array<{ text: string; href?: string }>,
  style = "normal"
) {
  const markDefs: Array<{ _type: string; _key: string; type: string; external: string; openInNewTab: boolean }> = [];
  const children = segments.map(({ text, href }) => {
    if (!href) return { _type: "span", _key: key(), text, marks: [] };
    const linkKey = key();
    markDefs.push({ _type: "link", _key: linkKey, type: "external", external: href, openInNewTab: false });
    return { _type: "span", _key: key(), text, marks: [linkKey] };
  });
  return { _type: "block", _key: key(), style, children, markDefs };
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
    _type: "awardImage" as const,
    _key: key(),
    asset: { _type: "reference" as const, _ref: asset._id },
    alt,
  };
}

// ─── slug → Sanity _id map ─────────────────────────────────────────────────

async function fetchSlugMap(): Promise<Map<string, string>> {
  const pages = await client.fetch<Array<{ _id: string; slug: string }>>(
    `*[_type == "page" && defined(slug.current)]{ _id, "slug": slug.current }`
  );
  const map = new Map<string, string>();
  for (const p of pages) {
    map.set(p.slug.toLowerCase(), p._id);
  }
  console.log(`Loaded ${map.size} page slugs`);
  return map;
}

function resolveButtonUrl(
  href: string,
  slugMap: Map<string, string>
): { type: string; internal?: { _type: string; _ref: string }; external?: string; openInNewTab: boolean } {
  try {
    const url = new URL(href);
    if (url.hostname.includes("ardentcarpet.com")) {
      const path = url.pathname.replace(/\/$/, "").toLowerCase();
      const pageId = slugMap.get(path);
      if (pageId) {
        console.log(`    → internal link: ${path}`);
        return { type: "internal", internal: { _type: "reference", _ref: pageId }, openInNewTab: false };
      }
    }
  } catch {
    // fall through to external
  }
  return { type: "external", external: href, openInNewTab: false };
}

// ─── fetch all /local/* pages ──────────────────────────────────────────────

async function fetchLocalPages() {
  const pages = await client.fetch<Array<{ _id: string; slug: string; pageBuilder?: Array<{ _type: string }> }>>(
    `*[_type == "page" && slug.current match "/local/*"]{_id, "slug": slug.current, "pageBuilder": pageBuilder[]{_type}}`
  );
  console.log(`Found ${pages.length} /local/* pages`);
  return pages;
}

// ─── scrape award images from #awards (Rocklin, used for all pages) ─────────

async function scrapeAwardImages(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const page = await browser.newPage();
  console.log(`  Scraping award images from ${ROCKLIN_URL}...`);
  await page.goto(ROCKLIN_URL, { waitUntil: "networkidle" });
  console.log(`  Final URL: ${page.url()}`);

  // Scroll to #awards to trigger lazy-loaded images
  await page.evaluate(() => {
    document.querySelector("#awards")?.scrollIntoView({ behavior: "instant" });
  });

  // Wait for at least one img inside #awards to have a real src
  try {
    await page.waitForSelector("#awards img[src]:not([src=''])", { timeout: 8000 });
  } catch {
    console.warn("  Timeout waiting for #awards img[src] — proceeding anyway");
  }

  const pageUrl = page.url();

  const debug = await page.evaluate((baseUrl) => {
    const awardsSection = document.querySelector("#awards");
    const allSectionIds = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
    const imgs = awardsSection ? Array.from(awardsSection.querySelectorAll<HTMLImageElement>("img")) : [];
    return {
      hasAwards: !!awardsSection,
      allIds: allSectionIds,
      imgCount: imgs.length,
      imgAttrs: imgs.map((i) => ({
        attrSrc: i.getAttribute("src"),
        attrDataSrc: i.getAttribute("data-src"),
        attrDataLazy: i.getAttribute("data-lazy"),
        propSrc: i.src,
        currentSrc: i.currentSrc,
        alt: i.alt,
      })),
    };
  }, pageUrl);
  console.log(`  #awards found: ${debug.hasAwards}, imgs inside: ${debug.imgCount}`);
  console.log(`  All section IDs on page: ${debug.allIds.join(", ")}`);
  for (const s of debug.imgAttrs) {
    console.log(`    attr-src=${s.attrSrc} | prop-src=${s.propSrc} | currentSrc=${s.currentSrc} | data-src=${s.attrDataSrc} | alt=${s.alt}`);
  }

  const imageData = await page.evaluate((baseUrl) => {
    const awardsSection = document.querySelector("#awards");
    if (!awardsSection) return [];

    return Array.from(awardsSection.querySelectorAll<HTMLImageElement>("img"))
      .map((img) => {
        // Use getAttribute + manual URL resolution as the most reliable approach
        const rawSrc = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-lazy") || img.getAttribute("data-original") || "";
        let src = "";
        try {
          src = rawSrc ? new URL(rawSrc, baseUrl).href : "";
        } catch {
          src = rawSrc;
        }
        return {
          src,
          alt: img.alt || img.getAttribute("aria-label") || img.getAttribute("title") || "Award",
        };
      })
      .filter((img) => img.src && img.src.startsWith("http") && !img.src.includes("data:"));
  }, pageUrl);

  await page.close();
  console.log(`  Found ${imageData.length} award image(s)`);
  for (const img of imageData) console.log(`    ${img.src}`);
  return imageData;
}

// ─── scrape #cost section (city-specific pricing content) ──────────────────

type PricingContent = {
  paragraphs: string[];
  buttons: Array<{ text: string; href: string; variant: "default" | "secondary" | "outline" }>;
  footerNote: string;
};

async function scrapePricingSection(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  url: string
): Promise<PricingContent> {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const result = await page.evaluate(() => {
    const section = document.querySelector("#cost");
    if (!section) return { paragraphs: [], buttons: [], footerNote: "" };

    const paragraphs = Array.from(section.querySelectorAll<HTMLParagraphElement>("p"))
      .map((p) => p.textContent?.trim() ?? "")
      .filter((t) => t.length > 0);

    const buttons = Array.from(section.querySelectorAll<HTMLAnchorElement>("a.button, a[class*='btn'], .actions a, .buttons a"))
      .map((btn) => ({
        text: btn.textContent?.trim() ?? "",
        href: btn.href ?? "",
        variant: btn.classList.contains("primary") ? ("default" as const) : ("outline" as const),
      }))
      .filter((btn) => btn.text && btn.href);

    const lastParagraph = paragraphs[paragraphs.length - 1] ?? "";

    return {
      paragraphs: paragraphs.slice(0, paragraphs.length > 1 ? paragraphs.length - 1 : 1),
      buttons,
      footerNote: paragraphs.length > 1 ? lastParagraph : "",
    };
  });

  await page.close();
  return result;
}

// ─── build blocks ──────────────────────────────────────────────────────────

function buildPricingBlock(
  cityName: string,
  pricing: PricingContent,
  slugMap: Map<string, string>
): { block: object; blockKey: string } {
  const blockKey = key();
  const PRICING_ANCHOR_ID = "service-pricing";

  const richText: object[] = [
    textBlock("Service Pricing", "h2"),
    ...pricing.paragraphs.map((p) => textBlock(p)),
    ...(pricing.buttons.length > 0
      ? [
          {
            _type: "buttonsGroup",
            _key: key(),
            buttons: pricing.buttons.map((btn) => ({
              _type: "button",
              _key: key(),
              text: btn.text,
              variant: btn.variant === "default" ? "default" : "outline",
              size: "default",
              url: resolveButtonUrl(btn.href, slugMap),
            })),
          },
        ]
      : []),
    linkedTextBlock([
      { text: "Use our client portal or call us at " },
      { text: "916-680-9333", href: "tel:+19166809333" },
      { text: " to schedule a free consultation for a more precise estimate of our services." },
    ]),
  ];

  return {
    blockKey: PRICING_ANCHOR_ID,
    block: {
      _type: "richTextSection",
      _key: blockKey,
      anchorId: PRICING_ANCHOR_ID,
      richText,
    },
  };
}

function buildAwardsBlock(
  uploadedImages: Array<{ _type: string; _key: string; asset: { _type: string; _ref: string }; alt: string }>,
  pricingBlockKey: string
) {
  return {
    _type: "awardsAndReviews",
    _key: key(),
    anchorId: "awards",
    title: "Awards and Reviews",
    awardsTitle: "Notable Awards Received",
    awardImages: uploadedImages,
    button: {
      _type: "button",
      _key: key(),
      text: "SERVICE PRICING",
      variant: "outline",
      size: "default",
      url: {
        type: "section",
        sectionId: pricingBlockKey,
        openInNewTab: false,
      },
    },
    // reviewsTitle: "What People Are Saying",
    // reviewsEmbedCode: "",
  };
}

// ─── main ──────────────────────────────────────────────────────────────────

async function run() {
  const [pages, slugMap] = await Promise.all([fetchLocalPages(), fetchSlugMap()]);
  if (!pages.length) {
    console.log("No /local/* pages found. Aborting.");
    return;
  }

  const browser = await chromium.launch();

  try {
    // Upload award images ONCE from Rocklin page
    console.log("\nUploading award images...");
    const awardImageData = await scrapeAwardImages(browser);
    if (!awardImageData.length) {
      console.warn("No award images found in #awards section on Rocklin page.");
    }

    const uploadedImages: Array<{ _type: string; _key: string; asset: { _type: string; _ref: string }; alt: string }> = [];
    for (const img of awardImageData) {
      try {
        const uploaded = await uploadImage(img.src, img.alt);
        uploadedImages.push(uploaded);
      } catch (err) {
        console.error(`  Failed to upload ${img.src}:`, err);
      }
    }
    console.log(`Uploaded ${uploadedImages.length} award image(s)`);

    // Process each local page
    for (const sanityPage of pages) {
      const slug = sanityPage.slug;
      const cityPathSegment = slug.replace(/^\/local\//, "");
      const capitalised = cityPathSegment.charAt(0).toUpperCase() + cityPathSegment.slice(1);
      const liveUrl = `https://ardentcarpet.com/Local/${capitalised}/`;

      console.log(`\nProcessing ${slug} → ${liveUrl}`);

      // Skip if already has awardsAndReviews block
      const alreadyHasAwards = sanityPage.pageBuilder?.some(
        (b) => b._type === "awardsAndReviews"
      );
      if (alreadyHasAwards) {
        console.log(`  Already has awardsAndReviews block — skipping`);
        continue;
      }

      // Scrape city-specific pricing
      let pricing: PricingContent = { paragraphs: [], buttons: [], footerNote: "" };
      try {
        pricing = await scrapePricingSection(browser, liveUrl);
        console.log(
          `  Found ${pricing.paragraphs.length} paragraph(s) and ${pricing.buttons.length} button(s) in #cost`
        );
      } catch (err) {
        console.warn(`  Could not scrape ${liveUrl}:`, err);
      }

      // Build blocks
      const { block: pricingBlock, blockKey: pricingKey } = buildPricingBlock(capitalised, pricing, slugMap);
      const awardsBlock = buildAwardsBlock(uploadedImages, pricingKey);

      // Patch Sanity document
      try {
        await client
          .patch(sanityPage._id)
          .setIfMissing({ pageBuilder: [] })
          .append("pageBuilder", [awardsBlock, pricingBlock])
          .commit();
        console.log(`  ✓ Patched ${sanityPage._id}`);
      } catch (err) {
        console.error(`  ✗ Failed to patch ${sanityPage._id}:`, err);
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
