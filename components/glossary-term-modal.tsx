"use client";

import { stegaClean } from "@sanity/client/stega";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/utils/ui/components/dialog";
import { ArrowRightIcon, ShareIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import type { GlossaryTerm } from "@/types";

type GlossaryTermModalProps = {
  term: GlossaryTerm | null;
  isOpen: boolean;
  onClose: () => void;
};

export function GlossaryTermModal({
  term,
  isOpen,
  onClose,
}: GlossaryTermModalProps) {
  const router = useRouter();

  if (!term) return null;

  const cleanTermSlug = stegaClean(term.termSlug ?? "");

  const handleShare = async () => {
    const url = `${window.location.origin}/glossary?term=${cleanTermSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: stegaClean(term.term ?? ""),
          text: stegaClean(term.definition ?? ""),
          url,
        });
      } catch (_err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleRelatedTermClick = (slug: string) => {
    onClose();
    router.push(`/glossary?term=${stegaClean(slug)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{term.term}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Definition */}
          <div>
            <p className="text-foreground leading-relaxed">{term.definition}</p>
          </div>

          {/* Example */}
          {term.example && (
            <div className="rounded-lg border-l-4 border-primary bg-primary/10 p-4">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Example
              </p>
              <p className="italic text-foreground">{term.example}</p>
            </div>
          )}

          {/* Why This Matters */}
          {term.whyItMatters && (
            <div>
              <h4 className="mb-2 font-semibold text-foreground">
                Why This Matters in Personal Injury Cases
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {term.whyItMatters}
              </p>
            </div>
          )}

          {/* Related Terms */}
          {(() => {
            const relatedTerms =
              term.relatedTerms?.filter(
                (r): r is NonNullable<typeof r> & { term: string } =>
                  r != null && typeof (r as { term?: string }).term === "string",
              ) ?? [];
            if (relatedTerms.length === 0) return null;
            return (
              <div>
                <h4 className="mb-3 font-semibold text-foreground">
                  Related Terms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relatedTerms.map((related) => (
                    <button
                      key={related._id}
                      type="button"
                      onClick={() =>
                        related.termSlug &&
                        handleRelatedTermClick(related.termSlug)
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 cursor-pointer"
                    >
                      {related.term}
                      <ArrowRightIcon className="size-3" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Share */}
          <div className="flex items-center justify-end border-t pt-4">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <ShareIcon className="size-4" />
              Share this term
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
