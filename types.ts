import type {
  QueryBlogIndexPageBlogsResult,
  QueryBlogSlugPageDataResult,
  QueryCareersResult,
  QueryGlobalSeoSettingsResult,
  QueryGlossaryTermsResult,
  QueryHomePageDataResult,
  QueryImageTypeResult,
  QueryNavbarDataResult,
} from "@/utils/sanity/sanity.types";

export type PageBuilderBlockTypes = NonNullable<
  NonNullable<QueryHomePageDataResult>["pageBuilder"]
>[number]["_type"];

export type PagebuilderType<T extends PageBuilderBlockTypes> = Extract<
  NonNullable<NonNullable<QueryHomePageDataResult>["pageBuilder"]>[number],
  { _type: T }
>;

export type SanityButtonProps = NonNullable<
  NonNullable<PagebuilderType<"heroPrimary">>["buttons"]
>[number];

export type SanityImageProps = NonNullable<QueryImageTypeResult>;

export type SanityRichTextProps =
  NonNullable<QueryBlogSlugPageDataResult>["richText"];

export type SanityRichTextBlock = Extract<
  NonNullable<NonNullable<SanityRichTextProps>[number]>,
  { _type: "block" }
>;

export type Blog = NonNullable<QueryBlogIndexPageBlogsResult>[number];

export type Maybe<T> = T | null | undefined;

// Navigation types
export type NavigationData = {
  navbarData: QueryNavbarDataResult;
  settingsData: QueryGlobalSeoSettingsResult;
};

export type NavColumn = NonNullable<
  NonNullable<QueryNavbarDataResult>["columns"]
>[number];

export type ColumnLink =
  Extract<NavColumn, { type: "column" }>["links"] extends Array<infer T>
    ? T
    : never;

export type MenuLinkProps = {
  name: string;
  href: string;
  description?: string;
  icon?: string | null;
  onClick?: () => void;
  className?: string;
};

// Glossary types
export type GlossaryTerm = NonNullable<QueryGlossaryTermsResult>[number];

// Careers types
export type Career = NonNullable<QueryCareersResult>[number];
