"use client";

/**
 * =========================================================
 * APP HEADER (SHARED)
 * =========================================================
 * DATE: 2026-06-12
 *
 * PURPOSE:
 * - Unified header for dashboard + drilldown
 * - Optional breadcrumb support
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
  return (
    <div style={{ marginBottom: 18 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <a
          href="/"
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#111",
            textDecoration: "none",
          }}
        >
          <img src="/home.png" alt="Home" style={{ width: 20, height: 20 }} />
        </a>

        <h1 style={{ fontSize: 26, margin: 0 }}>{title}</h1>
      </div>
    </div>
  );
}