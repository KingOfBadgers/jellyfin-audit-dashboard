/**
 * =========================================================
 * JELLYFIN LIBRARY LABEL RESOLVER
 * =========================================================
 *
 * DATE: 2026-06-12
 * PURPOSE:
 * - Prevent raw library IDs appearing in UI
 * - Provide stable human-readable fallback labels
 * - Centralised mapping layer for dashboard + drilldown
 *
 * STRATEGY:
 * - uses cached in-memory map (client-side safe)
 * - falls back to shortened ID only if needed
 * =========================================================
 */

type LibraryMap = Record<string, string>;

let cache: LibraryMap = {};

/**
 * Load library map from API response shape
 */
export function setLibraryMap(libraries: { id: string; name: string }[]) {
  const map: LibraryMap = {};

  for (const lib of libraries) {
    map[lib.id] = lib.name;
  }

  cache = map;

  console.log("[LIB LABEL] Cache updated:", Object.keys(map).length);
}

/**
 * Resolve safe display name
 */
export function getLibraryLabel(id: string): string {
  if (!id) return "Unknown Library";

  if (cache[id]) return cache[id];

  // fallback: short ID instead of full leak
  return `Library ${id.slice(0, 6)}…`;
}