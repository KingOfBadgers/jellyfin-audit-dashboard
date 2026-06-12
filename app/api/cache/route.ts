import { NextResponse } from "next/server";
import { readAuditSummary } from "@/lib/cache/auditCache";

/**
 * =========================================================
 * LIBRARY-AWARE CACHE API (V2 - STRICT CONTRACT)
 * =========================================================
 *
 * CHANGE LOG:
 * 2026-06-12
 * - REMOVED implicit "legacy" fallback
 *   Reason: caused cross-library cache bleed
 * - ENFORCED libraryId as required contract input
 * - Added defensive validation logging
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const libraryId = searchParams.get("libraryId");

    if (!libraryId) {
      console.log("[CACHE][ERROR] Missing libraryId");
      return NextResponse.json(
        {
          cacheExists: false,
          error: "libraryId required",
        },
        { status: 400 }
      );
    }

    console.log("[CACHE] Reading library:", libraryId);

    const cache = await readAuditSummary(libraryId);

    if (!cache) {
      return NextResponse.json({
        cacheExists: false,
        libraryId,
      });
    }

    const {
      summary,
      generatedAt,
      movieCount,
      scanDurationMs,
    } = cache;

    return NextResponse.json({
      cacheExists: true,
      libraryId,

      primaryMissing: summary.primaryMissing,
      logoMissing: summary.logoMissing,
      thumbMissing: summary.thumbMissing,
      bannerMissing: summary.bannerMissing,
      discMissing: summary.discMissing,

      backdropBuckets: summary.backdropBuckets,

      generatedAt,
      movieCount,
      scanDurationMs,
    });
  } catch (e) {
    console.error("[CACHE] Read failed:", e);

    return NextResponse.json({
      cacheExists: false,
      error: "CACHE_READ_FAILED",
    });
  }
}