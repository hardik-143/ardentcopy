import type { Metadata } from "next";

import type { Maybe } from "@/types";
import { capitalize, getBaseUrl } from "@/utils";
import { urlFor } from "@/utils/sanity/client";
import { buildSeoMeta } from "@/utils/sanity/seo";
import { SanityImageSource } from "@sanity/asset-utils";

// Site-wide configuration interface
type SiteConfig = {
  title: string;
  description: string;
  twitterHandle: string;
  keywords: string[];
};

// Page-specific SEO data interface
interface PageSeoData extends Metadata {
  title?: string;
  description?: string;
  slug?: string;
  contentId?: string;
  contentType?: string;
  keywords?: string[];
  seoNoIndex?: boolean;
  pageType?: Extract<Metadata["openGraph"], { type: string }>["type"];
}

// OpenGraph image generation parameters
type OgImageParams = {
  type?: string;
  id?: string;
};

// TODO: Configure these values for your client
// Default site configuration
const siteConfig: SiteConfig = {
  title: "WebWorks Template",
  description: "A modern Next.js and Sanity CMS template by WebWorks. Configure this description for your client's business.",
  twitterHandle: "@webworks",
  keywords: [
    "your keyword 1",
    "your keyword 2",
    "your keyword 3",
  ],
};

function generateOgImageUrl(params: OgImageParams = {}): string {
  const { type, id } = params;
  const searchParams = new URLSearchParams();

  if (id) {
    searchParams.set("id", id);
  }
  if (type) {
    searchParams.set("type", type);
  }

  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

function buildPageUrl({
  baseUrl,
  slug,
}: {
  baseUrl: string;
  slug: string;
}): string {
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  return `${baseUrl}${normalizedSlug}`;
}

function extractTitle({
  pageTitle,
  slug,
  siteTitle,
}: {
  pageTitle?: Maybe<string>;
  slug: string;
  siteTitle: string;
}): string {
  if (pageTitle) {
    return pageTitle;
  }
  if (slug && slug !== "/") {
    return capitalize(slug.replace(/^\//, ""));
  }
  return siteTitle;
}

export function getSEOMetadata(page: PageSeoData = {}): Metadata {
  const {
    title: pageTitle,
    description: pageDescription,
    slug = "/",
    contentId,
    contentType,
    keywords: pageKeywords = [],
    seoNoIndex = false,
    pageType = "website",
    ...pageOverrides
  } = page;

  const baseUrl = getBaseUrl();
  const pageUrl = buildPageUrl({ baseUrl, slug });

  // Build default metadata values
  const defaultTitle = extractTitle({
    pageTitle,
    slug,
    siteTitle: siteConfig.title,
  });
  const defaultDescription = pageDescription || siteConfig.description;
  const allKeywords = [...siteConfig.keywords, ...pageKeywords];

  const ogImage = generateOgImageUrl({
    type: contentType,
    id: contentId,
  });
console.log("Generated OG Image URL:", defaultTitle);
  const fullTitle = defaultTitle

  // Build default metadata object
  const defaultMetadata: Metadata = {
    title: fullTitle,
    description: defaultDescription,
    metadataBase: new URL(baseUrl),
    creator: siteConfig.title,
    authors: [{ name: siteConfig.title }],
    icons: {
      icon: `${baseUrl}/favicon.ico`,
    },
    keywords: allKeywords,
    robots: seoNoIndex ? "noindex, nofollow" : "index, follow",
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      creator: siteConfig.twitterHandle,
      title: defaultTitle,
      description: defaultDescription,
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: pageType ?? "website",
      countryName: "UK",
      description: defaultDescription,
      title: defaultTitle,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: defaultTitle,
          secureUrl: ogImage,
        },
      ],
      url: pageUrl,
    },
  };

  // Override any defaults with page-specific metadata
  return {
    ...defaultMetadata,
    ...pageOverrides,
  };
}

// Structural type for the seo sub-object as returned by GROQ.
// coalesce() produces string | null (not string | undefined), so SeoFields can't be used directly.
type SeoInput = {
  title?: string | null;
  description?: string | null;
  robots?: { noIndex?: boolean | null; noFollow?: boolean | null } | null;
  metaImage?: {
    asset?: { _ref: string; _type: string; [key: string]: unknown };
  } | null;
  [key: string]: unknown;
};

// Shape returned by all SEO GROQ queries
type SeoQueryResult = {
  seo?: SeoInput | null;
  _id?: string | null;
  _type?: string | null;
  slug?: string | null;
} | null;

// Optional per-page hardcoded fallback defaults
type SeoDefaults = {
  title?: string;
  description?: string;
};

/**
 * Builds full Next.js Metadata from a Sanity SEO query result.
 * Mirrors getSEOMetadata defaults (title formatting, OG image, keywords, etc.).
 *
 * Priority chain for title/description:
 * seo.title (plugin field) → defaults.title (hardcoded fallback) → slug-derived → site default
 *
 * @param data     Result from any queryXxxSeo GROQ query ({ seo, _id, _type, slug })
 * @param defaults Optional hardcoded fallback title/description for pages that need them
 */
export function buildSEO(
  data: SeoQueryResult,
  defaults?: SeoDefaults,
): Metadata {
  if (data == null) {
    return {
      title: "Page Not Found",
      description: "The page you are looking for does not exist.",
    };
  }
  const seo = data?.seo ?? null;
  const baseUrl = getBaseUrl();

  const ogImage = generateOgImageUrl({
    type: data?._type ?? undefined,
    id: data?._id ?? undefined,
  });

  let metaImage = null;
  if (seo?.metaImage && "asset" in seo.metaImage && seo.metaImage.asset?._ref) {
    metaImage = urlFor(seo?.metaImage as SanityImageSource)
      .width(1200)
      .height(630)
      .url();
  }

  const seoMeta = buildSeoMeta({
    seo,
    baseUrl,
    path: data._type ?? "/",
    defaults: {
      title: defaults?.title ?? siteConfig.title,
      description: defaults?.description ?? siteConfig.description,
      siteName: siteConfig.title,
      twitterSite: siteConfig.twitterHandle,
      twitterCreator: siteConfig.twitterHandle,
      ogImage: metaImage ?? ogImage,
    },
    imageUrlResolver: (img) => {
      if (!img || !("asset" in img) || !(img as { asset?: unknown }).asset)
        return null;
      return urlFor(img as unknown as Parameters<typeof urlFor>[0])
        .width(1200)
        .height(630)
        .url();
    },
  });

  // Apply "Page | Site" title formatting
  const rawTitle =
    typeof seoMeta.title === "string"
      ? seoMeta.title
      : (defaults?.title ?? siteConfig.title);

  return {
    ...seoMeta,
    title: rawTitle,
    metadataBase: new URL(baseUrl),
    creator: siteConfig.title,
    authors: [{ name: siteConfig.title }],
    icons: { icon: `${baseUrl}/favicon.ico` },
    keywords: [
      ...siteConfig.keywords,
      ...((seoMeta.keywords as string[]) ?? []),
    ],
  };
}
