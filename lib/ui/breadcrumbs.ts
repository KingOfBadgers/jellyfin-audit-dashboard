/**
 * =========================================================
 * BREADCRUMB BUILDER (NORMALISED LABEL VERSION)
 * =========================================================
 * DATE: 2026-06-12
 * TIME: 09:55
 *
 * FIX:
 * - Prevent raw keys leaking into UI (logoMissing, backdrop_6_10)
 * - Centralises label formatting for all breadcrumb nodes
 * - Fixes missing spacing / concatenation issues in UI rendering
 * =========================================================
 */

import { formatDrilldownLabel } from "@/lib/ui/labels";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BuildBreadcrumbParams = {
  libraryName?: string;
  libraryId: string;
  section?: string;
};

export function buildBreadcrumbs({
  libraryName,
  libraryId,
  section,
}: BuildBreadcrumbParams): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  /**
   * HOME
   */
  items.push({
    label: "Home",
    href: "/",
  });

  /**
   * LIBRARY NODE (human readable only)
   */
  items.push({
    label: libraryName || "Library",
    href: `/dashboard?libraryId=${libraryId}`,
  });

  /**
   * DRILLDOWN SECTION (NORMALISED)
   */
  if (section) {
    items.push({
      label: formatDrilldownLabel(section), // 🔥 FIX: normalize here
    });
  }

  return items;
}