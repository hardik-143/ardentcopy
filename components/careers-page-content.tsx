"use client";

import type { QueryCareersIndexPageDataResult } from "@/utils/sanity/sanity.types";
import type { Career } from "@/types";

import { CareerCard } from "@/components/career-card";
import { PageBuilder } from "@/components/pagebuilder";

type CareersPageContentProps = {
  indexPageData: NonNullable<QueryCareersIndexPageDataResult>;
  careers: Career[];
};

export function CareersPageContent({
  indexPageData,
  careers,
}: CareersPageContentProps) {
  const { title, description, pageBuilder = [], _id, _type } = indexPageData;

  return (
    <main className="bg-background">
      <div className="container mx-auto my-16 px-4 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {title || "Careers"}
          </h1>
          {description && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {careers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {careers.map((career) => (
              <CareerCard key={career._id} career={career} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No open positions at the moment. Check back later.
            </p>
          </div>
        )}
      </div>

      {pageBuilder && pageBuilder.length > 0 && (
        <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} />
      )}
    </main>
  );
}
