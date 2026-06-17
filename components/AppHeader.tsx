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
 *
 * REASON:
 * Home navigation is already handled by breadcrumbs system.
 * Refresh is an operational action, not navigation.
 * =========================================================
 */

import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/lib/ui/breadcrumbs";

export default function AppHeader({
  title,
  breadcrumbs,
}: {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  /**
   * =========================================================
   * REFRESH HANDLER (GLOBAL HEADER ACTION)
   * =========================================================
   * NOTE:
   * This intentionally triggers a full page reload.
   * Can later be replaced with injected callback if needed.
   * =========================================================
   */
  function handleRefresh() {
    console.log("[APPHEADER] Refresh triggered");
    window.location.reload();
  }

  return (
    <div style={{ marginBottom: 18 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        
        {/* =====================================================
           REFRESH BUTTON (REPLACES HOME ICON)
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

        <h1 style={{ fontSize: 26, margin: 0 }}>{title}</h1>
      </div>
    </div>
  );
}