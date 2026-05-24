import { defineQuery } from "next-sanity";

const imageFields = /* groq */ `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  "alt": coalesce(
    alt,
    asset->altText,
    caption,
    asset->originalFilename,
    "untitled"
  ),
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
`;
// Base fragments for reusable query parts
const imageFragment = /* groq */ `
  image {
    ${imageFields}
  }
`;

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      type == "section" => "#" + coalesce(sectionId, ""),
      "#"
    ),
  }
`;

// const linkMarkFragment = /* groq */ `
//   _type == "link" => {
//     ...,
//     "openInNewTab": openInNewTab,
//     "href": select(
//       type == "internal" => internal>slug.current,
//       type == "external" => external,
//       type == "section" => "#" + coalesce(sectionId, ""),
//       "#"
//     )
//   }
// `;

const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;

const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;

const blogMarkDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    _type == "link" => {
      openInNewTab,
      "href": select(
        type == "internal" => internal->slug.current,
        type == "external" => external,
        "#"
      )
    }
  }
`;

const blogContentFragment = /* groq */ `
  content[]{
    _type,
    _key,
    _type == "headingBlock" => {
      text,
      level
    },
    _type == "paragraphBlock" => {
      content[]{
        ...,
        _type == "block" => {
          ...,
          ${blogMarkDefsFragment}
        },
        _type == "floatingImage" => {
          "image": image{
            ${imageFields}
          },
          position,
          maxWidth
        }
      }
    },
    _type == "imageBlock" => {
      "images": images[]{
        ${imageFields}
      },
      caption,
      size
    },
    _type == "videoBlock" => {
      source,
      url,
      "fileUrl": file.asset->url,
      caption
    },
    _type == "quoteBlock" => {
      style,
      content[]{
        ...,
        _type == "block" => {
          ...,
          ${blogMarkDefsFragment}
        }
      }
    },
    _type == "tableBlock" => {
      title,
      "table": table{
        rows[]{
          _key,
          cells
        }
      }
    },
    _type == "breakBlock" => {
      "breakType": type
    }
  }
`;

const blogAuthorFragment = /* groq */ `
  authors[0]->{
    _id,
    name,
    position,
    ${imageFragment}
  }
`;

const blogCardFragment = /* groq */ `
  _type,
  _id,
  title,
  description,
  "slug":slug.current,
  orderRank,
  ${imageFragment},
  publishedAt,
  ${blogAuthorFragment}
`;

const buttonsFragment = /* groq */ `
  buttons[]{
    text,
    variant,
    _key,
    _type,
    "openInNewTab": url.openInNewTab,
    "href": select(
      url.type == "internal" => url.internal->slug.current,
      url.type == "external" => url.external,
      url.type == "section" => "#" + coalesce(url.sectionId, ""),
      url.href
    ),
  }
`;

// Page builder block fragments
const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`;
const imageLinkCardsBlock = /* groq */ `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.type == "section" => "#" + coalesce(url.sectionId, ""),
        url.href
      ),
      ${imageFragment},
    })
  }
`;

const latestBlogPostsBlock = /* groq */ `
  _type == "latestBlogPosts" => {
    ...,
    "viewAllOpenInNewTab": viewAllUrl.openInNewTab,
    "viewAllHref": select(
      viewAllUrl.type == "internal" => viewAllUrl.internal->slug.current,
      viewAllUrl.type == "external" => viewAllUrl.external,
      viewAllUrl.type == "section" => "#" + coalesce(viewAllUrl.sectionId, ""),
      viewAllUrl.href
    )
  }
`;

const serviceCardsBlock = /* groq */ `
  _type == "serviceCards" => {
    ...,
    "serviceCards": array::compact(serviceCards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.type == "section" => "#" + coalesce(url.sectionId, ""),
        url.href
      ),
      ${imageFragment}
    }),
    "viewAllOpenInNewTab": viewAllUrl.openInNewTab,
    "viewAllHref": select(
      viewAllUrl.type == "internal" => viewAllUrl.internal->slug.current,
      viewAllUrl.type == "external" => viewAllUrl.external,
      viewAllUrl.type == "section" => "#" + coalesce(viewAllUrl.sectionId, ""),
      viewAllUrl.href
    ),
    "bottomCtaButtonOpenInNewTab": bottomCtaButtonUrl.openInNewTab,
    "bottomCtaButtonHref": select(
      bottomCtaButtonUrl.type == "internal" => bottomCtaButtonUrl.internal->slug.current,
      bottomCtaButtonUrl.type == "external" => bottomCtaButtonUrl.external,
      bottomCtaButtonUrl.type == "section" => "#" + coalesce(bottomCtaButtonUrl.sectionId, ""),
      bottomCtaButtonUrl.href
    ),
    "caseTypes": array::compact(caseTypes[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.type == "section" => "#" + coalesce(url.sectionId, ""),
        url.href
      )
    })
  }
`;

const serviceAreasBlock = /* groq */ `
  _type == "serviceAreas" => {
    ...,
    "groups": array::compact(groups[]{
      ...,
      "areas": array::compact(areas[]{
        ...,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.type == "section" => "#" + coalesce(url.sectionId, ""),
          url.href
        )
      })
    }),
    "ctaButtonOpenInNewTab": ctaButtonUrl.openInNewTab,
    "ctaButtonHref": select(
      ctaButtonUrl.type == "internal" => ctaButtonUrl.internal->slug.current,
      ctaButtonUrl.type == "external" => ctaButtonUrl.external,
      ctaButtonUrl.type == "section" => "#" + coalesce(ctaButtonUrl.sectionId, ""),
      ctaButtonUrl.href
    )
  }
`;

const heroPrimaryBlock = /* groq */ `
  _type == "heroPrimary" => {
    ...,
    "trustItems": array::compact(trustItems[]{
      ...
    }),
    ${buttonsFragment},
    backgroundImage {
      ${imageFields}
    },
    image {
      ${imageFields}
    }
  }
`;

const heroSecondaryBlock = /* groq */ `
  _type == "heroSecondary" => {
    ...,
    ${buttonsFragment},
    image {
      ${imageFields}
    }
  }
`;

const faqFragment = /* groq */ `
  "faqs": array::compact(faqs[]->{
    title,
    _id,
    _type,
    ${richTextFragment}
  })
`;

const faqAccordionBlock = /* groq */ `
  _type == "faqAccordion" => {
    ...,
    ${faqFragment},
    link{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.type == "section" => "#" + coalesce(url.sectionId, ""),
        url.href
      )
    }
  }
`;

const faqWithCtaBlock = /* groq */ `
  _type == "faqWithCta" => {
    ...,
    "ctaCardIcon": ctaCardIcon {
      ${imageFields}
    },
    ${faqFragment},
    highlights[]{
      ...,
    },
    ${buttonsFragment}
  }
`;

const subscribeNewsletterBlock = /* groq */ `
  _type == "subscribeNewsletter" => {
    ...,
    "subTitle": subTitle[]{
      ...,
      ${markDefsFragment}
    },
    "helperText": helperText[]{
      ...,
      ${markDefsFragment}
    }
  }
`;

const featureCardsIconBlock = /* groq */ `
  _type == "featureCardsIcon" => {
    ...,
    ${richTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${richTextFragment},
    })
  }
`;

const descriptionRichTextFragment = /* groq */ `
  "description": description[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;

const featureCardCarouselBlock = /* groq */ `
  _type == "featureCardCarousel" => {
    ...,
    ${descriptionRichTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${descriptionRichTextFragment}
    })
  }
`;

const richTextBlockContentFragment = /* groq */ `
  content[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;

const richTextBlock = /* groq */ `
  _type == "richTextBlock" => {
    ...,
    ${richTextBlockContentFragment}
  }
`;

const contentListBlock = /* groq */ `
  _type == "contentList" => {
    ...,
    description[]{
      ...,
      _type == "block" => {
        ...,
        ${markDefsFragment}
      }
    },
    "items": array::compact(items[]{
      ...,
      image {
        ${imageFields}
      },
      description[]{
        ...,
        _type == "block" => {
          ...,
          ${markDefsFragment}
        }
      },
      ${buttonsFragment}
    })
  }
`;

const richTextSectionFragment = /* groq */ `
  _type == "richTextSection" => {
    ...,
    richText[]{
      ...,
      _type == "block" => {
        ...,
        ${markDefsFragment}
      },
      _type == "singleImage" => {
        width,
        captionAlignment,
        caption[]{
          ...,
          _type == "block" => {
            ...,
            ${markDefsFragment}
          }
        },
        "image": image {
          ${imageFields},
          "alt": coalesce(image.alt, asset->altText, "")
        }
      },
      _type == "floatingImage" => {
        position,
        maxWidth,
        "image": image {
          ${imageFields},
          "alt": coalesce(image.alt, asset->altText, "")
        }
      },
      _type == "button" => {
        text,
        variant,
        size,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.type == "section" => "#" + coalesce(url.sectionId, ""),
          url.href
        )
      },
      _type == "buttonsGroup" => {
        buttons[]{
          text,
          variant,
          size,
          "openInNewTab": url.openInNewTab,
          "href": select(
            url.type == "internal" => url.internal->slug.current,
            url.type == "external" => url.external,
            url.type == "section" => "#" + coalesce(url.sectionId, ""),
            url.href
          )
        }
      },
      _type == "inlineContentSection" => {
        imagePosition,
        "image": image {
          ${imageFields}
        },
        description[]{
          ...,
          _type == "block" => {
            ...,
            ${markDefsFragment}
          }
        }
      }
    }
  }
`;

const mediaBlock = /* groq */ `
  _type == "media" => {
    ...,
    mediaType,
    image {
      ${imageFields},
      "caption": caption
    },
    video {
      "videoUrl": asset->url
    }
  }
`;

const splitContentContentFragment = /* groq */ `
  content[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    }
  }
`;

const splitContentMediaFragment = /* groq */ `
  media[]{
    _type,
    _key,
    _type == "image" => {
      ${imageFields},
      "caption": caption
    },
    _type == "video" => {
      "videoUrl": asset->url
    }
  }
`;

const splitContent = /* groq */ `
  _type == "splitContent" => {
    ...,
    ${splitContentContentFragment},
    ${splitContentMediaFragment}
  }
`;

const featuresGridBlock = /* groq */ `
  _type == "featuresGrid" => {
    ...,
    "features": array::compact(features[]{
      ...,
      "body": body[]{
        ...,
        _type == "block" => {
          ...,
          ${markDefsFragment}
        },
        _type == "image" => {
          ${imageFields},
          "caption": caption
        }
      }
    })
  }
`;

const scheduleConsultationBlock = /* groq */ `
  _type == "scheduleConsultation" => {
    ...,
    ${buttonsFragment},
  }
`;

const commercialCalculatorRefFragment = /* groq */ `
  commercialCalculator->{
    _id,
    _type,
    internalName,
    title,
    introText,
    quoteNote,
    pricing,
    addons[]{
      _key,
      title,
      description,
      rateAddition,
      isActive
    },
    furnishings[]{
      _key,
      label,
      multiplier,
      isDefault
    },
    buildingTypes[]{
      _key,
      label,
      isActive
    }
  }
`;

const residentialCalculatorRefFragment = /* groq */ `
  residentialCalculator->{
    _id,
    _type,
    internalName,
    title,
    disclaimerText,
    quoteResultsNote,
    cleaningRates,
    areaAverages,
    pricePerColorStain,
    "zipCodes": coalesce(
      zipCodeConfig->zipCodes[]{
        _key,
        label,
        zipStart,
        zipEnd,
        minimumCharge,
        isActive
      },
      zipCodes[]{
        _key,
        label,
        zipStart,
        zipEnd,
        minimumCharge,
        isActive
      }
    ),
    furnitureTiers[]{
      _key,
      label,
      rateAvg,
      rateLow,
      rateHigh,
      isNone
    },
    treatmentAddons[]{
      _key,
      key,
      label,
      description,
      multiplier,
      bundledMultiplier,
      isActive
    },
    oilSpotBrackets[]{
      _key,
      label,
      flatPrice
    }
  }
`;

const awardsAndReviewsBlock = /* groq */ `
  _type == "awardsAndReviews" => {
    ...,
    "awardImages": awardImages[]{
      "id": asset._ref,
      "preview": asset->metadata.lqip,
      "alt": coalesce(alt, asset->altText, "Award"),
      hotspot { x, y },
      crop { bottom, left, right, top }
    },
    "buttonText": button.text,
    "buttonVariant": button.variant,
    "buttonOpenInNewTab": button.url.openInNewTab,
    "buttonHref": select(
      button.url.type == "internal" => button.url.internal->slug.current,
      button.url.type == "external" => button.url.external,
      button.url.type == "section" => "#" + coalesce(button.url.sectionId, ""),
      button.url.href
    )
  }
`;

const carpetCalculatorBlock = /* groq */ `
  _type == "carpetCalculator" => {
    ...,
    calculatorType,
    title,
    anchorId,
    ${commercialCalculatorRefFragment},
    ${residentialCalculatorRefFragment}
  }
`;


const projectListingBlock = /* groq */ `
  _type == "projectListing" => {
    ...,
    badge,
    title,
    subtitle,
  }
`;

const singleLocationProjectsBlock = /* groq */ `
  _type == "singleLocationProjects" => {
    ...,
    badge,
    title,
    subtitle,
    city_states,
    project_types,
    materials_used,
  }
`;


const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${ctaBlock},
    ${heroPrimaryBlock},
    ${heroSecondaryBlock},
    ${faqAccordionBlock},
    ${faqWithCtaBlock},
    ${featureCardsIconBlock},
    ${featureCardCarouselBlock},
    ${contentListBlock},
    ${richTextBlock},
    ${richTextSectionFragment},
    ${mediaBlock},
    ${scheduleConsultationBlock},
    ${splitContent},
    ${featuresGridBlock},
    ${subscribeNewsletterBlock},
    ${imageLinkCardsBlock},
    ${latestBlogPostsBlock},
    ${serviceCardsBlock},
    ${serviceAreasBlock},
    ${awardsAndReviewsBlock},
    ${carpetCalculatorBlock},
    ${projectListingBlock},
    ${singleLocationProjectsBlock}
  }
`;

/**
 * Query to extract a single image from a page document
 * This is used as a type reference only and not for actual data fetching
 * Helps with TypeScript inference for image objects
 */
export const queryImageType = defineQuery(`
  *[_type == "page" && defined(image)][0]{
    ${imageFragment}
  }.image
`);

export const queryHomePageData =
  defineQuery(`*[_type == "homePage" && _id == "homePage"][0]{
    ...,
    _id,
    _type,
    "slug": slug.current,
    title,
    description,
    ${pageBuilderFragment}
  }`);

export const querySlugPageData = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    ${pageBuilderFragment}
  }
  `);

export const querySlugPagePaths = defineQuery(`
  *[_type == "page" && defined(slug.current)].slug.current
`);

export const queryBlogIndexPageData = defineQuery(`
  *[_type == "blogIndex"][0]{
    ...,
    _id,
    _type,
    title,
    description,
    "displayFeaturedBlogs" : displayFeaturedBlogs == "yes",
    "featuredBlogsCount" : featuredBlogsCount,
    ${pageBuilderFragment},
    "slug": slug.current
  }
`);

export const queryBlogIndexPageBlogs = defineQuery(`
  *[_type == "blog" && (seoHideFromLists != true)] | order(publishedAt desc) [$start...$end]{
    ${blogCardFragment}
  }
`);

export const queryAllBlogDataForSearch = defineQuery(`
  *[_type == "blog" && defined(slug.current) && (seoHideFromLists != true)] | order(publishedAt desc){
    ${blogCardFragment}
  }
`);

export const queryBlogIndexPageBlogsCount = defineQuery(`
  count(*[_type == "blog" && (seoHideFromLists != true)])
`);
export const queryBlogSlugPageData = defineQuery(`
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    ${blogAuthorFragment},
    ${imageFragment},
    ${richTextFragment},
    ${blogContentFragment},
    ${pageBuilderFragment}
  }
`);

export const queryBlogPaths = defineQuery(`
  *[_type == "blog" && defined(slug.current)].slug.current
`);

const ogFieldsFragment = /* groq */ `
  _id,
  _type,
  "title": select(
    defined(ogTitle) => ogTitle,
    defined(seoTitle) => seoTitle,
    title
  ),
  "description": select(
    defined(ogDescription) => ogDescription,
    defined(seoDescription) => seoDescription,
    description
  ),
  "image": image.asset->url + "?w=566&h=566&dpr=2&fit=max",
  "dominantColor": image.asset->metadata.palette.dominant.background,
  "seoImage": seoImage.asset->url + "?w=1200&h=630&dpr=2&fit=max", 
  "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
  "date": coalesce(date, _createdAt)
`;

export const queryHomePageOGData = defineQuery(`
  *[_type == "homePage" && _id == $id][0]{
    ${ogFieldsFragment}
  }
  `);

export const querySlugPageOGData = defineQuery(`
  *[_type == "page" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const queryBlogPageOGData = defineQuery(`
  *[_type == "blog" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const queryGenericPageOGData = defineQuery(`
  *[ defined(slug.current) && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const queryFooterData = defineQuery(`
  *[_type == "footer" && _id == "footer"][0]{
    _id,
    subtitle,
    columns[]{
      _key,
      title,
      links[]{
        _key,
        name,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.type == "section" => "#" + coalesce(url.sectionId, ""),
          url.href
        ),
      }
    }
  }
`);

export const queryNavbarData = defineQuery(`
  *[_type == "navbar" && _id == "navbar"][0]{
    _id,
    phoneNumber,
    columns[]{
      _key,
      _type == "navbarColumn" => {
        "type": "column",
        title,
        links[]{
          _key,
          name,
          icon,
          description,
          category,
          "openInNewTab": url.openInNewTab,
          "href": select(
            url.type == "internal" => url.internal->slug.current,
            url.type == "external" => url.external,
            url.type == "section" => "#" + coalesce(url.sectionId, ""),
            url.href
          )
        }
      },
      _type == "navbarLink" => {
        "type": "link",
        name,
        description,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.type == "section" => "#" + coalesce(url.sectionId, ""),
          url.href
        )
      }
    },
    ${buttonsFragment},
  }
`);

export const querySitemapData = defineQuery(`{
  "slugPages": *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  },
  "blogPages": *[_type == "blog" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  },
  "careersPages": *[_type == "careersIndex" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  }
}`);
export const queryGlobalSeoSettings = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    siteTitle,
    logo {
      ${imageFields}
    },
    logoDark {
      ${imageFields}
    },
    siteDescription,
    socialLinks{
      linkedin,
      facebook,
      twitter,
      instagram,
      youtube
    }
  }
`);

export const querySettingsData = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    siteTitle,
    siteDescription,
    "logo": logo.asset->url + "?w=80&h=40&dpr=3&fit=max",
    "socialLinks": socialLinks,
    "contactEmail": contactEmail,
  }
`);

export const queryRedirects = defineQuery(`
  *[_type == "redirect" && status == "active" && defined(source.current) && defined(destination.current)]{
    "source":source.current,
    "destination":destination.current,
    "permanent" : permanent == "true"
  }
`);

// Glossary queries
export const queryGlossaryIndexPageData = defineQuery(`
  *[_type == "glossaryIndex"][0]{
    ...,
    _id,
    _type,
    title,
    description,
    ${pageBuilderFragment},
    "slug": slug.current
  }
`);

const glossaryTermFragment = /* groq */ `
  _id,
  _type,
  term,
  "termSlug": termSlug.current,
  definition,
  example,
  whyItMatters,
  orderRank,
  "relatedTerms": relatedTerms[]->{
    _id,
    term,
    "termSlug": termSlug.current
  }
`;

export const queryGlossaryTerms = defineQuery(`
  *[_type == "glossary"] | order(term asc) {
    ${glossaryTermFragment}
  }
`);

// Careers queries
export const queryCareersIndexPageData = defineQuery(`
  *[_type == "careersIndex"][0]{
    ...,
    _id,
    _type,
    title,
    description,
    ${pageBuilderFragment},
    "slug": slug.current
  }
`);

const careerFragment = /* groq */ `
  _id,
  _type,
  name,
  location,
  employmentType,
  description,
  orderRank
`;

export const queryCareers = defineQuery(`
  *[_type == "career"] | order(orderRank asc) {
    ${careerFragment}
  }
`);

export const querySettingsForLayout = defineQuery(`
  *[_type == "settings"][0]{
    siteTitle,
    titleTemplate,
    "favicon": favicon.asset->url,
  }
`);
