import { NextResponse } from "next/server";
import { JellyfinClient } from "@/lib/jellyfin/client";
import { buildMissingIndex } from "@/lib/compute/missing";
import { writeAuditCache } from "@/lib/cache/auditCache";

let running = false;

/**
 * =========================================================
 * GET = full scan (blocking)
 * =========================================================
 */
export async function GET() {
  const start = Date.now();

  const client = new JellyfinClient(
    process.env.JELLYFIN_URL!,
    process.env.JELLYFIN_API_KEY!
  );

  const data = await client.getMovies(
    process.env.JELLYFIN_USER_ID!
  );

  const { summary, groups } = buildMissingIndex(data.Items);

  const payload = {
    generatedAt: new Date().toISOString(),
    movieCount: data.Items.length,
    scanDurationMs: Date.now() - start,

    summary: {
      ...summary,
      backdropBuckets: summary.backdropBuckets,
    },

    groups,
  };

  await writeAuditCache(payload);

  return NextResponse.json({
    ok: true,
    generatedAt: payload.generatedAt,
    movieCount: payload.movieCount,
    scanDurationMs: payload.scanDurationMs,
  });
}

/**
 * =========================================================
 * POST = async guarded scan trigger
 * =========================================================
 */
export async function POST() {
  if (running) {
    return NextResponse.json({ ok: false, running: true });
  }

  running = true;

  try {
    const start = Date.now();

    const client = new JellyfinClient(
      process.env.JELLYFIN_URL!,
      process.env.JELLYFIN_API_KEY!
    );

    const data = await client.getMovies(
      process.env.JELLYFIN_USER_ID!
    );

    const { summary, groups } = buildMissingIndex(data.Items);

    const payload = {
      generatedAt: new Date().toISOString(),
      movieCount: data.Items.length,
      scanDurationMs: Date.now() - start,

      summary: {
        ...summary,
        backdropBuckets: summary.backdropBuckets,
      },

      groups,
    };

    await writeAuditCache(payload);

    return NextResponse.json({
      ok: true,
      mode: "POST_SCAN_COMPLETE",
      generatedAt: payload.generatedAt,
      movieCount: payload.movieCount,
      scanDurationMs: payload.scanDurationMs,
    });
  } finally {
    running = false;
  }
}