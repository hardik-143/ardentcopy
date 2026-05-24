import Link from "next/link";

import type { Blog } from "@/types";
import { SanityImage } from "./elements/sanity-image";

type BlogImageProps = {
  image: Blog["image"];
  title?: string | null;
  rounded?: boolean;
};

function BlogImage({ image, title, rounded = true }: BlogImageProps) {
  if (!image?.id) {
    return null;
  }

  return (
    <SanityImage
      alt={title ?? "Blog post image"}
      className={`aspect-video w-full bg-gray-100 object-cover sm:aspect-2/1 lg:aspect-3/2 ${rounded ? "rounded-2xl" : "rounded-none"}`}
      height={400}
      image={image}
      width={800}
    />
  );
}

type AuthorImageProps = {
  author: Blog["authors"];
};

function AuthorImage({ author }: AuthorImageProps) {
  if (!author?.image) {
    return null;
  }

  return (
    <SanityImage
      alt={author.name ?? "Author image"}
      className="size-8 flex-none rounded-full bg-gray-50"
      height={40}
      image={author.image}
      width={40}
    />
  );
}

type BlogAuthorProps = {
  author: Blog["authors"];
};

export function BlogAuthor({ author }: BlogAuthorProps) {
  if (!author) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-2.5 font-semibold text-gray-900 text-sm/6">
      <AuthorImage author={author} />
      {author.name}
    </div>
  );
}

type BlogCardProps = {
  blog: Blog | null;
};

type FeaturedBlogCardProps = {
  blog: Blog;
};

function BlogMeta({
  publishedAt,
  compact,
}: {
  publishedAt: string | null;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "mb-2 flex items-center gap-x-4 text-xs"
          : "my-4 flex items-center gap-x-4 text-xs"
      }
    >
      <time className="text-muted-foreground" dateTime={publishedAt ?? ""}>
        {publishedAt
          ? new Date(publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : ""}
      </time>
    </div>
  );
}

function BlogContent({
  title,
  description,
  isFeatured,
}: {
  title: string | null;
  description: string | null;
  isFeatured?: boolean;
}) {
  const HeadingTag = isFeatured ? "h2" : "h3";
  const headingClasses = isFeatured
    ? "mt-3 text-3xl font-semibold leading-tight"
    : "mt-3 text-lg font-semibold leading-6";

  return (
    <div className="group relative">
      <HeadingTag className={headingClasses}>{title}</HeadingTag>
      <p className="mt-3 text-muted-foreground text-sm leading-6">
        {description}
      </p>
    </div>
  );
}

export function FeaturedBlogCard({ blog }: FeaturedBlogCardProps) {
  const { title, publishedAt, slug, description, image } = blog ?? {};
  const href = slug ?? "#";

  return (
    <Link className="group block" href={href}>
      <article className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2 border border-border transition-colors group-hover:border-primary">
        <div className="overflow-hidden">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <BlogImage image={image} title={title} />
          </div>
        </div>
        <div className="space-y-6">
          <BlogMeta publishedAt={publishedAt} />
          <BlogContent
            description={description}
            isFeatured
            title={title}
          />
        </div>
      </article>
    </Link>
  );
}

export function BlogCard({ blog }: BlogCardProps) {
  if (!blog) {
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-card border border-border transition-colors group-hover:border-primary">
        <div className="aspect-video w-full flex-none overflow-hidden">
          <div className="h-full w-full animate-pulse bg-muted" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col space-y-2 p-5">
          <div className="h-3 w-24 flex-none animate-pulse rounded bg-muted" />
          <div className="h-6 w-full flex-none animate-pulse rounded bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
        </div>
      </article>
    );
  }

  const { title, publishedAt, slug, description, image } = blog;
  const href = slug ?? "#";

  return (
    <Link className="group flex h-full" href={href}>
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-card border border-border transition-colors group-hover:border-primary">
        <div className="aspect-video w-full flex-none overflow-hidden">
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
            <BlogImage image={image} rounded={false} title={title} />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-start space-y-2 overflow-hidden p-5">
          <BlogMeta compact publishedAt={publishedAt} />
          <div className="group relative min-h-0 min-w-0">
            <h3 className="line-clamp-2 sm:text-lg text-xl font-bold leading-tight">
              {title}
            </h3>
            <p className="mt-3 line-clamp-3 text-muted-foreground text-sm leading-6">
              {description}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function BlogHeader({
  title,
  description,
}: {
  title: string | null;
  description: string | null;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-bold text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-8">
          {description}
        </p>
      </div>
    </div>
  );
}
