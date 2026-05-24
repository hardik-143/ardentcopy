import { env } from "@/utils/env/client";
import type { PortableTextBlock } from "next-sanity";
import slugify from "slugify";

const getRuntimeEnv = (key: string) =>
  typeof process === "undefined" ? undefined : process.env[key];

const normalizeBaseUrl = (url: string) => {
  const urlWithProtocol = /^https?:\/\//.test(url) ? url : `https://${url}`;
  return urlWithProtocol.replace(/\/$/, "");
};

const getVercelPreviewUrl = () => {
  if (getRuntimeEnv("VERCEL_ENV") !== "preview") {
    return;
  }

  const previewUrl =
    getRuntimeEnv("VERCEL_BRANCH_URL") ?? getRuntimeEnv("VERCEL_URL");

  return previewUrl ? normalizeBaseUrl(previewUrl) : undefined;
};

export const getBaseUrl = () =>
  getVercelPreviewUrl() ?? normalizeBaseUrl(env.NEXT_PUBLIC_BASE_URL);

export const BASE_URL = getBaseUrl();

export const isRelativeUrl = (url: string) =>
  url.startsWith("/") || url.startsWith("#") || url.startsWith("?");

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return isRelativeUrl(url);
  }
};

/** Normalizes string and strips zero-width/invisible unicode. Use for highlight matching. */
export function cleanString(str: string) {
  return str
    .normalize("NFKD")
    .replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, "")
    .trim();
}

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const getTitleCase = (name: string) => {
  const titleTemp = name.replace(/([A-Z])/g, " $1");
  return titleTemp.charAt(0).toUpperCase() + titleTemp.slice(1);
};

type Response<T> = [T, undefined] | [undefined, string];

export async function handleErrors<T>(
  promise: Promise<T>
): Promise<Response<T>> {
  try {
    const data = await promise;
    return [data, undefined];
  } catch (err) {
    return [
      undefined,
      err instanceof Error ? err.message : JSON.stringify(err),
    ];
  }
}

export function convertToSlug(
  text?: string,
  { fallback }: { fallback?: string } = { fallback: "top-level" }
) {
  if (!text) {
    return fallback;
  }
  return slugify(text.trim(), {
    lower: true,
    remove: /[^a-zA-Z0-9 ]/g,
  });
}

export function parseChildrenToSlug(children: PortableTextBlock["children"]) {
  if (!children) {
    return "";
  }
  return convertToSlug(children.map((child) => child.text).join(""));
}

const BLOG_ITEMS_PER_PAGE = 12;

export function getBlogPaginationStartEnd(page: number): {
  start: number;
  end: number;
} {
  const start = (page - 1) * BLOG_ITEMS_PER_PAGE;
  const end = start + BLOG_ITEMS_PER_PAGE;
  return { start, end };
}

export type PaginationMetadata = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export function calculatePaginationMetadata(
  totalItems: number,
  currentPage = 1,
  itemsPerPage = BLOG_ITEMS_PER_PAGE
): PaginationMetadata {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
  };
}


export function cleanInvisibleUnicode(str: string) {
  return str.replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, "");
}