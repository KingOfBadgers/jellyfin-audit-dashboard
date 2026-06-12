import { NextResponse } from "next/server";
import { buildMissingIndex } from "@/lib/compute/missing";
import { writeAuditCache } from "@/lib/cache/auditCache";

let running = false;

/**
 * =========================================================
 * SCAN ROUTE (CONTRACT V2 — SOURCE OF TRUTH RESOLVED SERVER-SIDE)
 * =========================================================
 */

type LibraryType = "movie" | "tv" | "collection" | "legacy";

/**
 * Resolve library type from Jellyfin Views (SERVER TRUTH)
 */
async function resolveLibraryTypeFromId(
  baseUrl: string,
  apiKey: string,
  userId: string,
  libraryId: string
): Promise<LibraryType> {
  const res = await fetch(`${baseUrl}/Users/${userId}/Views`, {
    headers: {
      "X-Emby-Token": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) return "legacy";

  const data = await res.json();

  const lib = (data?.Items || []).find(
    (i: any) => i.Id === libraryId
  );

  const type = (lib?.CollectionType || "").toLowerCase();

  switch (type) {
    case "movies":
      return "movie";
    case "tvshows":
      return "tv";
    case "boxsets":
      return "collection";
    default:
      return "legacy";
  }
}

/**
 * =========================================================
 * FILTER SAFETY LAYER
 * =========================================================
 */
function filterMovieItems(items: any[]) {
  const filtered = items.filter(
    (item) => item.Type === "Movie" && item.IsFolder !== true
  );

  console.log(
    `[SCAN] Filtered ${items.length} -> ${filtered.length} movies`
  );

  return filtered;
}

/**
 * =========================================================
 * QUERY BUILDER
 * =========================================================
 */
function buildQuery(
  baseUrl: string,
  userId: string,
  libraryType: LibraryType,
  libraryId: string
) {
  const base = `${baseUrl}/Users/${userId}/Items`;
  const params = new URLSearchParams();

  switch (libraryType) {
    case "movie":
      params.set("IncludeItemTypes", "Movie");
      break;

    case "tv":
      params.set("IncludeItemTypes", "Series");
      break;

    case "collection":
      params.set("IncludeItemTypes", "BoxSet");
      break;

    default:
      params.set("IncludeItemTypes", "Movie");
  }

  params.set("Recursive", "true");
  params.set("ParentId", libraryId);

  return `${base}?${params.toString()}`;
}

/**
 * =========================================================
 * GET (DEBUG ONLY — LEGACY SUPPORT)
 * =========================================================
 */
export async function GET(req: Request) {
  console.log("[SCAN][GET] Starting scan");

  const start = Date.now();

  const { searchParams } = new URL(req.url);
  const libraryId = searchParams.get("libraryId");

  const baseUrl = process.env.JELLYFIN_URL!;
  const apiKey = process.env.JELLYFIN_API_KEY!;
  const userId = process.env.JELLYFIN_USER_ID!;

  let libraryType: LibraryType = "legacy";

  if (libraryId) {
    libraryType = await resolveLibraryTypeFromId(
      baseUrl,
      apiKey,
      userId,
      libraryId
    );
  }

  const url = buildQuery(
    baseUrl,
    userId,
    libraryType,
    libraryId || ""
  );

  console.log("[SCAN][GET] Query:", url);

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": apiKey,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  const items =
    libraryType === "movie" || libraryType === "legacy"
      ? filterMovieItems(data.Items)
      : data.Items;

  const { summary, groups } = buildMissingIndex(items);

  const payload = {
    generatedAt: new Date().toISOString(),
    movieCount: items.length,
    scanDurationMs: Date.now() - start,
    summary: {
      ...summary,
      backdropBuckets: summary.backdropBuckets,
    },
    groups,
  };

  await writeAuditCache(payload, libraryId || "legacy");

  return NextResponse.json({
    ok: true,
    libraryId,
    libraryType,
    movieCount: items.length,
  });
}

/**
 * =========================================================
 * POST (PRODUCTION SCAN — CLEAN CONTRACT)
 * =========================================================
 */
export async function POST(req: Request) {
  if (running) {
    return NextResponse.json({ ok: false, running: true });
  }

  running = true;

  try {
    const start = Date.now();

    const body = await req.json().catch(() => ({}));
    const libraryId = body?.libraryId;

    if (!libraryId) {
      return NextResponse.json(
        { error: "libraryId required" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.JELLYFIN_URL!;
    const apiKey = process.env.JELLYFIN_API_KEY!;
    const userId = process.env.JELLYFIN_USER_ID!;

    const libraryType = await resolveLibraryTypeFromId(
      baseUrl,
      apiKey,
      userId,
      libraryId
    );

    const url = buildQuery(
      baseUrl,
      userId,
      libraryType,
      libraryId
    );

    const res = await fetch(url, {
      headers: {
        "X-Emby-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    const items =
      libraryType === "movie" || libraryType === "legacy"
        ? filterMovieItems(data.Items)
        : data.Items;

    const { summary, groups } = buildMissingIndex(items);

    const payload = {
      generatedAt: new Date().toISOString(),
      movieCount: items.length,
      scanDurationMs: Date.now() - start,
      summary: {
        ...summary,
        backdropBuckets: summary.backdropBuckets,
      },
      groups,
    };

    // FIX: library-scoped cache write (critical)
    await writeAuditCache(payload, libraryId);

    return NextResponse.json({
      ok: true,
      libraryId,
      libraryType,
      movieCount: items.length,
    });
  } finally {
    running = false;
  }
}