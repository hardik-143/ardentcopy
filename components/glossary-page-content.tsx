"use client";

import { stegaClean } from "@sanity/client/stega";
import type { QueryGlossaryIndexPageDataResult } from "@/utils/sanity/sanity.types";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GlossaryTermModal } from "@/components/glossary-term-modal";
import { PageBuilder } from "@/components/pagebuilder";
import type { GlossaryTerm } from "@/types";

type GlossaryPageContentProps = {
  indexPageData: NonNullable<QueryGlossaryIndexPageDataResult>;
  terms: GlossaryTerm[];
};

export function GlossaryPageContent({
  indexPageData,
  terms,
}: GlossaryPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const termSlug = searchParams.get("term");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { title, description, pageBuilder = [], _id, _type } = indexPageData;

  // Find and open term from URL parameter
  useEffect(() => {
    if (termSlug) {
      const term = terms.find(
        (t) => stegaClean(t.termSlug ?? "") === termSlug
      );
      if (term) {
        setSelectedTerm(term);
        setIsModalOpen(true);
      }
    }
  }, [termSlug, terms]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTerm(null);
    // Remove term from URL
    router.push("/glossary", { scroll: false });
  }, [router]);

  // Handle term click
  const handleTermClick = useCallback(
    (term: GlossaryTerm) => {
      setSelectedTerm(term);
      setIsModalOpen(true);
      // Update URL with term (clean stega encoding)
      const cleanSlug = stegaClean(term.termSlug ?? "");
      router.push(`/glossary?term=${cleanSlug}`, { scroll: false });
    },
    [router]
  );

  // Filter terms based on search
  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return terms;

    const query = searchQuery.toLowerCase();
    return terms.filter(
      (term) =>
        term.term?.toLowerCase().includes(query) ||
        term.definition?.toLowerCase().includes(query)
    );
  }, [terms, searchQuery]);

  // Group terms alphabetically
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};

    for (const term of filteredTerms) {
      const firstLetter = (term.term?.[0] || "#").toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    }

    // Sort groups by letter
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTerms]);

  // Get all letters for quick navigation
  const allLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const term of terms) {
      const firstLetter = (term.term?.[0] || "#").toUpperCase();
      letters.add(firstLetter);
    }
    return Array.from(letters).sort();
  }, [terms]);

  return (
    <main className="bg-background">
      <div className="container mx-auto my-16 px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {title || "Legal Glossary"}
          </h1>
          {description && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative mx-auto mb-8 max-w-xl">
          <SearchIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-3 pr-4 pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Alphabet Navigation */}
        {!searchQuery && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {allLetters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="flex size-10 items-center justify-center rounded-lg bg-muted font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {letter}
              </a>
            ))}
          </div>
        )}

        {/* Terms List */}
        {groupedTerms.length > 0 ? (
          <div className="space-y-12">
            {groupedTerms.map(([letter, letterTerms]) => (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className="mb-6 border-b pb-2 text-2xl font-bold text-foreground">
                  {letter}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {letterTerms.map((term) => (
                    <button
                      key={term._id}
                      type="button"
                      onClick={() => handleTermClick(term)}
                      className="group rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md cursor-pointer"
                    >
                      <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary">
                        {term.term}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {term.definition}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? `No terms found for "${searchQuery}"`
                : "No glossary terms available."}
            </p>
          </div>
        )}
      </div>

      {/* Page Builder */}
      {pageBuilder && pageBuilder.length > 0 && (
        <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} />
      )}

      {/* Term Modal */}
      <GlossaryTermModal
        term={selectedTerm}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
}
