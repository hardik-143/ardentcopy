import { ArrowRight, MapPinned } from "lucide-react";
import Link from "next/link";
import { stegaClean } from "next-sanity";

import type { PagebuilderType } from "@/types";
import { SanityIcon } from "../elements/sanity-icon";
import { TitleWithHighlight } from "../elements/title-with-highlight";

export type ServiceAreasProps = PagebuilderType<"serviceAreas">;

type AreaGroup = NonNullable<ServiceAreasProps["groups"]>[number];

function CountyCard({ group }: { group: AreaGroup }) {
  const areas = Array.isArray(group.areas) ? group.areas : [];

  return (
    <article className="border-white/10 border-t px-6 py-9 md:px-9">
      <div className="flex items-center gap-4">
        <span className="flex size-13 items-center justify-center bg-[#5d664c] text-[#ef973c]">
          {group.icon ? (
            <SanityIcon className="size-6" icon={group.icon} />
          ) : (
            <MapPinned aria-hidden className="size-6" strokeWidth={2} />
          )}
        </span>
        <h3 className="mb-0 font-semibold text-[2rem] leading-tight text-white">
          {group.title}
        </h3>
      </div>

      <div className="mt-6 h-px bg-white/10" />

      {areas.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {areas.map((area) => (
            <li
              className="flex items-start gap-3 text-[1.03rem] text-white/72"
              key={area._key}
            >
              <span
                aria-hidden
                className="mt-[0.55rem] size-1.5 rounded-full bg-[#ef973c]"
              />
              {area.href ? (
                <Link
                  className="transition-colors hover:text-white"
                  href={stegaClean(area.href)}
                  rel={area.openInNewTab ? "noopener noreferrer" : undefined}
                  target={area.openInNewTab ? "_blank" : undefined}
                >
                  {area.title}
                </Link>
              ) : (
                <span>{area.title}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function ServiceAreasCta({
  ctaButtonHref,
  ctaButtonOpenInNewTab,
  ctaButtonText,
  ctaDescription,
  ctaEyebrow,
  ctaTitle,
}: Pick<
  ServiceAreasProps,
  | "ctaButtonHref"
  | "ctaButtonOpenInNewTab"
  | "ctaButtonText"
  | "ctaDescription"
  | "ctaEyebrow"
  | "ctaTitle"
>) {
  if (!ctaEyebrow && !ctaTitle && !ctaDescription && !ctaButtonHref) {
    return null;
  }

  return (
    <article className="flex h-full flex-col justify-between bg-[#ef973c] px-6 py-9 text-[#113f46] md:px-9">
      <div>
        {ctaEyebrow ? (
          <p className="mb-0 text-[0.8rem] font-semibold uppercase tracking-[0.36em]">
            {ctaEyebrow}
          </p>
        ) : null}
        {ctaTitle ? (
          <h3 className="mb-0 mt-5 text-balance font-semibold text-[2.5rem] leading-[1.02]">
            {ctaTitle}
          </h3>
        ) : null}
        {ctaDescription ? (
          <p className="mb-0 mt-7 max-w-[30ch] text-[1.08rem] leading-9 text-[#113f46]/82">
            {ctaDescription}
          </p>
        ) : null}
      </div>

      {ctaButtonHref ? (
        <div className="mt-10">
          <Link
            className="inline-flex items-center gap-3 border-[#113f46] border-b pb-2 font-semibold text-[1.05rem] transition-opacity hover:opacity-80"
            href={stegaClean(ctaButtonHref)}
            rel={ctaButtonOpenInNewTab ? "noopener noreferrer" : undefined}
            target={ctaButtonOpenInNewTab ? "_blank" : "_self"}
          >
            <span>{ctaButtonText ?? "Ask About Your Area"}</span>
            <ArrowRight
              aria-hidden
              className="size-5 shrink-0"
              strokeWidth={2.2}
            />
          </Link>
        </div>
      ) : null}
    </article>
  );
}

export function ServiceAreas({
  ctaButtonHref,
  ctaButtonOpenInNewTab,
  ctaButtonText,
  ctaDescription,
  ctaEyebrow,
  ctaTitle,
  description,
  eyebrow,
  groups,
  highlightedText,
  title,
}: ServiceAreasProps) {
  const areaGroups = Array.isArray(groups) ? groups : [];

  return (
    <section
      className="relative isolate overflow-hidden bg-[#113f46] py-16 text-white md:py-24 xl:py-28"
      id="service-areas"
    >
      <div className="relative mx-auto max-w-[1540px] px-4 md:px-6">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.72fr)] xl:items-center xl:gap-16">
          <div className="max-w-5xl">
            {eyebrow ? (
              <div className="flex items-center gap-3 text-[#ef973c]">
                {/* <MapPinned
                  aria-hidden
                  className="size-5 shrink-0"
                  strokeWidth={2.1}
                /> */}
                <p className="mb-0 text-[0.8rem] font-semibold uppercase tracking-[0.38em]">
                  {eyebrow}
                </p>
              </div>
            ) : null}

            {title ? (
              <h2 className="mb-0 mt-6 text-white text-3xl">
                <TitleWithHighlight
                  className="block text-balance text-3xl lg:text-5xl font-semibold leading-[0.95] tracking-[-0.04em]"
                  highlightClassName="text-[#ef973c]"
                  highlightedText={highlightedText}
                  title={title}
                />
              </h2>
            ) : null}
          </div>

          {description ? (
            <p className="mb-0 max-w-[24rem] text-[1.1rem] leading-9 text-white/72">
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-12 grid overflow-hidden border-white/10 border-t md:grid-cols-2 xl:mt-16 xl:grid-cols-3">
          {areaGroups.map((group) => (
            <CountyCard group={group} key={group._key} />
          ))}
          <ServiceAreasCta
            ctaButtonHref={ctaButtonHref}
            ctaButtonOpenInNewTab={ctaButtonOpenInNewTab}
            ctaButtonText={ctaButtonText}
            ctaDescription={ctaDescription}
            ctaEyebrow={ctaEyebrow}
            ctaTitle={ctaTitle}
          />
        </div>
      </div>
    </section>
  );
}
