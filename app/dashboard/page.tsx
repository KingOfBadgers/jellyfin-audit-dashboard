"use client";

/**
 * =========================================================
 * JELLYFIN AUDIT DASHBOARD (LIBRARY-AWARE + ARTWORK TILES)
 * =========================================================
 *
 * PURPOSE
 * -------
 * Library-aware dashboard displaying audit metrics and
 * backdrop distribution using artwork-backed tiles.
 *
 * CHANGE LOG
 * =========================================================
 *
 * 2026-06-11
 *
 * REASON:
 * Library-aware refactor accidentally removed the original
 * artwork tile renderer and replaced it with plain cards.
 *
 * FIX:
 * Restored:
 * - Background artwork tiles
 * - Overlay system
 * - Hover scaling
 * - Netflix-style presentation
 *
 * PRESERVED:
 * - libraryId routing
 * - library-aware cache loading
 * - drilldown routing
 * - backdrop distribution section
 *
 * =========================================================
 */

import { useEffect, useMemo, useState } from "react";

type CacheData = {
  primaryMissing: number;
  logoMissing: number;
  thumbMissing: number;
  bannerMissing: number;
  discMissing: number;
  backdropBuckets?: Record<string, number>;
};

export default function Dashboard() {
  const [data, setData] = useState<CacheData | null>(null);

  /**
   * =========================================================
   * LIBRARY CONTEXT
   * =========================================================
   */
  const [libraryId, setLibraryId] = useState<string>("legacy");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const lib = params.get("libraryId") || "legacy";

    console.log("[DASHBOARD] Library selected:", lib);

    setLibraryId(lib);
  }, []);

  /**
   * =========================================================
   * FETCH LIBRARY CACHE
   * =========================================================
   */
  useEffect(() => {
    console.log(
      "[DASHBOARD] Loading cache for library:",
      libraryId
    );

    fetch(`/api/cache?libraryId=${libraryId}`)
      .then((r) => r.json())
      .then((json) => {
        console.log("[DASHBOARD] Cache loaded", json);

        setData(json);
      })
      .catch((err) => {
        console.error(
          "[DASHBOARD] Cache load failed",
          err
        );
      });
  }, [libraryId]);

  /**
   * =========================================================
   * PRIMARY AUDIT TILES
   * =========================================================
   */
  const tiles = useMemo(() => {
    if (!data) return [];

    return [
      {
        id: "primaryMissing",
        title: "Primary Artwork",
        value: data.primaryMissing,
        href: `/drilldown/primaryMissing?libraryId=${libraryId}`,
        img: "/primary.png",
      },
      {
        id: "logoMissing",
        title: "Logos",
        value: data.logoMissing,
        href: `/drilldown/logoMissing?libraryId=${libraryId}`,
        img: "/logo.png",
      },
      {
        id: "thumbMissing",
        title: "Thumbnails",
        value: data.thumbMissing,
        href: `/drilldown/thumbMissing?libraryId=${libraryId}`,
        img: "/thumb.png",
      },
      {
        id: "bannerMissing",
        title: "Banners",
        value: data.bannerMissing,
        href: `/drilldown/bannerMissing?libraryId=${libraryId}`,
        img: "/banner.png",
      },
      {
        id: "discMissing",
        title: "Discs",
        value: data.discMissing,
        href: `/drilldown/discMissing?libraryId=${libraryId}`,
        img: "/discs.png",
      },
    ];
  }, [data, libraryId]);

  /**
   * =========================================================
   * BACKDROP DISTRIBUTION TILES
   * =========================================================
   */
  const backdropTiles = useMemo(() => {
    if (!data?.backdropBuckets) return [];

    return [
      {
        id: "backdrop_0",
        title: "0 Backdrops",
        value: data.backdropBuckets["0"] ?? 0,
        href: `/drilldown/backdrop_0?libraryId=${libraryId}`,
        img: "/backdrop-0.png",
      },
      {
        id: "backdrop_1_5",
        title: "1–5 Backdrops",
        value: data.backdropBuckets["1-5"] ?? 0,
        href: `/drilldown/backdrop_1_5?libraryId=${libraryId}`,
        img: "/backdrop1-5.png",
      },
      {
        id: "backdrop_6_10",
        title: "6–10 Backdrops",
        value: data.backdropBuckets["6-10"] ?? 0,
        href: `/drilldown/backdrop_6_10?libraryId=${libraryId}`,
        img: "/backdrop_6_10.png",
      },
      {
        id: "backdrop_11_20",
        title: "11–20 Backdrops",
        value: data.backdropBuckets["11-20"] ?? 0,
        href: `/drilldown/backdrop_11_20?libraryId=${libraryId}`,
        img: "/backdrop_11_20.png",
      },
      {
        id: "backdrop_20_plus",
        title: "20+ Backdrops",
        value: data.backdropBuckets["20+"] ?? 0,
        href: `/drilldown/backdrop_20_plus?libraryId=${libraryId}`,
        img: "/backdrop_20_plus.png",
      },
    ];
  }, [data, libraryId]);

  /**
   * =========================================================
   * LOADING STATE
   * =========================================================
   */
  if (!data) {
    return (
      <div
        style={{
          padding: 20,
          color: "#aaa",
        }}
      >
        Loading dashboard...
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
      {/* =====================================================
           HEADER
      ===================================================== */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28 }}>
          Jellyfin Audit
        </h1>

        <p style={{ opacity: 0.6 }}>
          Library: {libraryId}
        </p>
      </div>

      {/* =====================================================
           MAIN AUDIT GRID
      ===================================================== */}
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
              transform: "scale(1)",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "scale(1)";
            }}
          >
            {/* =============================================
                 BACKGROUND IMAGE
            ============================================= */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${tile.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter:
                  "brightness(0.9) contrast(1.1)",
              }}
            />

            {/* =============================================
                 OVERLAY
            ============================================= */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.2))",
              }}
            />

            {/* =============================================
                 CONTENT
            ============================================= */}
            <div
              style={{
                position: "relative",
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                }}
              >
                {tile.id.toUpperCase()}
              </div>

              <div
                style={{
                  fontSize: 14,
                  marginTop: 6,
                }}
              >
                {tile.title}
              </div>

              <div
                style={{
                  fontSize: 26,
                  marginTop: 10,
                }}
              >
                {tile.value}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* =====================================================
           BACKDROP DISTRIBUTION
      ===================================================== */}
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
              {/* =========================================
                   BACKGROUND IMAGE
              ========================================= */}
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

              <div
                style={{
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.6,
                  }}
                >
                  BACKDROPS
                </div>

                <div
                  style={{
                    fontSize: 14,
                  }}
                >
                  {tile.title}
                </div>

                <div
                  style={{
                    fontSize: 22,
                  }}
                >
                  {tile.value}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}