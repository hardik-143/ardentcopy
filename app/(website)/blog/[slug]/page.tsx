import { Logger } from "@/utils/logger";
import { client } from "@/utils/sanity/client";
import { sanityFetch } from "@/utils/sanity/live";
import { queryBlogPaths, queryBlogSlugPageData } from "@/utils/sanity/query";
import { notFound } from "next/navigation";

import { BlogArticleTopBar } from "@/components/blog-article-top-bar";
import { BlogContent } from "@/components/elements/blog-content";
import { RichText } from "@/components/elements/rich-text";
import { SanityImage } from "@/components/elements/sanity-image";
import { ArticleJsonLd } from "@/components/json-ld";
import { buildSEO } from "@/lib/seo";
import { fetchBlogSlugPageSEOData } from "@/action/seo";

const logger = new Logger("BlogSlug");

async function fetchBlogSlugPageData(slug: string) {
  return await sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug: `/blog/${slug}` },
  });
}

async function fetchBlogPaths() {
  try {
    const slugs = await client.fetch(queryBlogPaths);

    // If no slugs found, return empty array to prevent build errors
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return [];
    }

    const paths: { slug: string }[] = [];
    for (const slug of slugs) {
      if (!slug) {
        continue;
      }
      const [, , path] = slug.split("/");
      if (path) {
        paths.push({ slug: path });
      }
    }
    return paths;
  } catch (error) {
    logger.error("Error fetching blog paths", error);
    // Return empty array to allow build to continue
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await fetchBlogSlugPageSEOData(slug);
  return buildSEO(data);
}

export async function generateStaticParams() {
  const paths = await fetchBlogPaths();
  return paths;
}

// Allow dynamic params for paths not generated at build time
export const dynamicParams = true;

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await fetchBlogSlugPageData(slug);
  if (!data) {
    return notFound();
  }
  const { title, description, image, richText, authors, publishedAt } =
    data ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (data as any)?.content as any[] | undefined;

  return (
    <div className="container mx-auto my-16 px-4 md:px-6">
      <div className="flex justify-center">
        <div className="flex w-full max-w-2xl flex-col items-center">
          <BlogArticleTopBar author={authors} publishedAt={publishedAt} />
          <main className="w-full">
            <ArticleJsonLd article={data} />
            <header className="mb-8">
              <h1 className="mt-2 font-bold text-4xl">{title}</h1>
            </header>
            {image && (
              <div className="mb-12 w-full overflow-hidden rounded-lg">
                <SanityImage
                  alt={title}
                  className="h-full w-full object-cover object-center rounded-lg"
                  height={450}
                  image={image}
                  loading="eager"
                  width={1600}
                />
              </div>
            )}
            {content?.length ? (
              <BlogContent content={content} />
            ) : (
              <RichText richText={richText} />
            )}
          </main>

          {/* <div className="hidden lg:block">
            <div className="sticky top-4 rounded-lg">
              <TableOfContent richText={richText ?? []} />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
