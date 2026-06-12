"use client";

/**
 * =========================================================
 * DRILLDOWN LAYOUT SHELL
 * =========================================================
 * DATE: 2026-06-12
 *
 * PURPOSE:
 * - Provide consistent page frame
 * - DO NOT fetch data
 * - DO NOT render rows
 * =========================================================
 */

import React from "react";

export default function DrilldownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      {children}
    </div>
  );
}