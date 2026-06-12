"use client";

import { use, useEffect, useMemo, useState } from "react";
import { buildPrimaryImageUrl } from "@/lib/jellyfin/image";
import { formatDrilldownLabel } from "@/lib/ui/labels";
import Breadcrumbs from "@/components/Breadcrumbs"; // (assuming existing)

type MovieItem = {
  id: string;
  title: string;
};

export default function DrilldownPage({ params }: any) {
  const resolvedParams = use(params);

  const [items, setItems] = useState<MovieItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [libraryId, setLibraryId] = useState<string>("legacy");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lib = urlParams.get("libraryId") || "legacy";

    console.log("[DRILLDOWN] Library selected:", lib);
    setLibraryId(lib);
  }, []);

  /**
   * =========================================================
   * FETCH DATA
   * =========================================================
   */
  useEffect(() => {
    if (!libraryId) return;

    setLoading(true);

    fetch(`/api/list?type=${resolvedParams.type}&libraryId=${libraryId}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("[NETFLIX ROW] Items:", data?.items?.length || 0);
        setItems(data.items || []);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.type, libraryId]);

  /**
   * =========================================================
   * VIEW MODEL (SINGLE SOURCE OF TRUTH)
   * =========================================================
   *
   * CRITICAL FIX:
   * We compute the label ONCE and reuse it everywhere.
   * This prevents breadcrumb/title desync.
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

  if (loading) {
    return (
      <div style={{ padding: 20, color: "#aaa" }}>
        Loading Netflix rows…
      </div>
    );
  }

  return (
    <div style={{
      padding: 24,
      background: "#0b0b0f",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "sans-serif",
    }}>

      {/* HEADER */}
      <div style={{ marginBottom: 18 }}>

        {/* BREADCRUMB RESTORED */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: `/dashboard?libraryId=${libraryId}` },
            { label: sectionLabel },
          ]}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          >
            <img src="/home.png" alt="Home" style={{ width: 20, height: 20 }} />
          </a>

          {/* TITLE = SAME SOURCE AS BREADCRUMB */}
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