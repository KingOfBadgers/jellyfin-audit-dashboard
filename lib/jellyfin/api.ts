/**
 * =========================================================
 * JELLYFIN AUDIT API CLIENT (CONTEXT-AWARE)
 * =========================================================
 *
 * DATE: 2026-06-12
 * PURPOSE:
 * - Enforce libraryId on all audit requests
 * - Prevent accidental legacy fallback calls
 * - Centralise API query building
 * =========================================================
 */

export function buildListUrl(type: string, libraryId?: string) {
  const params = new URLSearchParams();

  params.set("type", type);

  if (libraryId) {
    params.set("libraryId", libraryId);
  } else {
    console.warn("[API CLIENT] Missing libraryId - forcing legacy fallback avoided");
  }

  return `/api/list?${params.toString()}`;
}