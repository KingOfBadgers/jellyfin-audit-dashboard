"use client";

/**
 * =========================================================
 * APP HEADER (SHARED)
 * =========================================================
 * DATE: 2026-06-17
 *
 * CHANGE:
 * ---------------------------------------------------------
 * - Replaced hardcoded Home navigation icon with Refresh action
 * - Added injected refresh handler (non-breaking)
 * - Removed full page reload anti-pattern
 *
 * REASON:
 * Header should not control application lifecycle directly.
 * Refresh must be delegated to dashboard state system.
 * =========================================================
 */

import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/lib/ui/breadcrumbs";

export default function AppHeader({
  title,
  breadcrumbs,
  onRefresh,
}: {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  onRefresh?: () => void;
}) {
  /**
   * =========================================================
   * REFRESH HANDLER (FALLBACK SAFETY)
   * =========================================================
   * If parent does NOT supply a refresh handler,
   * we fallback to full reload.
   * =========================================================
   */
  function handleRefresh() {
    console.log("[APPHEADER] Refresh triggered");

    if (onRefresh) {
      onRefresh();
      return;
    }

    window.location.reload();
  }

  return (
    <div style={{ marginBottom: 18 }}>
      {/* BREADCRUMBS */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* HEADER ROW */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        
        {/* =====================================================
           REFRESH BUTTON
           ===================================================== */}
        <button
          onClick={handleRefresh}
          style={{
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#111",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <img
            src="/refresh.png"
            alt="Refresh"
            style={{ width: 48, height: 48 }}
          />
        </button>

        {/* TITLE */}
        <h1 style={{ fontSize: 26, margin: 0 }}>{title}</h1>
      </div>
    </div>
  );
}