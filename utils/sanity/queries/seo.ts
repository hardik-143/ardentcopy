import { defineQuery } from "next-sanity";

// Fetches seo sub-object (with doc-level title/desc fallback) plus
// the document's own _id, _type, and slug for OG image generation and canonical URLs.
const seoProjection = `{
  "seo": {
    ...seo,
    "title": coalesce(seo.title, title),
    "description": coalesce(seo.description, description),
  },
  _id,
  _type,
  "slug": slug.current
}`;

export const queryHomePageSeo = defineQuery(
  `*[_type == "homePage"][0]${seoProjection}`
);
export const queryBlogIndexPageSeo = defineQuery(
  `*[_type == "blogIndex"][0]${seoProjection}`
);
export const queryBlogSlugPageSeo = defineQuery(
  `*[_type == "blog" && slug.current == $slug][0]${seoProjection}`
);
export const queryGlossaryIndexPageSeo = defineQuery(
  `*[_type == "glossaryIndex"][0]${seoProjection}`
);
export const queryCareersIndexPageSeo = defineQuery(
  `*[_type == "careersIndex"][0]${seoProjection}`
);
export const querySlugPageSeo = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]${seoProjection}`
);
