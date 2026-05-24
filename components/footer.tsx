import { sanityFetch } from "@/utils/sanity/live";
import {
  queryFooterData,
  queryGlobalSeoSettings,
} from "@/utils/sanity/query";
import type {
  QueryFooterDataResult,
  QueryGlobalSeoSettingsResult,
} from "@/utils/sanity/sanity.types";
import Link from "next/link";

import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "./social-icons";

type SocialLinksProps = {
  data: NonNullable<QueryGlobalSeoSettingsResult>["socialLinks"];
};

type FooterProps = {
  data: NonNullable<QueryFooterDataResult>;
  settingsData: NonNullable<QueryGlobalSeoSettingsResult>;
};

export async function FooterServer() {
  const [response, settingsResponse] = await Promise.all([
    sanityFetch({
      query: queryFooterData,
    }),
    sanityFetch({
      query: queryGlobalSeoSettings,
    }),
  ]);

  if (!(response?.data && settingsResponse?.data)) {
    return <FooterSkeleton />;
  }
  return <Footer data={response.data} settingsData={settingsResponse.data} />;
}

function SocialLinks({ data }: SocialLinksProps) {
  if (!data) {
    return null;
  }
  const { facebook, twitter, instagram, youtube, linkedin } = data;
  const links = [
    { url: instagram, Icon: InstagramIcon, label: "Follow us on Instagram" },
    { url: facebook, Icon: FacebookIcon, label: "Follow us on Facebook" },
    { url: twitter, Icon: XIcon, label: "Follow us on Twitter" },
    { url: linkedin, Icon: LinkedinIcon, label: "Follow us on LinkedIn" },
    { url: youtube, Icon: YoutubeIcon, label: "Subscribe to our YouTube channel" },
  ].filter((entry) => entry.url);
  return (
    <ul className="flex items-center space-x-6 text-muted-foreground">
      {links.map(({ url, Icon, label }, index) => (
        <li className="font-medium hover:text-primary" key={`${url}-${index}`}>
          <Link
            aria-label={label}
            href={url ?? "#"}
            prefetch={false}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="fill-muted-foreground hover:fill-primary/80 dark:fill-zinc-400 dark:hover:fill-primary" />
            <span className="sr-only">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const OFFICES = [
  {
    name: "Atlanta Office",
    address: "2302 Parklake Dr., Suite 320\nAtlanta, GA 30345",
    mapUrl:
      "https://www.google.com/maps/place/Gillani+Law/@33.8538255,-84.2530911,17z/data=!3m2!4b1!5s0x88f5a7e8731208bf:0x1dd143bb3edf8cf6!4m6!3m5!1s0x88f5a33922748d4d:0x702a47b211c95ed5!8m2!3d33.8538211!4d-84.2505162!16s%2Fg%2F11y561g_kr?coh=245187&entry=tts",
  },
  {
    name: "Duluth Office",
    address: "3509 Duluth Hwy\nDuluth, GA 30096\n(By Appointment Only)",
    mapUrl:
      "https://www.google.com/maps/place/3509+Duluth+Hwy,+Duluth,+GA+30096/@34.0021285,-84.1441826,17z/data=!3m1!4b1!4m6!3m5!1s0x88f5a262a52b58a7:0xd2cf9100cb852011!8m2!3d34.0021285!4d-84.1441826!16s%2Fg%2F11bw4m7mkv?entry=ttu",
  },
] as const;

function OfficeBlock({
  name,
  address,
  mapUrl,
}: {
  name: string;
  address: string;
  mapUrl: string;
}) {
  const lines = address.split("\n");
  return (
    <Link
      aria-label={`${name} - Open in Google Maps`}
      className="block text-left transition-colors hover:opacity-80"
      href={mapUrl}
      prefetch={false}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="block font-bold text-foreground">{name}</span>
      {lines.map((line, i) => (
        <span key={i} className="block text-muted-foreground dark:text-zinc-400">
          {line}
        </span>
      ))}
    </Link>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="mt-16 pb-8">
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
          <div className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
            <div>
              <span className="flex items-center justify-center gap-4 lg:justify-start">
                <div className="h-[40px] w-[80px] animate-pulse rounded bg-muted" />
              </span>
              <div className="mt-6 h-16 w-full animate-pulse rounded bg-muted" />
            </div>
            <div className="flex items-center space-x-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  className="h-6 w-6 animate-pulse rounded bg-muted"
                  key={i}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 lg:gap-20">
            {[1, 2, 3].map((col) => (
              <div key={col}>
                <div className="mb-6 h-6 w-24 animate-pulse rounded bg-muted" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      className="h-4 w-full animate-pulse rounded bg-muted"
                      key={item}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-20 border-t border-border px-8 pt-8 pb-12">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 md:grid-cols-4">
            <div>
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-36 animate-pulse rounded bg-muted" />
            </div>
            {[1, 2, 3].map((col) => (
              <div key={col} className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </footer>
  );
}

function Footer({ data, settingsData }: FooterProps) {
  const { subtitle, columns } = data;
  const { siteTitle, logo, logoDark, socialLinks } = settingsData;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 pb-8">
      <section className="container mx-auto">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-4 text-center md:px-6 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full max-w-96 shrink flex-col items-center gap-6 md:gap-8 lg:items-start">
            <div>
              <span className="flex items-center justify-center gap-4 lg:justify-start">
                <Logo
                  alt={siteTitle}
                  image={logo}
                  imageDark={logoDark ?? undefined}
                  priority
                />
              </span>
              {subtitle && (
                <p className="mt-6 text-muted-foreground text-sm dark:text-zinc-400">
                  {subtitle}
                </p>
              )}
            </div>
            {socialLinks && <SocialLinks data={socialLinks} />}
          </div>
          {Array.isArray(columns) && columns.length > 0 && (
            <div className="grid grid-cols-3 gap-6 lg:mr-20 lg:gap-28">
              {columns.map((column, index) => (
                <div key={`column-${column?._key}-${index}`}>
                  <h3 className="mb-6 font-semibold">{column?.title}</h3>
                  {column?.links && column.links.length > 0 && (
                    <ul className="space-y-4 text-muted-foreground text-sm dark:text-zinc-400">
                      {column.links.map((link, columnIndex) => (
                        <li
                          className="font-medium hover:text-primary"
                          key={`${link?._key}-${columnIndex}-column-${column?._key}`}
                        >
                          <Link
                            href={link.href ?? "#"}
                            rel={
                              link.openInNewTab
                                ? "noopener noreferrer"
                                : undefined
                            }
                            target={link.openInNewTab ? "_blank" : undefined}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-20 border-t border-border px-8 pt-8 pb-12">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 text-muted-foreground text-sm md:grid-cols-4">
            <div>
              <div>Copyright © {year} {siteTitle}</div>
              <div className="mt-2">All rights reserved</div>
            </div>
            <div className="text-left">
              {/* <OfficeBlock
                address={OFFICES[0].address}
                mapUrl={OFFICES[0].mapUrl}
                name={OFFICES[0].name}
              /> */}
            </div>
            <div className="text-left">
              {/* <OfficeBlock
                address={OFFICES[1].address}
                mapUrl={OFFICES[1].mapUrl}
                name={OFFICES[1].name}
              /> */}
            </div>
            <div className="flex flex-col gap-2 text-left">
              <Link
                className="underline transition-colors hover:text-primary"
                href="/careers"
              >
                Careers
              </Link>
              <Link
                className="underline transition-colors hover:text-primary"
                href="/privacy-policy"
              >
                Privacy Policy
              </Link>
              <Link
                className="underline transition-colors hover:text-primary"
                href="/terms-conditions"
              >
                Terms & Conditions
              </Link>
              <ModeToggle />
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
