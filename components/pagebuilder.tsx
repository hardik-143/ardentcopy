"use client";

import { useOptimistic } from "@sanity/visual-editing/react";
import { env } from "@/utils/env/client";
import type { QueryHomePageDataResult } from "@/utils/sanity/sanity.types";
import { createDataAttribute } from "next-sanity";
import { useCallback, useMemo } from "react";

import { FaqJsonLd, type FlexibleFaq } from "./json-ld";
import { AwardsAndReviewsBlock } from "./sections/awards-and-reviews";
import { CarpetCalculatorBlock } from "./sections/carpet-calculator";
import { ContentListBlock } from "./sections/content-list";
import { CTABlock } from "./sections/cta";
import { FaqAccordion } from "./sections/faq-accordion";
import { FaqWithCta } from "./sections/faq-with-cta";
import { FeatureCardCarousel } from "./sections/feature-card-carousel";
import { FeatureCardsWithIcon } from "./sections/feature-cards-with-icon";
import { FeaturesGrid } from "./sections/features-grid";
import { HeroBlock } from "./sections/hero-primary";
import { HeroSecondaryBlock } from "./sections/hero-secondary";
import { ImageLinkCards } from "./sections/image-link-cards";
import { LatestBlogPostsBlock } from "./sections/latest-blog-posts";
import { MediaBlock } from "./sections/media";
import { RichTextBlock } from "./sections/rich-text-block";
import { RichTextSectionBlock } from "./sections/rich-text-section";
import { ScheduleConsultation } from "./sections/schedule-consultation";
import { ServiceAreas } from "./sections/service-areas";
import { ServiceCards } from "./sections/service-cards";
import { ProjectListingBlock } from "./sections/project-listing";
import { SingleLocationProjectsBlock } from "./sections/single-location-projects";
import { SpacerBlock } from "./sections/spacer";
import { SplitContent } from "./sections/split-content";
import { SubscribeNewsletter } from "./sections/subscribe-newsletter";

// More specific and descriptive type aliases
type PageBuilderBlock = NonNullable<
  NonNullable<QueryHomePageDataResult>["pageBuilder"]
>[number];

export type PageBuilderProps = {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly id: string;
  readonly type: string;
};

type SanityDataAttributeConfig = {
  readonly id: string;
  readonly type: string;
  readonly path: string;
};

// Strongly typed component mapping with proper component signatures
const BLOCK_COMPONENTS = {
  awardsAndReviews: AwardsAndReviewsBlock,
  cta: CTABlock,
  faqAccordion: FaqAccordion,
  faqWithCta: FaqWithCta,
  featureCardCarousel: FeatureCardCarousel,
  featuresGrid: FeaturesGrid,
  featureCardsIcon: FeatureCardsWithIcon,
  heroPrimary: HeroBlock,
  heroSecondary: HeroSecondaryBlock,
  imageLinkCards: ImageLinkCards,
  latestBlogPosts: LatestBlogPostsBlock,
  media: MediaBlock,
  richTextBlock: RichTextBlock,
  richTextSection: RichTextSectionBlock,
  contentList: ContentListBlock,
  scheduleConsultation: ScheduleConsultation,
  serviceAreas: ServiceAreas,
  splitContent: SplitContent,
  subscribeNewsletter: SubscribeNewsletter,
  serviceCards: ServiceCards,
  spacer: SpacerBlock,
  carpetCalculator: CarpetCalculatorBlock,
  projectListing: ProjectListingBlock,
  singleLocationProjects: SingleLocationProjectsBlock,
  // biome-ignore lint/suspicious/noExplicitAny: <any is used to allow for dynamic component rendering>
} as const satisfies Record<string, React.ComponentType<any>>;

/**
 * Helper function to create consistent Sanity data attributes
 */
function createSanityDataAttribute(config: SanityDataAttributeConfig): string {
  return createDataAttribute({
    id: config.id,
    baseUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    type: config.type,
    path: config.path,
  }).toString();
}

/**
 * Error fallback component for unknown block types
 */
function UnknownBlockError({
  blockType,
  blockKey,
}: {
  blockType: string;
  blockKey: string;
}) {
  return (
    <div
      aria-label={`Unknown block type: ${blockType}`}
      className="flex items-center justify-center rounded-lg border-2 border-muted-foreground/20 border-dashed bg-muted p-8 text-center text-muted-foreground"
      key={`${blockType}-${blockKey}`}
      role="alert"
    >
      <div className="space-y-2">
        <p>Component not found for block type:</p>
        <code className="rounded bg-background px-2 py-1 font-mono text-sm">
          {blockType}
        </code>
      </div>
    </div>
  );
}

/**
 * Hook to handle optimistic updates for page builder blocks
 */
function useOptimisticPageBuilder(
  initialBlocks: PageBuilderBlock[],
  documentId: string
) {
  // biome-ignore lint/suspicious/noExplicitAny: <any is used to allow for dynamic component rendering>
  return useOptimistic<PageBuilderBlock[], any>(
    initialBlocks,
    (currentBlocks, action) => {
      if (action.id === documentId && action.document?.pageBuilder) {
        return action.document.pageBuilder;
      }
      return currentBlocks;
    }
  );
}

/**
 * Custom hook for block component rendering logic
 */
function useBlockRenderer(id: string, type: string) {
  const createBlockDataAttribute = useCallback(
    (blockKey: string) =>
      createSanityDataAttribute({
        id,
        type,
        path: `pageBuilder[_key=="${blockKey}"]`,
      }),
    [id, type]
  );

  const renderBlock = useCallback(
    (block: PageBuilderBlock, _index: number) => {
      const Component =
        BLOCK_COMPONENTS[block._type as keyof typeof BLOCK_COMPONENTS];

      if (!Component) {
        return (
          <UnknownBlockError
            blockKey={block._key}
            blockType={block._type}
            key={`${block._type}-${block._key}`}
          />
        );
      }

      return (
        <div
          data-sanity={createBlockDataAttribute(block._key)}
          id={(block as any).anchorId || block._key}
          key={`${block._type}-${block._key}`}
        >
          {/** biome-ignore lint/suspicious/noExplicitAny: <any is used to allow for dynamic component rendering> */}
          <Component {...(block as any)} />
        </div>
      );
    },
    [createBlockDataAttribute]
  );

  return { renderBlock };
}

/**
 * PageBuilder component for rendering dynamic content blocks from Sanity CMS
 */
export function PageBuilder({
  pageBuilder: initialBlocks = [],
  id,
  type,
}: PageBuilderProps) {
  const blocks = useOptimisticPageBuilder(initialBlocks, id);
  const { renderBlock } = useBlockRenderer(id, type);

  const allFaqs = useMemo((): FlexibleFaq[] => {
    const faqMap = new Map<string, FlexibleFaq>();
    for (const block of blocks) {
      if (block._type === "faqAccordion" || block._type === "faqWithCta") {
        const faqs = "faqs" in block ? block.faqs : undefined;
        for (const faq of faqs ?? []) {
          if (faq?._id && !faqMap.has(faq._id)) {
            faqMap.set(faq._id, faq as FlexibleFaq);
          }
        }
      }
    }
    return [...faqMap.values()];
  }, [blocks]);

  const containerDataAttribute = useMemo(
    () => createSanityDataAttribute({ id, type, path: "pageBuilder" }),
    [id, type]
  );

  if (!blocks.length) {
    return null;
  }

  return (
    <main
      className="mx-auto flex max-w-8xl flex-col"
      data-sanity={containerDataAttribute}
    >
      {allFaqs.length > 0 && <FaqJsonLd faqs={allFaqs} />}
      {blocks.map(renderBlock)}
    </main>
  );
}
