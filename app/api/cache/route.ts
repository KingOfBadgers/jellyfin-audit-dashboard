import { NextResponse } from "next/server";
import { readAuditSummary } from "@/lib/cache/auditCache";

/**
 * =========================================================
 * LIBRARY-AWARE CACHE API (V3 - SPRINT 4 EXTENDED ASSET CONTRACT)
 * =========================================================
 *
 * DATE: 2026-06-14
 * TIME: 00:00
 *
 * CHANGE LOG:
 * ---------------------------------------------------------
 * EXISTING (PRESERVED):
 * - libraryId required contract enforcement
 * - removed implicit legacy fallback
 * - library-scoped cache reads
 *
 * SPRINT 4 CHANGES:
 * - expose boxMissing
 * - expose boxRearMissing
 * - expose artMissing
 * - expose menuMissing
 *
 * REASON:
 * Extend audit summary contract to support additional
 * Jellyfin artwork asset types before dashboard/UI work.
 *
 * RULES:
 * - NO removal of existing fields
 * - Existing dashboard contract preserved
 * - Only additive schema expansion
 * =========================================================
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const libraryId = searchParams.get("libraryId");

    /**
     * =========================================================
     * HARD GUARD — libraryId required
     * =========================================================
     */
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

    /**
     * =========================================================
     * CACHE MISS
     * =========================================================
     */
    if (!cache) {
      console.log("[CACHE] No cache found for library:", libraryId);

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

    /**
     * =========================================================
     * SPRINT 4 DEBUG LOGGING
     * =========================================================
     * Prove new summary values are reaching API layer.
     */
    console.log("[CACHE][SPRINT4] Extended asset summary:", {
      boxMissing: summary.boxMissing,
      boxRearMissing: summary.boxRearMissing,
      artMissing: summary.artMissing,
      menuMissing: summary.menuMissing,
    });

    /**
     * =========================================================
     * RESPONSE CONTRACT
     * =========================================================
     * Existing fields preserved.
     * Sprint 4 fields added below.
     */
    return NextResponse.json({
      cacheExists: true,
      libraryId,

      /**
       * EXISTING SUMMARY FIELDS
       */
      primaryMissing: summary.primaryMissing,
      logoMissing: summary.logoMissing,
      thumbMissing: summary.thumbMissing,
      bannerMissing: summary.bannerMissing,
      discMissing: summary.discMissing,

      /**
       * =====================================================
       * SPRINT 4 EXTENDED ASSET COUNTERS
       * =====================================================
       */
      boxMissing: summary.boxMissing,
      boxRearMissing: summary.boxRearMissing,
      artMissing: summary.artMissing,
      menuMissing: summary.menuMissing,

      /**
       * EXISTING BACKDROP DISTRIBUTION
       */
      backdropBuckets: summary.backdropBuckets,

      /**
       * EXISTING SCAN METADATA
       */
      generatedAt,
      movieCount,
      scanDurationMs,
    });
  } catch (e) {
    /**
     * =========================================================
     * FAILURE HANDLER
     * =========================================================
     */
    console.error("[CACHE] Read failed:", e);

    return NextResponse.json({
      cacheExists: false,
      error: "CACHE_READ_FAILED",
    });
  }
}