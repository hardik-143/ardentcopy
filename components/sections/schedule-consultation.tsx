"use client";

import { Button } from "@/utils/ui/components/button";
import { MapPinIcon, Mail, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/ui/lib/utils";
import { stegaClean } from "next-sanity";

import type { PagebuilderType } from "@/types";
import { SanityButtons } from "../elements/sanity-buttons";

export type ScheduleConsultationProps = PagebuilderType<"scheduleConsultation">;

const accentClass = "text-primary";
const accentBgClass = "bg-primary text-primary-foreground hover:bg-primary/90";
const accentBorderClass =
  "border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20";

// TODO: Configure these values for your client, or make them dynamic from Sanity settings
const CONTACT = {
  phone: "000-000-0000",
  email: "contact@example.com",
  address: "123 Main St, Suite 100, City, ST 00000",
  addressUrl: "https://maps.google.com",
} as const;

const OR_LABEL = "- OR -";
// TODO: Configure this disclaimer for your client's industry
const DISCLAIMER = "Contact us for a free consultation.";

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        className={cn("size-5 shrink-0", accentClass)}
        aria-hidden
      />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

export function ScheduleConsultation({
  title,
  description,
  buttons,
}: ScheduleConsultationProps) {
  const primaryButton = buttons?.at(0);
  const secondaryButton = buttons?.at(1);

  return (
    <section
      className="relative my-6 py-12 md:my-16 md:py-16"
      aria-labelledby="schedule-consultation-heading"
    >
      <div
        className="absolute inset-0 left-1/2 w-screen -translate-x-1/2 bg-card -z-10"
        aria-hidden
      />
      <div className="container relative mx-auto px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {/* Left: Contact info */}
          <div className="max-w-xl space-y-6">
            <h2
              id="schedule-consultation-heading"
              className="font-semibold text-2xl tracking-tight md:text-3xl"
            >
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground text-base leading-relaxed">
                {description}
              </p>
            )}
            <div className="flex flex-col gap-4">
              <ContactRow icon={PhoneIcon}>
                <a
                  href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}
                  className="text-foreground hover:underline"
                >
                  {CONTACT.phone}
                </a>
              </ContactRow>
              <ContactRow icon={Mail}>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-foreground hover:underline"
                >
                  {CONTACT.email}
                </a>
              </ContactRow>
              <ContactRow icon={MapPinIcon}>
                <a
                  href={CONTACT.addressUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-foreground hover:underline"
                  title="Open address in Google Maps"
                >
                  {CONTACT.address}
                </a>
              </ContactRow>
            </div>
          </div>

          {/* Right: CTA buttons */}
          <div className="flex min-h-full flex-col items-center justify-center gap-4">
            {primaryButton?.href && (
              <Button
                asChild
                className={cn(
                  "w-full max-w-md rounded-[10px] px-6 font-medium",
                  accentBgClass
                )}
                size="lg"
                type="button"
              >
                <Link
                  href={stegaClean(primaryButton.href)}
                  rel={
                    primaryButton.openInNewTab
                      ? "noopener noreferrer"
                      : undefined
                  }
                  target={
                    primaryButton.openInNewTab ? "_blank" : "_self"
                  }
                  title={`Navigate to ${primaryButton.text}`}
                >
                  {primaryButton.text}
                </Link>
              </Button>
            )}
            {primaryButton && secondaryButton && (
              <span className="text-muted-foreground text-sm">{OR_LABEL}</span>
            )}
            {secondaryButton?.href && (
              <Button
                asChild
                className={cn(
                  "w-full max-w-md rounded-[10px] border-2 bg-transparent font-medium",
                  accentBorderClass
                )}
                size="lg"
                variant="outline"
                type="button"
              >
                <Link
                  href={stegaClean(secondaryButton.href)}
                  rel={
                    secondaryButton.openInNewTab
                      ? "noopener noreferrer"
                      : undefined
                  }
                  target={
                    secondaryButton.openInNewTab ? "_blank" : "_self"
                  }
                  title={`Navigate to ${secondaryButton.text}`}
                >
                  {secondaryButton.text}
                </Link>
              </Button>
            )}
            {!primaryButton?.href && !secondaryButton?.href && buttons && (
              <SanityButtons
                buttons={buttons}
                buttonClassName="w-full max-w-md rounded-[10px]"
                className="w-full max-w-md flex-col"
              />
            )}
            <p className="text-muted-foreground text-center text-sm">
              {DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
