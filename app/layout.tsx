import "@/utils/ui/styles/globals.css";

import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { JetBrains_Mono, Poppins } from "next/font/google";
import Script from "next/script";
import { preconnect, prefetchDNS } from "react-dom";

import { env } from "@/utils/env/client";
import { fetchLayoutSettings } from "@/action/seo";

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await fetchLayoutSettings();

  const siteTitle = settings?.siteTitle ?? "Site";
  const rawTemplate = settings?.titleTemplate ?? `%s | ${siteTitle}`;
  const template = rawTemplate.replace(/\{siteTitle\}/g, siteTitle);

  return {
    title: {
      template,
      default: siteTitle,
    },
    ...(settings?.favicon && {
      icons: { icon: settings.favicon },
    }),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  const gtmId = env.NEXT_PUBLIC_GTM_ID;
  return (
    <html lang="en" suppressHydrationWarning>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Script
          src="https://tweakcn.com/live-preview.min.js"
          strategy="beforeInteractive"
        />
        {/* TODO: Configure this script for your client's form system
            Replace "your-form-domain" with the domain of your form provider (e.g., "typeform", "jotform")
            This script forwards gclid parameters for Google Ads conversion tracking */}
        <Script
          id="gclid-forwarder"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var p=new URLSearchParams(window.location.search),g=p.get("gclid");
  if(g)sessionStorage.setItem("gclid",g);
  document.addEventListener("click",function(e){
    var el=e.target;while(el&&el.tagName!=="A")el=el.parentElement;
    if(!el)return;
    var h=el.getAttribute("href")||"";
    if(h.toLowerCase().indexOf("your-form-domain")===-1)return;
    var id=sessionStorage.getItem("gclid");if(!id)return;
    e.preventDefault();e.stopImmediatePropagation();
    var u;try{u=new URL(h);u.searchParams.set("gclid",id);u=u.toString();}
    catch(x){u=h+(h.indexOf("?")>-1?"&":"?")+"gclid="+id;}
    if(el.getAttribute("target")==="_blank")window.open(u,"_blank","noopener,noreferrer");
    else window.location.href=u;
  },true);
})();
`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
