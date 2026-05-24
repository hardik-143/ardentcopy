import { Button } from "@/utils/ui/components/button";

import type { Career } from "@/types";

function employmentTypeLabel(value: string | null | undefined): string {
  if (value === "full-time") return "Full Time";
  if (value === "part-time") return "Part Time";
  return value ?? "—";
}

type CareerCardProps = {
  career: Career;
};

// TODO: Configure the email address for your client
const CAREERS_EMAIL = "careers@example.com";

function buildApplyMailto(jobTitle: string | null | undefined): string {
  const subject = encodeURIComponent(`Application for ${jobTitle ?? "Position"}`);
  const body = encodeURIComponent(
    `I am interested in applying for the ${jobTitle ?? "position"}.\n\nPlease find my resume and cover letter attached.`
  );
  return `mailto:${CAREERS_EMAIL}?subject=${subject}&body=${body}`;
}

export function CareerCard({ career }: CareerCardProps) {
  const { _id, name, location, employmentType, description } = career;
  const isFullTime = employmentType === "full-time";

  return (
    <article
      className="flex flex-col rounded-lg border bg-card p-6"
      data-career-id={_id}
    >
      <h2 className="mb-2 text-xl font-semibold text-foreground">{name}</h2>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {location && <span>{location}</span>}
        {employmentType && (
          <>
            {location && <span aria-hidden>·</span>}
            <span
              className={
                isFullTime
                  ? "rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
                  : "rounded-full border border-current px-2.5 py-0.5 text-xs font-medium"
              }
            >
              {employmentTypeLabel(employmentType)}
            </span>
          </>
        )}
      </div>
      <p className="mb-4 flex-1 whitespace-pre-wrap text-muted-foreground">
        {description}
      </p>
      <Button asChild className="w-fit self-end" variant="outline">
        <a
          href={buildApplyMailto(name)}
          title="Apply for this position via email"
        >
          Apply Now
        </a>
      </Button>
    </article>
  );
}
