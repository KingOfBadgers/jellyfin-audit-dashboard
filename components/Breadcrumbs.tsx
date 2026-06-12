"use client";

/**
 * =========================================================
 * BREADCRUMB RENDERER
 * =========================================================
 * DATE: 2026-06-12
 * TIME: 09:28
 *
 * PURPOSE:
 * - Render breadcrumb trail
 * - No styling framework dependency
 * - Safe for dashboard + drilldown reuse
 * =========================================================
 */

import React from "react";
import type { BreadcrumbItem } from "@/lib/ui/breadcrumbs";

export default function Breadcrumbs({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.href ? (
            <a
              href={item.href}
              style={{
                color: "#fff",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {item.label}
            </a>
          ) : (
            <span>{item.label}</span>
          )}

          {idx < items.length - 1 && (
            <span style={{ opacity: 0.4 }}>›</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}