/** biome-ignore-all lint/performance/noImgElement: this is a edge runtime function */
import { ImageResponse } from "next/og";
import type { ImageResponseOptions } from "next/server";

import type { Maybe } from "@/types";
import { getOgMetaData } from "./og-config";
import {
  getBlogPageOGData,
  getGenericPageOGData,
  getHomePageOGData,
  getSlugPageOGData,
} from "./og-data";

export const runtime = "edge";

const errorContent = (
  <div tw="flex flex-col w-full h-full items-center justify-center">
    <div tw=" flex w-full h-full items-center justify-center ">
      <h1 tw="text-white">Something went Wrong with image generation</h1>
    </div>
  </div>
);

type SeoImageRenderProps = {
  seoImage: string;
};

type ContentProps = Record<string, string>;

type DominantColorSeoImageRenderProps = {
  image?: Maybe<string>;
  title?: Maybe<string>;
  logo?: Maybe<string>;
  dominantColor?: Maybe<string>;
  description?: Maybe<string>;
  showImage?: boolean;
};

const seoImageRender = ({ seoImage }: SeoImageRenderProps) => (
  <div tw="flex flex-col w-full h-full items-center justify-center">
    <img alt="SEO preview" height={630} src={seoImage} width={1200} />
  </div>
);

const FallbackImage = ({ logo }: { logo: Maybe<string> }) => {
  if (logo) {
    return (
      <div tw="flex items-center justify-center h-full w-full">
        <img alt="Logo" height={400} src={logo} width={400} />
      </div>
    );
  }

  return (
    <div tw="flex items-center justify-center h-full w-full">
      <img
        alt="Logo"
        height={400}
        src={"https://picsum.photos/566/566"}
        width={400}
      />
    </div>
  );
};

const dominantColorSeoImageRender = ({
  image,
  title,
  logo,
  dominantColor,
  description,
  showImage = false,
}: DominantColorSeoImageRenderProps) => (
  <div
    style={{ fontFamily: "Inter" }}
    tw={`bg-[${
      dominantColor ?? "#12061F"
    }] flex flex-row overflow-hidden relative w-full`}
  >
    <svg
      aria-hidden="true"
      height="100%"
      style={{ position: "absolute", top: 0, left: 0 }}
      width="100%"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" x2="100%" y1="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "transparent" }} />
          <stop offset="100%" style={{ stopColor: "white" }} />
        </linearGradient>
      </defs>
      <rect fill="url(#gradient)" height="100%" opacity="0.2" width="100%" />
    </svg>

    <div tw="flex-1 p-10 flex flex-col justify-between relative z-10">
      <div
        tw="flex justify-start items-center"
        style={{ width: 200, height: 48 }}
      >
        {logo && (
          <div
            tw="flex items-center justify-center rounded-xl overflow-hidden"
            style={{
              width: 200,
              height: 48,
              padding: 8,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <img
              alt="Logo"
              src={logo}
              style={{
                width: 184,
                height: 32,
                objectFit: "contain",
                objectPosition: "left center",
              }}
            />
          </div>
        )}
      </div>

      <h1 tw="text-5xl font-bold leading-tight max-w-[90%] text-white">
        {title}
      </h1>
      {description && <p tw="text-lg text-white">{description}</p>}
    </div>

    {showImage && (
      <div tw="w-[630px] h-[630px] flex items-center justify-center p-8 relative z-10">
        <div tw="w-[566px] h-[566px] bg-white bg-opacity-20 flex flex-col justify-center items-center rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03),0_4px_6px_-1px_rgba(0,0,0,0.05),0_8px_10px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
          <div tw="flex relative w-full h-full">
            {image ? (
              <img
                alt="Content preview"
                height={566}
                src={image}
                style={{
                  objectFit: "cover",
                }}
                tw="w-full h-full rounded-3xl shadow-2xl"
                width={566}
              />
            ) : (
              <FallbackImage logo={logo} />
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

const FONT_REGEX = /url\(([^)]+)\)/;

async function getTtfFont(
  family: string,
  axes: string[],
  value: number[]
): Promise<ArrayBuffer> {
  const familyParam = `${axes.join(",")}@${value.join(",")}`;

  // Get css style sheet with user agent Mozilla/5.0 Firefox/1.0 to ensure non-variable TTF is returned
  const cssCall = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:${familyParam}&display=swap`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 Firefox/1.0",
      },
    }
  );

  const css = await cssCall.text();
  const ttfUrl = css.match(FONT_REGEX)?.[1];

  if (!ttfUrl) {
    throw new Error("Failed to extract font URL from CSS");
  }

  return await fetch(ttfUrl).then((res) => res.arrayBuffer());
}

const getOptions = async ({
  width,
  height,
}: {
  width: number;
  height: number;
}): Promise<ImageResponseOptions> => {
  const [interRegular, interBold, interSemiBold] = await Promise.all([
    getTtfFont("Inter", ["wght"], [400]),
    getTtfFont("Inter", ["wght"], [700]),
    getTtfFont("Inter", ["wght"], [600]),
  ]);
  return {
    width,
    height,
    fonts: [
      {
        name: "Inter",
        data: interRegular,
        style: "normal",
        weight: 400,
      },
      {
        name: "Inter",
        data: interBold,
        style: "normal",
        weight: 700,
      },
      {
        name: "Inter",
        data: interSemiBold,
        style: "normal",
        weight: 600,
      },
    ],
  };
};

const getHomePageContent = async ({ id }: ContentProps) => {
  if (!id) {
    return;
  }
  const [result, err] = await getHomePageOGData(id);
  if (err || !result) {
    return;
  }
  if (result?.seoImage) {
    return seoImageRender({ seoImage: result.seoImage });
  }
  return dominantColorSeoImageRender(result);
};
const getSlugPageContent = async ({ id }: ContentProps) => {
  if (!id) {
    return;
  }
  const [result, err] = await getSlugPageOGData(id);
  if (err || !result) {
    return;
  }
  if (result?.seoImage) {
    return seoImageRender({ seoImage: result.seoImage });
  }
  return dominantColorSeoImageRender(result);
};

const getBlogPageContent = async ({ id }: ContentProps) => {
  if (!id) {
    return;
  }
  const [result, err] = await getBlogPageOGData(id);
  if (err || !result) {
    return;
  }
  if (result?.seoImage) {
    return seoImageRender({ seoImage: result.seoImage });
  }
  return dominantColorSeoImageRender({ ...result, showImage: true });
};

const getGenericPageContent = async ({ id }: ContentProps) => {
  if (!id) {
    return;
  }
  const [result, err] = await getGenericPageOGData(id);
  if (err || !result) {
    return;
  }
  if (result?.seoImage) {
    return seoImageRender({ seoImage: result.seoImage });
  }
  return dominantColorSeoImageRender(result);
};

const block = {
  homePage: getHomePageContent,
  page: getSlugPageContent,
  blog: getBlogPageContent,
} as const;

export async function GET({ url }: Request): Promise<ImageResponse> {
  const { searchParams } = new URL(url);
  const type = searchParams.get("type") as keyof typeof block;
  const { width, height } = getOgMetaData(searchParams);
  const para = Object.fromEntries(searchParams.entries());
  const options = await getOptions({ width, height });
  const image = block[type] ?? getGenericPageContent;
  try {
    const content = await image(para);
    return new ImageResponse(content ? content : errorContent, options);
  } catch (_err) {
    return new ImageResponse(errorContent, options);
  }
}
