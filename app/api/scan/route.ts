import { NextResponse } from "next/server";
import { JellyfinClient } from "@/lib/jellyfin/client";
import { buildMissingIndex } from "@/lib/compute/missing";
import { writeAuditCache } from "@/lib/cache/auditCache";

let running = false;

/**
 * =========================================================
 * JELLYFIN AUDIT SCAN ROUTE
 * =========================================================
 *
 * PURPOSE
 * -------
 * Performs full library audit scans and writes results
 * into the local cache layer.
 *
 * CHANGE LOG
 * =========================================================
 *
 * 2026-06-11
 *
 * REASON:
 * Jellyfin is returning BoxSet items despite
 * IncludeItemTypes=Movie being specified.
 *
 * EVIDENCE:
 * Example item:
 *
 * Name: All In The Family Collection
 * Type: BoxSet
 * IsFolder: true
 *
 * FIX:
 * Added defensive movie-only filtering before
 * buildMissingIndex() executes.
 *
 * FUTURE ARCHITECTURE NOTE:
 * -------------------------
 * This filtering intentionally lives in the scan layer
 * rather than JellyfinClient.
 *
 * Reason:
 * Future versions will support:
 *
 * - Movies
 * - TV Shows
 * - Collections
 * - Library selection
 *
 * Keeping the client generic prevents future
 * architectural rewrites.
 *
 * =========================================================
 */

/**
 * =========================================================
 * FILTER MOVIE ITEMS
 * =========================================================
 *
 * Human / AI Notes:
 * -----------------
 * Jellyfin can occasionally return BoxSets or folders
 * despite IncludeItemTypes=Movie.
 *
 * We therefore perform a local deterministic filter.
 */
function filterMovieItems(items: any[]) {
  const filtered = items.filter((item) => {
    return (
      item.Type === "Movie" &&
      item.IsFolder !== true
    );
  });

  console.log(
    `[SCAN] Filtered ${items.length} items -> ${filtered.length} movie items`
  );

  return filtered;
}

/**
 * =========================================================
 * GET = FULL SCAN (BLOCKING)
 * =========================================================
 */
export async function GET() {
  console.log("[SCAN][GET] Starting scan");

  const start = Date.now();

  const client = new JellyfinClient(
    process.env.JELLYFIN_URL!,
    process.env.JELLYFIN_API_KEY!
  );

  const data = await client.getMovies(
    process.env.JELLYFIN_USER_ID!
  );

  console.log(
    `[SCAN][GET] Jellyfin returned ${data.Items.length} items`
  );

  const movieItems = filterMovieItems(data.Items);

  const { summary, groups } = buildMissingIndex(
    movieItems
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    movieCount: movieItems.length,
    scanDurationMs: Date.now() - start,

    summary: {
      ...summary,
      backdropBuckets: summary.backdropBuckets,
    },

    groups,
  };

  await writeAuditCache(payload);

  console.log(
    `[SCAN][GET] Scan complete (${payload.movieCount} movies)`
  );

  return NextResponse.json({
    ok: true,
    generatedAt: payload.generatedAt,
    movieCount: payload.movieCount,
    scanDurationMs: payload.scanDurationMs,
  });
}

/**
 * =========================================================
 * POST = ASYNC GUARDED SCAN TRIGGER
 * =========================================================
 */
export async function POST() {
  if (running) {
    console.log(
      "[SCAN][POST] Scan already running"
    );

    return NextResponse.json({
      ok: false,
      running: true,
    });
  }

  running = true;

  try {
    console.log("[SCAN][POST] Starting scan");

    const start = Date.now();

    const client = new JellyfinClient(
      process.env.JELLYFIN_URL!,
      process.env.JELLYFIN_API_KEY!
    );

    const data = await client.getMovies(
      process.env.JELLYFIN_USER_ID!
    );

    console.log(
      `[SCAN][POST] Jellyfin returned ${data.Items.length} items`
    );

    const movieItems = filterMovieItems(
      data.Items
    );

    const { summary, groups } = buildMissingIndex(
      movieItems
    );

    const payload = {
      generatedAt: new Date().toISOString(),
      movieCount: movieItems.length,
      scanDurationMs: Date.now() - start,

      summary: {
        ...summary,
        backdropBuckets: summary.backdropBuckets,
      },

      groups,
    };

    await writeAuditCache(payload);

    console.log(
      `[SCAN][POST] Scan complete (${payload.movieCount} movies)`
    );

    return NextResponse.json({
      ok: true,
      mode: "POST_SCAN_COMPLETE",
      generatedAt: payload.generatedAt,
      movieCount: payload.movieCount,
      scanDurationMs: payload.scanDurationMs,
    });
  } finally {
    running = false;

    console.log(
      "[SCAN][POST] Scan lock released"
    );
  }
}