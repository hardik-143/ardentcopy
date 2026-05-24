import { clientRaw } from "@/utils/sanity/client";
import { sanityFetch } from "@/utils/sanity/live";
import {
  queryGlossaryIndexPageData,
  queryGlossaryTerms,
} from "@/utils/sanity/query";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { GlossaryPageContent } from "@/components/glossary-page-content";
import { buildSEO } from "@/lib/seo";
import { fetchGlossaryIndexPageSEOData } from "@/action/seo";
import { handleErrors } from "@/utils";

async function fetchGlossaryIndexPageData() {
  const res = await sanityFetch({ query: queryGlossaryIndexPageData });
  return res.data;
}

/**
 * Fetch glossary terms with "raw" perspective so relatedTerms references
 * (which may point at draft documents) resolve correctly.
 */
async function fetchGlossaryTerms() {
  const terms = await clientRaw.fetch(queryGlossaryTerms);
  return terms;
}

export async function generateMetadata() {
  const { data } = await fetchGlossaryIndexPageSEOData();
  return buildSEO(data, {
    title: "Glossary",
    description: "Legal glossary",
  });
}

export default async function GlossaryPage() {
  const [[indexPageData, errIndexPageData], [terms, errTerms]] =
    await Promise.all([
      handleErrors(fetchGlossaryIndexPageData()),
      handleErrors(fetchGlossaryTerms()),
    ]);

  if (errIndexPageData || !indexPageData) {
    notFound();
  }

  if (errTerms || !terms) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {indexPageData.title || "Legal Glossary"}
          </h1>
          {indexPageData.description && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {indexPageData.description}
            </p>
          )}
        </div>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Unable to load glossary terms at the moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <Suspense fallback={null}>
      <GlossaryPageContent indexPageData={indexPageData} terms={terms} />
    </Suspense>
  );
}
