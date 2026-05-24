import { NextResponse } from "next/server";

const SHOWCASE_ID = process.env.COMPANYCAM_SHOWCASE_ID ?? "";

export async function GET(request: Request) {
  if (!SHOWCASE_ID) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const includeCount = searchParams.get("includeCount") === "true";
  const limit = searchParams.get("limit") ?? "16";
  const skip = searchParams.get("skip") ?? "0";

  const url = new URL(
    "https://app.companycam.com/showcase_widget/api/showcase_projects"
  );
  url.searchParams.set("showcase_id", SHOWCASE_ID);
  url.searchParams.set("limit", limit);
  url.searchParams.set("skip", skip);

  for (const [key, value] of searchParams.entries()) {
    if (key !== "includeCount" && key !== "limit" && key !== "skip") {
      url.searchParams.append(key, value);
    }
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }
    const data = await res.json();

    if (includeCount) {
      return NextResponse.json({
        filteredCount:
          typeof data.filteredCount === "number" ? data.filteredCount : undefined,
        totalCount: typeof data.totalCount === "number" ? data.totalCount : undefined,
      });
    }

    return NextResponse.json(data.showcaseprojects ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
