import { Button } from "@/utils/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Thank You",
  robots: "noindex, nofollow",
};

type ThankYouSearchParams = Record<string, string | string[] | undefined>;
type ThankYouContent = {
  title: string;
  body: ReactNode;
  detail: string;
  ctaHref: string;
  ctaLabel: string;
  ctaExternal: boolean;
};

function getSingleSearchParam(
  searchParams: ThankYouSearchParams,
  key: string
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function getEligibility(searchParams: ThankYouSearchParams): boolean | undefined {
  const eligible = getSingleSearchParam(searchParams, "eligible")
    ?.trim()
    .toLowerCase();

  if (eligible === "true") {
    return true;
  }

  if (eligible === "false") {
    return false;
  }

  return undefined;
}

function getDocusealLink(searchParams: ThankYouSearchParams): string | undefined {
  const docusealLink = getSingleSearchParam(searchParams, "docuseal_link")?.trim();

  if (!docusealLink) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(docusealLink);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return undefined;
    }

    return parsedUrl.toString();
  } catch {
    return undefined;
  }
}

function getThankYouContent(
  searchParams: ThankYouSearchParams
): ThankYouContent {
  const eligible = getEligibility(searchParams);
  const docusealLink = getDocusealLink(searchParams);

  if (eligible === true) {
    return {
      title: "You’re all set - thank you for completing your intake",
      body: (
        <>
          <p>
            We’ve received your information and appreciate you taking the time
            to share details about your situation. This helps our team
            determine how we can best support you.
          </p>
          <p>
            To officially get started, we'll need you to review and sign the
            required documents. Signing now allows our team to begin working
            on your case right away, without delays.
          </p>
        </>
      ),
      detail: docusealLink
        ? "Please review and sign both documents using the secure link below."
        : "We’ll send your signing link shortly if it has not been provided yet.",
      ctaHref: docusealLink ?? "mailto:intake@example.com",
      ctaLabel: docusealLink ? "Review and sign documents" : "Contact our team",
      ctaExternal: Boolean(docusealLink),
    };
  }

  if (eligible === false) {
    return {
      title: "Thank you for submitting your intake",
      body: (
        <>
          <p>
            We appreciate you taking the time to share your information with
            us. Based on your intake we’re unable to move forward with
            representation at this stage based on eligibility considerations.
          </p>
          <p>
            We understand this may be disappointing. Case eligibility can
            depend on many factors, and this determination does not diminish
            the importance of your situation.
          </p>
          <p>
            If you’d like to talk through this decision or ask questions, our
            team is available to connect.
          </p>
        </>
      ),
      detail: "You can reach out below if you would like to speak with our team.",
      ctaHref: "mailto:intake@example.com",
      ctaLabel: "Contact our team",
      ctaExternal: false,
    };
  }

  return {
    title: "Thank you",
    body:
      "We received your submission and a member of our team will review it shortly.",
    detail:
      "If you were sent here with additional eligibility details, refresh the page using the full link you received.",
    ctaHref: "/",
    ctaLabel: "Back to home",
    ctaExternal: false,
  };
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<ThankYouSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  if (Object.keys(resolvedSearchParams).length === 0) {
    redirect("/");
  }

  const content = getThankYouContent(resolvedSearchParams);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-16 md:px-8">
      <section className="w-full rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
        <div className="max-w-2xl space-y-6">
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.24em]">
            Submission received
          </p>
          <h1 className="text-balance font-semibold text-3xl md:text-4xl">
            {content.title}
          </h1>
          <div className="space-y-6 text-foreground/90 text-sm md:text-base">
            {content.body}
          </div>
          <p className="text-muted-foreground text-sm md:text-base">{content.detail}</p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button asChild size="lg" className="rounded-[10px]">
              {content.ctaExternal ? (
                <a
                  href={content.ctaHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {content.ctaLabel}
                </a>
              ) : (
                <Link href={content.ctaHref}>{content.ctaLabel}</Link>
              )}
            </Button>
            <Button asChild size="lg" className="rounded-[10px]" variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
