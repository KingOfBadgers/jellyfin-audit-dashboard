import { NextResponse } from "next/server";
import { readAuditGroups } from "@/lib/cache/auditCache";

/**
 * =========================================================
 * DRILLDOWN LIST API (V3 — LIBRARY SAFE CONTRACT)
 * =========================================================
 * DATE: 2026-06-12
 * TIME: 08:15
 *
 * DEBUG PHASE ADDITION (SPRINT 4 INIT STEP):
 * ---------------------------------------------------------
 * - Added asset-level debug logging (box/back/art/menu)
 * - NO contract changes
 * - NO UI impact
 * - ONLY observability layer added
 *
 * PURPOSE:
 * Prove whether enriched asset fields exist in cached scan output
 * before exposing them downstream.
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

  /**
   * =========================================================
   * STEP 1 DEBUG: INSPECT RAW ITEM SHAPE
   * =========================================================
   * We log the first few items ONLY to avoid noise overload.
   */
  console.log("[LIST][DEBUG] sample raw item shape:");
  console.log(JSON.stringify(raw?.[0], null, 2));

  /**
   * =========================================================
   * STEP 2 DEBUG: CHECK FOR NEW SPRING 4 FIELDS
   * =========================================================
   * These will likely be undefined at this stage — that's expected.
   */
  const debugSample = raw.slice(0, 5).map((i: any) => ({
    id: i.Id,
    title: i.Name,
    box: i?.assets?.box,
    back: i?.assets?.back,
    art: i?.assets?.art,
    menu: i?.assets?.menu,
  }));

  console.log("[LIST][DEBUG] asset probe (first 5 items):");
  console.log(JSON.stringify(debugSample, null, 2));

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