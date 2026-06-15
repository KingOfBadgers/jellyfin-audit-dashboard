import { NextResponse } from "next/server";
import { readAuditGroups } from "@/lib/cache/auditCache";

/**
 * =========================================================
 * DRILLDOWN LIST API (V4 — EXTENDED ASSET SUPPORT)
 * =========================================================
 * DATE: 2026-06-15
 * TIME: 07:42
 *
 * PREVIOUS FIXES PRESERVED:
 * - Enforces libraryId propagation
 * - Removes silent fallback mismatch (legacy vs active library)
 * - Prevents empty drilldowns when dashboard is correct
 *
 * SPRINT 4 CHANGES:
 * ---------------------------------------------------------
 * ADDED NEW AUDIT TYPES:
 * - boxMissing
 * - boxRearMissing
 * - artMissing
 * - menuMissing
 *
 * REASON:
 * Extend audit engine to support expanded Jellyfin artwork
 * taxonomy before dashboard/UI implementation.
 *
 * IMPORTANT:
 * - No existing logic removed
 * - Existing routes preserved
 * - Existing response contract preserved
 * =========================================================
 */

/**
 * =========================================================
 * VALID DRILLDOWN TYPES
 * =========================================================
 *
 * SPRINT 4:
 * Extended supported asset categories
 */
const VALID_KEYS = new Set([
  // CORE
  "primaryMissing",
  "logoMissing",
  "thumbMissing",
  "bannerMissing",
  "artMissing",

  // PHYSICAL MEDIA
  "discMissing",
  "boxMissing",
  "boxRearMissing",
  "menuMissing",

  // BACKDROPS
  "backdrop_0",
  "backdrop_1_5",
  "backdrop_6_10",
  "backdrop_11_20",
  "backdrop_20_plus",
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type") || "primaryMissing";
  const libraryId = searchParams.get("libraryId");

  console.log("[LIST] Request:", { type, libraryId });

  /**
   * =========================================================
   * HARD GUARD: libraryId required
   * =========================================================
   */
  if (!libraryId) {
    console.error("[LIST] Missing libraryId — refusing request");

    return NextResponse.json(
      {
        error: "libraryId required",
        hint: "Pass ?libraryId=<activeLibraryId>",
        items: [],
      },
      { status: 400 }
    );
  }

  /**
   * =========================================================
   * LOAD LIBRARY-SCOPED CACHE
   * =========================================================
   */
  const cache = await readAuditGroups(libraryId);

  if (!cache?.groups) {
    console.error("[LIST] No cache found:", libraryId);

    return NextResponse.json(
      {
        error: "No audit cache found",
        libraryId,
        type,
        items: [],
      },
      { status: 404 }
    );
  }

  /**
   * =========================================================
   * VALIDATE REQUESTED TYPE
   * =========================================================
   */
  const safeType = VALID_KEYS.has(type) ? type : null;

  if (!safeType) {
    console.error("[LIST] Invalid type requested:", type);

    return NextResponse.json({
      error: "Invalid type",
      requested: type,
      validKeys: Array.from(VALID_KEYS),
      items: [],
    });
  }

  /**
   * =========================================================
   * READ GROUP
   * =========================================================
   */
  const raw = cache.groups?.[safeType];
  console.log("[LIST][SPRINT4D] type resolved:", safeType);
  if (!raw) {
    console.log(
      "[LIST] Group exists in schema but empty:",
      safeType
    );

    return NextResponse.json({
      libraryId,
      type: safeType,
      count: 0,
      items: [],
      warning: "Group exists in schema but is empty in cache",
    });
  }

  /**
   * =========================================================
   * NORMALISE ITEM RESPONSE
   * =========================================================
   *
   * IMPORTANT:
   * Preserve existing response contract for frontend safety
   */
  const items = raw.map((i: any) => ({
    id: i.Id,
    title: i.Name,
    backdropCount: i.BackdropImageTags?.length ?? 0,
  }));

  /**
   * =========================================================
   * DEBUG LOGGING
   * =========================================================
   */
  console.log("[LIST][DEBUG] reading library:", libraryId);
  console.log("[LIST][DEBUG] requested type:", safeType);
  console.log("[LIST] Returning:", items.length);

  /**
   * =========================================================
   * RESPONSE
   * =========================================================
   */
  return NextResponse.json({
    libraryId,
    type: safeType,
    count: items.length,
    items,
  });
}