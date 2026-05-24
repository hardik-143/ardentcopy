/**
 * Disables Next.js Draft Mode after a Presentation editing session.
 *
 * Reference: https://www.sanity.io/docs/visual-editing/visual-editing-with-nextjs-app-router
 */
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL("/", request.url));
}
