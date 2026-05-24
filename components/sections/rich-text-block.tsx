import { cn } from "@/utils/ui/lib/utils";
import type { PagebuilderType, SanityRichTextProps } from "@/types";
import { RichText } from "../elements/rich-text";

export type RichTextBlockProps = PagebuilderType<"richTextBlock">;

export function RichTextBlock({ title, content }: RichTextBlockProps) {
  return (
    <section className="w-screen max-w-none overflow-hidden bg-[#0b3033] py-16 text-white [margin-left:calc(50%-50vw)] [margin-right:calc(50%-50vw)] md:py-24 xl:py-28">
      <div className="mx-auto max-w-[1540px] px-4 md:px-6">
        {title && (
          <div className="mb-10 max-w-3xl lg:mb-14">
            <h2 className="mb-0 text-balance font-semibold text-3xl leading-[1.05] text-white after:mt-5 after:block after:h-1 after:w-16 after:bg-[#d48d4d] sm:text-4xl sm:leading-[1.04] lg:text-5xl lg:leading-[1.02]">
              {title}
            </h2>
          </div>
        )}

        <div
          className={cn(
            "overflow-hidden border border-white/8 bg-[#244a51]",
            "bg-[radial-gradient(circle_at_top_left,_rgba(57,191,214,0.14),_transparent_34%),linear-gradient(140deg,_rgba(255,255,255,0.05),_rgba(36,74,81,1)_52%,_rgba(18,57,64,0.82))]",
            "p-6 sm:p-8 lg:p-12 xl:p-14"
          )}
        >
          <RichText
            className={cn(
              "max-w-4xl text-white/75",
              "[&_a]:text-[#39bfd6] [&_a]:decoration-[#39bfd6]/50 [&_a:hover]:text-white",
              "[&_blockquote]:border-[#d48d4d] [&_blockquote]:bg-white/5 [&_blockquote]:text-white/75",
              "[&_h2]:border-white/10 [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white/85",
              "[&_li]:text-white/75 [&_ol]:text-white/75 [&_p]:text-white/75 [&_strong]:text-white [&_ul]:text-white/75",
              "[&_ol]:marker:text-[#39bfd6] [&_ul]:marker:text-[#39bfd6]"
            )}
            richText={content as SanityRichTextProps}
          />
        </div>
      </div>
    </section>
  );
}
