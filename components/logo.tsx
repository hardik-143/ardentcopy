import Image from "next/image";
import Link from "next/link";

import type { Maybe, SanityImageProps } from "@/types";
import { SanityImage } from "./elements/sanity-image";

const LOGO_URL =
  "https://cdn.sanity.io/images/s6kuy1ts/production/68c438f68264717e93c7ba1e85f1d0c4b58b33c2-1200x621.svg";

type LogoProps = {
  src?: Maybe<string>;
  srcDark?: Maybe<string>;
  image?: Maybe<SanityImageProps>;
  imageDark?: Maybe<SanityImageProps>;
  alt?: Maybe<string>;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
};

const defaultSizeClass = "h-10 w-[170px]";
const imageClass =
  "absolute inset-0 size-full object-contain object-center transition-opacity -translate-y-1/2";

export function Logo({
  src,
  srcDark,
  alt = "logo",
  image,
  imageDark,
  width = 170,
  height = 40,
  priority = true,
  className,
}: LogoProps) {
  const resolvedAlt = alt ?? "logo";
  return (
    <Link
      className={`relative flex items-center justify-center ${className ?? defaultSizeClass}`}
      href="/"
    >
      <div className="relative h-full w-full">
        {image ? (
          <>
            <SanityImage
              alt={resolvedAlt}
              className="absolute inset-0 size-full object-contain object-center opacity-100 dark:opacity-0 -translate-y-1/2"
              image={image}
            />
            <SanityImage
              alt={resolvedAlt}
              className="absolute inset-0 size-full object-contain object-center opacity-0 dark:opacity-100 -translate-y-1/2"
              image={imageDark ?? image}
            />
          </>
        ) : (
          <>
            <Image
              alt={resolvedAlt}
              className={`${imageClass} opacity-100 dark:opacity-0`}
              decoding="sync"
              height={height}
              loading="eager"
              priority={priority}
              src={src ?? LOGO_URL}
              width={width}
            />
            <Image
              alt={resolvedAlt}
              className={`${imageClass} opacity-0 dark:opacity-100`}
              decoding="sync"
              height={height}
              loading="eager"
              priority={priority}
              src={srcDark ?? src ?? LOGO_URL}
              width={width}
            />
          </>
        )}
      </div>
    </Link>
  );
}
