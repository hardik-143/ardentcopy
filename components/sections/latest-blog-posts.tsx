"use client";

import { client } from "@/utils/sanity/client";
import { queryBlogIndexPageBlogs } from "@/utils/sanity/query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { useEffect, useState } from "react";

import type { PagebuilderType } from "@/types";
import type { Blog } from "@/types";
import { BlogCard } from "../blog-card";
import { TitleWithHighlight } from "../elements/title-with-highlight";

export type LatestBlogPostsProps = PagebuilderType<"latestBlogPosts">;

export function LatestBlogPostsBlock({
  title,
  highlightedText,
  count = 3,
  viewAllHref,
  viewAllText,
  viewAllOpenInNewTab,
}: LatestBlogPostsProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const limit = Math.min(Math.max(Number(count) || 3, 1), 12);
  const sectionTitle = title?.trim() || "Latest from our blog";

  useEffect(() => {
    let cancelled = false;

    async function fetchBlogs() {
      setLoading(true);
      try {
        const data = await client.fetch(queryBlogIndexPageBlogs, {
          start: 0,
          end: limit,
        });
        if (!cancelled && Array.isArray(data)) {
          setBlogs(data);
        }
      } catch {
        // Fetch failed (e.g. network, or no published blogs - client uses perspective "published")
        if (!cancelled) {
          setBlogs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBlogs();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <section
      aria-labelledby="latest-blog-posts-heading"
      className="py-16 md:py-20"
      id="latest-blog-posts"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2
            className="font-bold tracking-tighter text-3xl text-foreground md:text-4xl"
            id="latest-blog-posts-heading"
          >
            <TitleWithHighlight
              highlightedText={highlightedText}
              title={sectionTitle}
            />
          </h2>
          {viewAllHref ? (
            <Link
              className="inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline"
              href={stegaClean(viewAllHref)}
              rel={viewAllOpenInNewTab ? "noopener noreferrer" : undefined}
              target={viewAllOpenInNewTab ? "_blank" : "_self"}
            >
              {viewAllText ?? "View all posts"}
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0"
                strokeWidth={2}
              />
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 items-stretch gap-8 md:gap-12 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, index) => (
              <BlogCard key={`skeleton-${index.toString()}`} blog={null} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No blog posts available. In Sanity Studio, make sure you have blog
            documents and that they are <strong>published</strong> (not just
            saved as drafts).
          </p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-8 md:gap-12 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard blog={blog} key={blog._id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
