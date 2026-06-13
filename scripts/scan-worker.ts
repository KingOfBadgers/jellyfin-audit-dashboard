/**
 * =========================================================
 * JELLYFIN AUDIT — CRON DISABLED
 * =========================================================
 *
 * DATE: 2026-06-12
 * TIME: 09:40
 *
 * CHANGE:
 * - Cron scan removed
 *
 * REASON:
 * - Legacy global scan conflicted with library-scoped API scan
 * - Caused cache overwrites and inconsistent dashboard state
 *
 * NEW SOURCE OF TRUTH:
 * - /api/scan (library-scoped, deterministic)
 * =========================================================
 */

console.log("[SCAN][CRON] Disabled - using API-driven scan only");

/**
 * No-op export to prevent accidental imports breaking runtime
 */
export function runCronScanDisabled() {
  console.log("[SCAN][CRON] No-op");
}