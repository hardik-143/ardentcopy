"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/utils/ui/components/accordion";
import { Button } from "@/utils/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/utils/ui/components/sheet";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { ColumnLink, NavigationData } from "@/types";
import { groupLinksByCategory } from "./navbar";
import { MenuLink } from "./elements/menu-link";
import { SanityButtons } from "./elements/sanity-buttons";
import { Logo } from "./logo";

export function MobileMenu({ navbarData, settingsData }: NavigationData) {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  const { columns, buttons, phoneNumber } = navbarData || {};
  const { logo, logoDark, siteTitle } = settingsData || {};

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <Menu className="size-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-sm flex flex-col px-0 pt-0"
        showCloseButton={false}
      >
        <SheetHeader className="flex h-16 flex-row items-center justify-between gap-2 border-b px-4">
          <div className="flex min-w-0 flex-1 items-center">
            {logo ? (
              <>
                <SheetTitle className="sr-only">
                  {siteTitle || "Navigation menu"}
                </SheetTitle>
                <div className="flex shrink-0 items-center">
                  <Logo
                    alt={siteTitle || ""}
                    className="h-8 w-[136px]"
                    image={logo}
                    imageDark={logoDark ?? undefined}
                  />
                </div>
              </>
            ) : (
              <SheetTitle className="truncate">
                {siteTitle || "Menu"}
              </SheetTitle>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {phoneNumber ? (
              <a
                className="rounded-sm bg-primary px-3 py-2 font-bold text-white text-xs transition-colors hover:bg-primary/90"
                href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                onClick={closeMenu}
              >
                CALL NOW
              </a>
            ) : null}
            <SheetClose className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="size-6" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Navigation items - scrollable */}
        <nav className="flex-1 overflow-y-auto pt-4 grid px-6 gap-1 content-start">
          <Accordion type="single" collapsible>
            {columns?.map((column) => {
              if (column.type === "link") {
                if (!column.href) return null;
                return (
                  <Link
                    className="flex items-center py-3 font-medium text-lg transition-colors hover:text-primary"
                    href={column.href}
                    key={column._key}
                    onClick={closeMenu}
                  >
                    {column.name}
                  </Link>
                );
              }

              if (column.type === "column") {
                return (
                  <AccordionItem
                    key={column._key}
                    value={column._key}
                    className="border-b-0"
                  >
                    <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
                      {column.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3 border-border border-l-2 pl-4 ml-1">
                        {groupLinksByCategory(column.links).map(
                          ({ category, links: groupLinks }, i) => (
                            <div
                              key={`${category ?? "uncategorized"}-${i}`}
                              className="grid gap-1"
                            >
                              {category ? (
                                <div
                                  className="font-medium text-primary text-sm uppercase tracking-wider"
                                  role="presentation"
                                >
                                  {category}
                                </div>
                              ) : null}
                              {groupLinks.map((link: ColumnLink) => (
                                <MenuLink
                                  className="text-lg"
                                  description={link.description || ""}
                                  href={link.href || ""}
                                  icon={link.icon}
                                  key={link._key}
                                  name={link.name || ""}
                                  onClick={closeMenu}
                                />
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }

              return null;
            })}
          </Accordion>
        </nav>

        {phoneNumber || buttons?.length ? (
          <SheetFooter className="flex-col gap-3 border-t">
            {phoneNumber ? (
              <a
                className="font-medium text-sm transition-colors hover:text-primary"
                href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                onClick={closeMenu}
              >
                {phoneNumber}
              </a>
            ) : null}
            {buttons?.length ? (
              <SanityButtons
                buttonClassName="w-full justify-center"
                buttons={buttons || []}
                className="grid gap-3"
              />
            ) : null}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
