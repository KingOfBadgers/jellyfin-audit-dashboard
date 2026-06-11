"use client";

/**
 * =========================================================
 * DRILLDOWN — NETFLIX ROW SYSTEM (V2)
 * =========================================================
 *
 * CHANGE LOG:
 * - 2026-06-10: Replaced grid with Netflix-style row carousels
 * - 2026-06-10: Introduced horizontal scroll rows
 * - 2026-06-10: Chunked dataset into visual rows
 * - 2026-06-10: Maintains API compatibility (no backend changes)
 * - 2026-06-11: Added home navigation icon (dashboard return)
 *
 * DESIGN GOAL:
 * - Emulate Netflix browse behaviour:
 *   vertical rows + horizontal scroll per category chunk
 */

import { use, useEffect, useMemo, useState } from "react";

type MovieItem = {
  id: string;
  title: string;
};

export default function DrilldownPage({ params }: any) {
  const resolvedParams = use(params);

  const [items, setItems] = useState<MovieItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * =========================================================
   * FETCH
   * =========================================================
   */
  useEffect(() => {
    console.log("[NETFLIX ROW] Loading:", resolvedParams.type);

    setLoading(true);

    fetch(`/api/list?type=${resolvedParams.type}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("[NETFLIX ROW] Items:", data?.items?.length || 0);
        setItems(data.items || []);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.type]);

  /**
   * =========================================================
   * FILTER
   * =========================================================
   */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return items;

    return items.filter((m) =>
      m.title.toLowerCase().includes(q)
    );
  }, [items, search]);

  /**
   * =========================================================
   * CHUNK INTO ROWS (Netflix structure)
   * =========================================================
   */
  const rows = useMemo(() => {
    const chunkSize = 12;
    const result: MovieItem[][] = [];

    for (let i = 0; i < filtered.length; i += chunkSize) {
      result.push(filtered.slice(i, i + chunkSize));
    }

    return result;
  }, [filtered]);

  if (loading) {
    return (
      <div style={{ padding: 20, color: "#aaa" }}>
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

        {/* TOP ROW: HOME + TITLE */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          
          {/* HOME BUTTON */}
          <a
            href="/dashboard"
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
            title="Back to dashboard"
          >
            <img
              src="/home.png"
              alt="Home"
              style={{
                width: 64,
                height: 64,
              }}
            />
          </a>

          {/* TITLE */}
          <h1 style={{ fontSize: 26, margin: 0 }}>
            {resolvedParams.type}
          </h1>
        </div>

        {/* META */}
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

      {/* ROW SYSTEM */}
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            {/* ROW LABEL */}
            <div
              style={{
                fontSize: 12,
                opacity: 0.5,
                marginBottom: 8,
              }}
            >
              ROW {rowIndex + 1}
            </div>

            {/* HORIZONTAL SCROLLER */}
            <div
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 6,
              }}
            >
              {row.map((movie) => {
                const baseUrl = process.env.NEXT_PUBLIC_JELLYFIN_URL;

                const imageUrl = baseUrl
                  ? `${baseUrl}/Items/${movie.id}/Images/Primary`
                  : "";

                return (
                  <a
                    key={movie.id}
                    href="#"
                    style={{
                      minWidth: 140,
                      height: 210,
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      flex: "0 0 auto",
                      textDecoration: "none",
                      color: "#fff",
                      background: "#1a1a22",
                      transition: "transform 0.18s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1)";
                    }}
                  >
                    {/* IMAGE LAYER */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    {/* GRADIENT */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)",
                      }}
                    />

                    {/* TITLE */}
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