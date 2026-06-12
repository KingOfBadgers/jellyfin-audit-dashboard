/**
 * =========================================================
 * JELLYFIN IMAGE URL BUILDER (AUTH-SAFE)
 * =========================================================
 *
 * CHANGE LOG:
 * 2026-06-12
 * - Centralised image URL generation
 * - Prevents undefined baseUrl bugs
 * - Adds fallback-safe construction
 * - Ensures consistent drilldown + dashboard usage
 *
 * PURPOSE:
 * - Single source of truth for all Jellyfin images
 * =========================================================
 */

const FALLBACK_IMAGE = "/fallback.png";

/**
 * Get base URL safely from env
 */
function getBaseUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_JELLYFIN_URL;

  if (!base) {
    console.warn("[JELLYFIN IMAGE] Missing NEXT_PUBLIC_JELLYFIN_URL");
    return null;
  }

  return base.replace(/\/$/, "");
}

/**
 * Build PRIMARY image URL (movie poster / item image)
 */
export function buildPrimaryImageUrl(
  itemId?: string,
  libraryId?: string
): string {
  if (!itemId) {
    console.warn("[JELLYFIN IMAGE] Missing itemId");
    return FALLBACK_IMAGE;
  }

  const baseUrl = getBaseUrl();

  if (!baseUrl) return FALLBACK_IMAGE;

  /**
   * NOTE:
   * Jellyfin image endpoints DO NOT require auth headers when using
   * API key or reverse proxy session auth.
   *
   * This URL assumes server is accessible from browser.
   */
  const url = `${baseUrl}/Items/${itemId}/Images/Primary`;

  if (url.includes("undefined")) {
    console.error("[JELLYFIN IMAGE] Invalid URL generated:", {
      itemId,
      libraryId,
      baseUrl,
    });
    return FALLBACK_IMAGE;
  }

  return url;
}

/**
 * Future-proof helper (backdrops, thumbs, etc)
 */
export function buildBackdropUrl(itemId?: string): string {
  if (!itemId) return FALLBACK_IMAGE;

  const baseUrl = getBaseUrl();
  if (!baseUrl) return FALLBACK_IMAGE;

  return `${baseUrl}/Items/${itemId}/Images/Backdrop`;
}