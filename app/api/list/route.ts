import { NextResponse } from "next/server";
import { readAuditGroups } from "@/lib/cache/auditCache";

/**
 * =========================================================
 * DRILLDOWN LIST API (V3 — LIBRARY SAFE CONTRACT)
 * =========================================================
 * DATE: 2026-06-12
 * TIME: 08:15
 *
 * FIXES:
 * - Enforces libraryId propagation
 * - Removes silent fallback mismatch (legacy vs active library)
 * - Prevents empty drilldowns when dashboard is correct
 * =========================================================
 */

const VALID_KEYS = new Set([
  "primaryMissing",
  "logoMissing",
  "thumbMissing",
  "bannerMissing",
  "discMissing",
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

  const safeType = VALID_KEYS.has(type) ? type : null;

  if (!safeType) {
    return NextResponse.json({
      error: "Invalid type",
      requested: type,
      validKeys: Array.from(VALID_KEYS),
      items: [],
    });
  }

  const raw = cache.groups?.[safeType];

  if (!raw) {
    return NextResponse.json({
      libraryId,
      type: safeType,
      count: 0,
      items: [],
      warning: "Group exists in schema but is empty in cache",
    });
  }

  const items = raw.map((i: any) => ({
    id: i.Id,
    title: i.Name,
    backdropCount: i.BackdropImageTags?.length ?? 0,
  }));
  console.log("[LIST][DEBUG] reading library:", libraryId);
  console.log("[LIST] Returning:", items.length);

  return NextResponse.json({
    libraryId,
    type: safeType,
    count: items.length,
    items,
  });
}