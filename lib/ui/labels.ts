/**
 * =========================================================
 * UI LABEL MAPPER (HUMAN READABLE LAYER)
 * =========================================================
 * DATE: 2026-06-12
 * TIME: 09:40
 *
 * PURPOSE:
 * - Convert internal drilldown keys into user-friendly labels
 * - Prevent technical leakage into UI (e.g. backdrop_6_10)
 * =========================================================
 */

export function formatDrilldownLabel(key: string): string {
  switch (key) {
    case "primaryMissing":
      return "Primary Artwork Missing";

    case "logoMissing":
      return "Missing Logos";

    case "thumbMissing":
      return "Missing Thumbnails";

    case "bannerMissing":
      return "Missing Banners";

    case "discMissing":
      return "Missing Disc Art";

    case "backdrop_0":
      return "No Backdrops";

    case "backdrop_1_5":
      return "Light Backdrops (1–5)";

    case "backdrop_6_10":
      return "Standard Backdrops (6–10)";

    case "backdrop_11_20":
      return "High Backdrops (11–20)";

    case "backdrop_20_plus":
      return "Excess Backdrops (20+)";

    default:
      return key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}