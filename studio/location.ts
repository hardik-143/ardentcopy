import { defineLocations } from "sanity/presentation";

const withLeadingSlash = (slug?: string | null) => {
  if (!slug) {
    return "/";
  }
  return slug.startsWith("/") ? slug : `/${slug}`;
};

const blogHref = (slug?: string | null) => {
  if (!slug) {
    return "/blog";
  }
  if (slug.startsWith("/")) {
    return slug;
  }
  return `/blog/${slug}`;
};

export const locations = {
  blog: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: blogHref(doc?.slug),
        },
        {
          title: "Blog",
          href: "/blog",
        },
      ],
    }),
  }),
  homePage: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: () => ({
      locations: [
        {
          title: "Home",
          href: "/",
        },
      ],
    }),
  }),
  page: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: withLeadingSlash(doc?.slug),
        },
      ],
    }),
  }),
  blogIndex: defineLocations({
    select: {
      title: "title",
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Blog",
          href: "/blog",
        },
      ],
    }),
  }),
  careersIndex: defineLocations({
    select: {
      title: "title",
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Careers",
          href: "/careers",
        },
      ],
    }),
  }),
  glossaryIndex: defineLocations({
    select: {
      title: "title",
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Glossary",
          href: "/glossary",
        },
      ],
    }),
  }),
};
