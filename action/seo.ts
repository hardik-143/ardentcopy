import { sanityFetch } from "@/utils/sanity/live";
import { querySettingsForLayout } from "@/utils/sanity/query";
import {
  queryHomePageSeo,
  queryBlogIndexPageSeo,
  queryBlogSlugPageSeo,
  queryGlossaryIndexPageSeo,
  queryCareersIndexPageSeo,
  querySlugPageSeo,
} from "@/utils/sanity/queries/seo";

export async function fetchLayoutSettings() {
  return await sanityFetch({ query: querySettingsForLayout });
}

export async function fetchHomePageSEOData() {
  return await sanityFetch({ query: queryHomePageSeo });
}

export async function fetchBlogIndexPageSEOData() {
  return await sanityFetch({ query: queryBlogIndexPageSeo });
}

export async function fetchBlogSlugPageSEOData(slug: string) {
  return await sanityFetch({
    query: queryBlogSlugPageSeo,
    params: { slug: `/blog/${slug}` },
  });
}

export async function fetchGlossaryIndexPageSEOData() {
  return await sanityFetch({ query: queryGlossaryIndexPageSeo });
}

export async function fetchCareersIndexPageSEOData() {
  return await sanityFetch({ query: queryCareersIndexPageSeo });
}

export async function fetchSlugPageSEOData(slug: string) {
  return await sanityFetch({
    query: querySlugPageSeo,
    params: { slug: `/${slug}` },
  });
}
