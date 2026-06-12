import fs from "fs/promises";
import path from "path";

/**
 * =========================================================
 * LIBRARY-AWARE AUDIT CACHE (V1 SAFE MODE)
 * =========================================================
 *
 * CHANGE LOG:
 * 2026-06-11
 * - Added safe fallback for missing libraryId
 * - Prevents runtime crash when legacy scans run
 *
 * DESIGN GOAL:
 * - Always guarantee a valid filesystem path
 * - Support both legacy + library-aware scans
 * =========================================================
 */

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * SAFE FALLBACK HANDLING
 */
function resolveLibraryId(libraryId?: string | null) {
  return libraryId && libraryId.trim().length > 0
    ? libraryId
    : "legacy";
}

function getLibraryDir(libraryId?: string | null) {
  return path.join(DATA_DIR, resolveLibraryId(libraryId));
}

function getSummaryFile(libraryId?: string | null) {
  return path.join(getLibraryDir(libraryId), "audit-summary.json");
}

function getGroupsFile(libraryId?: string | null) {
  return path.join(getLibraryDir(libraryId), "audit-groups.json");
}

/**
 * =========================================================
 * WRITE CACHE (LIBRARY SCOPED)
 * =========================================================
 */
export async function writeAuditCache(
  payload: any,
  libraryId?: string | null
) {
  const safeId = resolveLibraryId(libraryId);

  const dir = path.join(DATA_DIR, safeId);

  await fs.mkdir(dir, { recursive: true });

  const summaryPayload = {
    generatedAt: payload.generatedAt,
    movieCount: payload.movieCount,
    scanDurationMs: payload.scanDurationMs,
    summary: payload.summary,
  };

  const groupsPayload = {
    groups: payload.groups,
  };

  await fs.writeFile(
    path.join(dir, "audit-summary.json"),
    JSON.stringify(summaryPayload, null, 2),
    "utf8"
  );

  await fs.writeFile(
    path.join(dir, "audit-groups.json"),
    JSON.stringify(groupsPayload, null, 2),
    "utf8"
  );

  console.log(`[CACHE] Wrote audit cache for library: ${safeId}`);
}

/**
 * =========================================================
 * READ SUMMARY (LIBRARY SCOPED)
 * =========================================================
 */
export async function readAuditSummary(libraryId?: string | null) {
  try {
    const raw = await fs.readFile(
      getSummaryFile(libraryId),
      "utf8"
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * =========================================================
 * READ GROUPS (LIBRARY SCOPED)
 * =========================================================
 */
export async function readAuditGroups(libraryId?: string | null) {
  try {
    const raw = await fs.readFile(
      getGroupsFile(libraryId),
      "utf8"
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}