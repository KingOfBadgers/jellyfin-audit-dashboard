"use client";

/**
 * =========================================================
 * JELLYFIN AUDIT DASHBOARD (LIBRARY-AWARE FIXED MODEL)
 * =========================================================
 * DATE: 2026-06-12
 * TIME: 09:10
 *
 * FIXES:
 * - Restored full backdrop distribution tiles (ALL BUCKETS)
 * - Preserved library object model (no raw ID display)
 * - Ensured consistent cache + library resolution
 *
 * RULES:
 * - NEVER show raw library ID in UI
 * - KEEP internal ID usage for routing only
 * =========================================================
 */
import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";

type CacheData = {
  primaryMissing: number;
  logoMissing: number;
  thumbMissing: number;
  bannerMissing: number;
  discMissing: number;
  backdropBuckets?: Record<string, number>;
};

type Library = {
  id: string;
  name: string;
  type: string;
};

export default function Dashboard() {
  const [data, setData] = useState<CacheData | null>(null);
  const [library, setLibrary] = useState<Library | null>(null);

  /**
   * =========================================================
   * INIT LIBRARY FROM URL
   * =========================================================
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const libId = params.get("libraryId") || "legacy";

    console.log("[DASHBOARD] Library selected:", libId);

    setLibrary({
      id: libId,
      name: "Loading library...",
      type: "unknown",
    });
  }, []);

  /**
   * =========================================================
   * RESOLVE LIBRARY NAME
   * =========================================================
   */
  useEffect(() => {
    fetch("/api/libraries")
      .then((r) => r.json())
      .then((data) => {
        const libs: Library[] = data.libraries || [];

        setLibrary((prev) => {
          if (!prev) return prev;

          const match = libs.find((l) => l.id === prev.id);

          if (!match) return prev;

          console.log("[DASHBOARD] Library resolved:", match.name);

          return match;
        });
      })
      .catch((err) => {
        console.error("[DASHBOARD] Library resolve failed", err);
      });
  }, []);

  /**
   * =========================================================
   * FETCH CACHE
   * =========================================================
   */
  useEffect(() => {
    if (!library?.id) return;

    console.log("[DASHBOARD] Loading cache:", library.id);

    fetch(`/api/cache?libraryId=${library.id}`)
      .then((r) => r.json())
      .then((json) => {
        console.log("[DASHBOARD] Cache loaded", json);
        setData(json);
      })
      .catch((err) => {
        console.error("[DASHBOARD] Cache load failed", err);
      });
  }, [library?.id]);

  if (!data || !library) {
    return (
      <div style={{ padding: 20, color: "#aaa" }}>
        Loading dashboard...
      </div>
    );
  }

  /**
   * =========================================================
   * PRIMARY TILE DATA
   * =========================================================
   */
  const tiles = [
    {
      id: "primaryMissing",
      title: "Primary Artwork",
      value: data.primaryMissing,
      href: `/drilldown/primaryMissing?libraryId=${library.id}`,
      img: "/primary.png",
    },
    {
      id: "logoMissing",
      title: "Logos",
      value: data.logoMissing,
      href: `/drilldown/logoMissing?libraryId=${library.id}`,
      img: "/logo.png",
    },
    {
      id: "thumbMissing",
      title: "Thumbnails",
      value: data.thumbMissing,
      href: `/drilldown/thumbMissing?libraryId=${library.id}`,
      img: "/thumb.png",
    },
    {
      id: "bannerMissing",
      title: "Banners",
      value: data.bannerMissing,
      href: `/drilldown/bannerMissing?libraryId=${library.id}`,
      img: "/banner.png",
    },
    {
      id: "discMissing",
      title: "Discs",
      value: data.discMissing,
      href: `/drilldown/discMissing?libraryId=${library.id}`,
      img: "/discs.png",
    },
  ];

  /**
   * =========================================================
   * BACKDROP DISTRIBUTION (RESTORED FULL SET)
   * =========================================================
   */
  const backdropTiles = [
    {
      id: "backdrop_0",
      title: "0 Backdrops",
      value: data.backdropBuckets?.["0"] ?? 0,
      href: `/drilldown/backdrop_0?libraryId=${library.id}`,
      img: "/backdrop-0.png",
    },
    {
      id: "backdrop_1_5",
      title: "1–5 Backdrops",
      value: data.backdropBuckets?.["1-5"] ?? 0,
      href: `/drilldown/backdrop_1_5?libraryId=${library.id}`,
      img: "/backdrop1-5.png",
    },
    {
      id: "backdrop_6_10",
      title: "6–10 Backdrops",
      value: data.backdropBuckets?.["6-10"] ?? 0,
      href: `/drilldown/backdrop_6_10?libraryId=${library.id}`,
      img: "/backdrop_6_10.png",
    },
    {
      id: "backdrop_11_20",
      title: "11–20 Backdrops",
      value: data.backdropBuckets?.["11-20"] ?? 0,
      href: `/drilldown/backdrop_11_20?libraryId=${library.id}`,
      img: "/backdrop_11_20.png",
    },
    {
      id: "backdrop_20_plus",
      title: "20+ Backdrops",
      value: data.backdropBuckets?.["20+"] ?? 0,
      href: `/drilldown/backdrop_20_plus?libraryId=${library.id}`,
      img: "/backdrop_20_plus.png",
    },
  ];

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
      <AppHeader
  title="Jellyfin Audit"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Dashboard" },
  ]}
/>

      {/* PRIMARY GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {tiles.map((tile) => (
          <a
            key={tile.id}
            href={tile.href}
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              textDecoration: "none",
              color: "#fff",
              height: 150,
              border: "1px solid #222",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${tile.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div style={{ position: "relative", padding: 12 }}>
              <div style={{ fontSize: 14 }}>{tile.title}</div>
              <div style={{ fontSize: 26 }}>{tile.value}</div>
            </div>
          </a>
        ))}
      </div>

      {/* BACKDROP DISTRIBUTION */}
      <div>
        <h2 style={{ marginBottom: 12 }}>
          Backdrop Distribution
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {backdropTiles.map((tile) => (
            <a
              key={tile.id}
              href={tile.href}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 10,
                textDecoration: "none",
                color: "#fff",
                border: "1px solid #222",
                padding: 14,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${tile.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.35,
                }}
              />

              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  BACKDROPS
                </div>
                <div style={{ fontSize: 14 }}>{tile.title}</div>
                <div style={{ fontSize: 22 }}>{tile.value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}