export class JellyfinClient {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  /**
   * =========================================================
   * HEADERS (AUTH SAFE)
   * =========================================================
   */
  private headers() {
    return {
      "X-Emby-Token": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * =========================================================
   * MOVIES FETCH
   * =========================================================
   */
  async getMovies(userId: string) {
    const res = await fetch(
      `${this.baseUrl}/Users/${userId}/Items?IncludeItemTypes=Movie&Recursive=true`,
      { headers: this.headers() }
    );

    if (!res.ok) {
      console.error("[JELLYFIN] Failed to fetch movies", {
        status: res.status,
      });
      throw new Error("Failed to fetch Jellyfin movies");
    }

    return res.json();
  }

  /**
   * =========================================================
   * IMAGE BUILDER (SINGLE SOURCE OF TRUTH)
   * =========================================================
   *
   * DATE: 2026-06-12
   * PURPOSE:
   * - Ensure all UI layers use identical Jellyfin image URLs
   * - Prevent broken / undefined baseUrl issues
   * - Centralise auth-safe image generation
   */
  buildPrimaryImageUrl(itemId: string): string {
    if (!itemId) {
      console.warn("[JELLYFIN] Missing itemId for image");
      return "/fallback.png";
    }

    if (!this.baseUrl) {
      console.error("[JELLYFIN] Missing baseUrl");
      return "/fallback.png";
    }

    const url = `${this.baseUrl}/Items/${itemId}/Images/Primary`;

    console.log("[JELLYFIN] Image URL generated:", url);

    return url;
  }

  /**
   * =========================================================
   * OPTIONAL SAFETY WRAPPER (future expansion)
   * =========================================================
   */
  buildBackdropUrl(itemId: string): string {
    if (!itemId) return "/fallback.png";

    return `${this.baseUrl}/Items/${itemId}/Images/Backdrop`;
  }
}