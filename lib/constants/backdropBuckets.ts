/**
 * =========================================================
 * JELLYFIN AUDIT — CANONICAL BACKDROP BUCKET SCHEMA
 * DATE: 2026-06-29
 * TIME: 00:00
 *
 * PURPOSE:
 * Single source of truth for:
 * - scan grouping
 * - dashboard rendering
 * - drilldown routing
 * - API validation
 *
 * RULE:
 * ALL systems MUST use these keys ONLY.
 * =========================================================
 */

export const BACKDROP_BUCKETS = [
  "0",
  "1",
  "2-5",
  "6-10",
  "11-20",
  "20+",
] as const;

export type BackdropBucket = typeof BACKDROP_BUCKETS[number];