/**
 * =========================================================
 * JELLYFIN AUDIT — MISSING INDEX BUILDER
 * =========================================================
 * DATE: 2026-06-14
 * TIME: 00:00
 *
 * SPRINT 4A CHANGES:
 * ---------------------------------------------------------
 * ADDED:
 * - boxMissing
 * - boxRearMissing
 * - artMissing
 * - menuMissing
 *
 * DEBUG ADDED:
 * - Asset probe logging for Box / BoxRear / Art / Menu
 *
 * REASON:
 * Sprint 4 requires validation that additional Jellyfin
 * artwork asset types exist consistently in scan payloads
 * before exposing them via API/UI.
 *
 * RULES:
 * - NO removal of existing functionality
 * - Existing summary contract preserved
 * - Existing groups preserved
 * - New fields added only
 * =========================================================
 */

export function buildMissingIndex(items: any[]) {
  /**
   * =========================================================
   * SUMMARY COUNTERS
   * =========================================================
   * Existing counters preserved.
   * Sprint 4 counters added below.
   */
  const summary = {
    primaryMissing: 0,
    logoMissing: 0,
    thumbMissing: 0,
    bannerMissing: 0,
    discMissing: 0,

    /**
     * =====================================================
     * SPRINT 4 ADDITIONS
     * =====================================================
     */
    boxMissing: 0,
    boxRearMissing: 0,
    artMissing: 0,
    menuMissing: 0,

    backdropBuckets: {
      "0": 0,
      "1-5": 0,
      "6-10": 0,
      "11-20": 0,
      "20+": 0,
    },
  };

  /**
   * =========================================================
   * GROUP COLLECTIONS
   * =========================================================
   * Existing groups preserved.
   * Sprint 4 groups added below.
   */
  const groups: Record<string, any[]> = {
    primaryMissing: [],
    logoMissing: [],
    thumbMissing: [],
    bannerMissing: [],
    discMissing: [],

    /**
     * =====================================================
     * SPRINT 4 ADDITIONS
     * =====================================================
     */
    boxMissing: [],
    boxRearMissing: [],
    artMissing: [],
    menuMissing: [],

    backdrop_0: [],
    backdrop_1_5: [],
    backdrop_6_10: [],
    backdrop_11_20: [],
    backdrop_20_plus: [],
  };

  /**
   * =========================================================
   * MAIN ITEM LOOP
   * =========================================================
   */
  for (const item of items) {
    const img = item.ImageTags || {};
    const backdrops = item.BackdropImageTags?.length ?? 0;

    /**
     * =====================================================
     * SPRINT 4 DEBUG PROBE
     * =====================================================
     * PURPOSE:
     * Validate whether Jellyfin is returning these asset
     * fields consistently.
     *
     * NOTE:
     * Logging left intentionally verbose during Sprint 4A.
     * Can be reduced later after validation completes.
     * =====================================================
     */
    console.log("[MISSING][ASSET PROBE]", {
      title: item.Name,
      box: img.Box || null,
      boxRear: img.BoxRear || null,
      art: img.Art || null,
      menu: img.Menu || null,
    });


    /**
     * =====================================================
     * EXISTING AUDIT RULES (UNCHANGED)
     * =====================================================
     */
    if (!img.Primary) {
      summary.primaryMissing++;
      groups.primaryMissing.push(item);
    }

    if (!img.Logo) {
      summary.logoMissing++;
      groups.logoMissing.push(item);
    }

    if (!img.Thumb) {
      summary.thumbMissing++;
      groups.thumbMissing.push(item);
    }

    if (!img.Banner) {
      summary.bannerMissing++;
      groups.bannerMissing.push(item);
    }

    if (!img.Disc) {
      summary.discMissing++;
      groups.discMissing.push(item);
    }

    /**
     * =====================================================
     * SPRINT 4 AUDIT RULES
     * =====================================================
     * Pattern identical to existing missing checks.
     * =====================================================
     */

    if (!img.Box) {
      summary.boxMissing++;
      groups.boxMissing.push(item);
    }

    if (!img.BoxRear) {
      summary.boxRearMissing++;
      groups.boxRearMissing.push(item);
    }

    if (!img.Art) {
      summary.artMissing++;
      groups.artMissing.push(item);
    }

    if (!img.Menu) {
      summary.menuMissing++;
      groups.menuMissing.push(item);
    }

    console.log("[MISSING][FULL ITEM STRUCTURE]");

console.log("ImageTags:", item.ImageTags);

console.log("ImageBlurHashes:", item.ImageBlurHashes);

console.log("ImagePaths:", item.ImagePaths);

console.log("BackdropImageTags:", item.BackdropImageTags);
    /**
     * =====================================================
     * EXISTING BACKDROP BUCKET LOGIC (UNCHANGED)
     * =====================================================
     */
    if (backdrops === 0) {
      summary.backdropBuckets["0"]++;
      groups.backdrop_0.push(item);
    } else if (backdrops <= 5) {
      summary.backdropBuckets["1-5"]++;
      groups.backdrop_1_5.push(item);
    } else if (backdrops <= 10) {
      summary.backdropBuckets["6-10"]++;
      groups.backdrop_6_10.push(item);
    } else if (backdrops <= 20) {
      summary.backdropBuckets["11-20"]++;
      groups.backdrop_11_20.push(item);
    } else {
      summary.backdropBuckets["20+"]++;
      groups.backdrop_20_plus.push(item);
    }
  }

  /**
   * =========================================================
   * FINAL RETURN CONTRACT
   * =========================================================
   * Existing contract preserved with additional fields.
   */
  return { summary, groups };
}