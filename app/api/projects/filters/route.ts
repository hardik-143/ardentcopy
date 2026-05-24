import { NextResponse } from "next/server";

const SHOWCASE_ID = process.env.COMPANYCAM_SHOWCASE_ID ?? "";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const revalidate = 3600;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  if (!SHOWCASE_ID) {
    return NextResponse.json(
      { error: "Not configured" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  try {
    const res = await fetch(
      `https://app.companycam.com/showcase_widget/api/filters?showcase_id=${SHOWCASE_ID}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream error" },
        { status: res.status, headers: CORS_HEADERS }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
