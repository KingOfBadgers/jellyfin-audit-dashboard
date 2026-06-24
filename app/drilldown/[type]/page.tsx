"use client";

import { use, useEffect, useMemo, useState } from "react";
import { buildPrimaryImageUrl } from "@/lib/jellyfin/image";
import { formatDrilldownLabel } from "@/lib/ui/labels";
import Breadcrumbs from "@/components/Breadcrumbs"; // (assuming existing)

/**
 * =========================================================
 * JELLYFIN AUDIT — DRILLDOWN PAGE (LIBRARY CONTEXT FIX)
 * =========================================================
 * DATE: 2026-06-13
 * TIME: 00:00
 *
 * FIX APPLIED:
 * ---------------------------------------------------------
 * - REMOVED unsafe default libraryId = "legacy"
 * - PREVENTED early fetch before library context resolves
 * - ELIMINATED dual-request race condition (legacy + real ID)
 *
 * REASON:
 * Initial render was triggering an invalid "legacy" request
 * before URL library context was resolved, causing duplicate
 * API calls and incorrect result overwrites.
 *
 * RULES:
 * - No change to API contract
 * - No change to UI structure
 * - Only fix request lifecycle correctness
 * =========================================================
 */

type MovieItem = {
  id: string;
  title: string;
};

// 1. Define the type for your URL params
type DrilldownParams = Promise<{
  type: string;
}>;

// 2. Type the function props explicitly
export default function DrilldownPage({ params }: { params: DrilldownParams }) {
  // TypeScript now knows resolvedParams is { type: string }
  const resolvedParams = use(params);

  const [items, setItems] = useState<MovieItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * =========================================================
   * FIX: REMOVE LEGACY DEFAULT STATE
   * =========================================================
   * Before: "legacy" caused premature invalid API request.
   * Now: null prevents any fetch until URL is resolved.
   */
  const [libraryId, setLibraryId] = useState<string | null>(null);

  /**
   * =========================================================
   * RESOLVE LIBRARY FROM URL
   * =========================================================
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lib = urlParams.get("libraryId");

    console.log("[DRILLDOWN] Library selected (raw):", lib);

    if (!lib) {
      console.warn("[DRILLDOWN] Missing libraryId in URL");
      setLibraryId(null);
      return;
    }

    setLibraryId(lib);
  }, []);

  /**
   * =========================================================
   * FETCH DATA (GUARDED — SINGLE SOURCE ONLY)
   * =========================================================
   */
  useEffect(() => {
    /**
     * HARD GUARD:
     * Prevent any request until libraryId is valid.
     */
    if (!libraryId) {
      console.log("[DRILLDOWN] Waiting for libraryId...");
      return;
    }

    setLoading(true);

    console.log("[DRILLDOWN][FETCH] Request:", {
      type: resolvedParams.type,
      libraryId,
    });

    fetch(
      `/api/list?type=${resolvedParams.type}&libraryId=${libraryId}`
    )
      .then((r) => r.json())
      .then((data) => {
        console.log("[NETFLIX ROW] Items:", data?.items?.length || 0);
        setItems(data.items || []);
      })
      .catch((err) => {
        console.error("[DRILLDOWN][FETCH] Failed:", err);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.type, libraryId]);

  /**
   * =========================================================
   * VIEW MODEL (SINGLE SOURCE OF TRUTH)
   * =========================================================
   */
  const sectionLabel = useMemo(() => {
    return formatDrilldownLabel(resolvedParams.type);
  }, [resolvedParams.type]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((m) =>
      m.title.toLowerCase().includes(q)
    );
  }, [items, search]);

  const rows = useMemo(() => {
    const chunkSize = 12;
    const result: MovieItem[][] = [];

    for (let i = 0; i < filtered.length; i += chunkSize) {
      result.push(filtered.slice(i, i + chunkSize));
    }

    return result;
  }, [filtered]);

  /**
   * =========================================================
   * LOADING STATE
   * =========================================================
   */
  if (loading || !libraryId) {
    return (
      <div
        style={{
          padding: 20,
          color: "#aaa",
          background: "#0b0b0f",
          minHeight: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        Loading Netflix rows…
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        background: "#0b0b0f",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 18 }}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            {
              label: "Dashboard",
              href: `/dashboard?libraryId=${libraryId}`,
            },
            { label: sectionLabel },
          ]}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href={`/dashboard?libraryId=${libraryId}`}
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
              flexShrink: 0,
            }}
          >
            <img
              src="/home.png"
              alt="Home"
              style={{ width: 20, height: 20 }}
            />
          </a>

          <h1 style={{ fontSize: 26, margin: 0 }}>
            {sectionLabel}
          </h1>
        </div>

        <div style={{ opacity: 0.6, marginTop: 6 }}>
          {filtered.length} titles
        </div>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search titles…"
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #333",
          background: "#111",
          color: "#fff",
        }}
      />

      {/* ROWS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
              ROW {rowIndex + 1}
            </div>

            <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
              {row.map((movie) => {
                const imageUrl = buildPrimaryImageUrl(movie.id);

                  /**
                   * CHANGE:
                   * - Replaced placeholder href="#" with Jellyfin deep link per movie.id
                   *
                   * DATE: 2026-06-22
                   * TIME: 00:00
                   *
                   * REASON:
                   * Enable direct navigation from drilldown cards into Jellyfin item pages
                   * without altering cache, layout, or drilldown structure.
                   */

                return (
                  <a
                      key={movie.id}
                      href={`${process.env.NEXT_PUBLIC_JELLYFIN_URL || ""}/web/index.html#!/details?id=${movie.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        minWidth: 140,
                        height: 210,
                        position: "relative",
                        borderRadius: 10,
                        overflow: "hidden",
                        flex: "0 0 auto",
                        background: "#1a1a22",
                      }}
                    >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        padding: 8,
                        fontSize: 11,
                      }}
                    >
                      {movie.title}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}