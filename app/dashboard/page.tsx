"use client";

/**
 * =========================================================
 * JELLYFIN AUDIT DASHBOARD (AUTO BOOTSTRAP + BACKDROP UX LAYER + SPRINT 2 + SPRINT 3 SKELETON SYSTEM)
 * =========================================================
 * DATE: 2026-06-13
 * TIME: 00:00
 *
 * CHANGES:
 * ---------------------------------------------------------
 * SPRINT 1:
 * - Fullscreen backdrop image layer during loading/boot
 *
 * SPRINT 2:
 * - UI phase controller (boot/loading/transition/ready)
 * - Smooth fade-out of loading screen
 * - Smooth fade-in of dashboard content
 * - Backdrop harmonisation between states
 *
 * SPRINT 3 (ADDED):
 * - Skeleton UI system for tiles (primary + backdrop grids)
 * - CSS shimmer animation (inline injected)
 * - Pre-data layout mirroring for perceived performance
 * - Skeleton → real UI overlap continuity layer
 *
 * REASON:
 * Remove perceived “empty state” entirely by rendering structural UI
 * before API resolution completes.
 *
 * RULES:
 * - NO change to scan logic
 * - NO change to cache contract
 * - NO change to routing or tiles
 * - ONLY UI + perception layer changes
 * =========================================================
 */

import AppHeader from "@/components/AppHeader";
import { useEffect, useState, useCallback } from "react";

type CacheData = {
  /**
   * CORE ASSETS
   */
  primaryMissing: number;
  logoMissing: number;
  thumbMissing: number;
  bannerMissing: number;
  artMissing: number;

  /**
   * PHYSICAL MEDIA ASSETS
   */
  discMissing: number;
  boxMissing: number;
  boxRearMissing: number;
  menuMissing: number;

  /**
   * BACKDROPS
   */
  backdropBuckets?: Record<string, number>;
};

type Library = {
  id: string;
  name: string;
  type: string;
};

type UIPhase = "boot" | "loading" | "transition" | "ready";

export default function Dashboard() {
  const [data, setData] = useState<CacheData | null>(null);
  const [library, setLibrary] = useState<Library | null>(null);

  const [status, setStatus] = useState("initialising");
  const [refreshKey, setRefreshKey] = useState(0);

  console.log("[DASHBOARD RENDER] refreshKey =", refreshKey);

  /**
   * =========================================================
   * SPRINT 2: UI PHASE CONTROLLER
   * =========================================================
   */
  const [uiPhase, setUiPhase] = useState<UIPhase>("boot");

  /**
   * =========================================================
   * INIT LIBRARY FROM URL
   * =========================================================
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const libId = params.get("libraryId") || "legacy";

    console.log("[DASHBOARD] Library selected:", libId);
    console.log("[DASHBOARD][UI] phase: boot");

    setUiPhase("loading");

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
    if (!library?.id) return;
    console.log("[DASHBOARD] EFFECT TRIGGERED");
    console.log("[DASHBOARD] refreshKey =", refreshKey);
    console.log("[DASHBOARD] Resolving library name...");

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
  }, [library?.id, refreshKey]);

  /**
   * =========================================================
   * CACHE + AUTO BOOTSTRAP
   * =========================================================
   */
  const loadDashboard = useCallback(async (forceRefresh = false) => {
    if (!library?.id) return;

    setUiPhase("loading");
    setStatus("checking-cache");
    setData(null);

    const cacheRes = await fetch(
      `/api/cache?libraryId=${library.id}&refreshKey=${refreshKey}`
    );

    const cacheJson = await cacheRes.json();

    if (!forceRefresh && cacheJson.cacheExists !== false) {
      setData(cacheJson);

      setUiPhase("transition");
      setTimeout(() => setUiPhase("ready"), 700);
      return;
    }

    setStatus("scanning");

    await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libraryId: library.id }),
    });

    const newCacheRes = await fetch(
      `/api/cache?libraryId=${library.id}&refreshKey=${refreshKey}`
    );

    const newCacheJson = await newCacheRes.json();

    setData(newCacheJson);

    setUiPhase("transition");
    setTimeout(() => setUiPhase("ready"), 700);
  }, [library?.id, refreshKey]);

  useEffect(() => {
    if (!library?.id) return;
    loadDashboard(false);
  }, [library?.id]);

  useEffect(() => {
    if (!library?.id) return;
    if (refreshKey === 0) return;

    loadDashboard(true);
  }, [refreshKey]);

  /**
   * =========================================================
   * SPRINT 3: SKELETON HELPERS
   * =========================================================
   */
  const showSkeleton =
  !data && uiPhase !== "transition";

  function renderSkeletonTile(key: string) {
    return (
      <div
        key={key}
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          height: 150,
          border: "1px solid #222",
          background: "#151515",
        }}
      >
        <div className="shimmer" />
        <div style={{ padding: 12, position: "relative", zIndex: 2 }}>
          <div style={{ width: "60%", height: 10, background: "#2a2a2a", marginBottom: 10 }} />
          <div style={{ width: "40%", height: 20, background: "#2a2a2a" }} />
        </div>
      </div>
    );
  }

  function renderSkeletonGrid(count: number, prefix: string) {
    return Array.from({ length: count }).map((_, i) =>
      renderSkeletonTile(`${prefix}-${i}`)
    );
  }

  /**
   * =========================================================
   * BACKDROP LAYER STATE
   * =========================================================
   */
  const dashboardOpacity =
    uiPhase === "ready"
      ? 1
      : uiPhase === "transition"
      ? 0.85
      : 0;

  return (
  <div
    style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      fontFamily: "sans-serif",
      background: "#0b0b0f",
    }}
  >

    {/* HEADER — ALWAYS ON TOP */}
    <div style={{ position: "relative", zIndex: 9999 }}>
      <AppHeader
        title="Jellyfin Audit"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard" },
        ]}
        onRefresh={() => setRefreshKey(p => p + 1)}
      />
    </div>


    {/* EVERYTHING ELSE BELOW THIS */}


      
      {/* =====================================================
          SHIMMER KEYFRAMES (SPRINT 3)
          ===================================================== */}
      <style>{`
        .shimmer {
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.05) 50%,
            rgba(255,255,255,0) 100%
          );
          animation: shimmerMove 1.4s infinite;
        }

        @keyframes shimmerMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* BACKDROP */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(/backdrop.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter:
            uiPhase === "ready"
              ? "brightness(0.35)"
              : "brightness(0.5) blur(2px)",
          transform: "scale(1.05)",
          transition: "all 800ms ease",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* OVERLAY */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            uiPhase === "ready"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.92))"
              : "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85))",
          transition: "all 800ms ease",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      
      
      {/* =====================================================
      SKELETON LAYER (SPRINT 3)
      ===================================================== */}
      <div
  style={{
    padding: 24,
    paddingTop: 0,
    position: "relative",
    zIndex: 2,
  }}
>
        {/* SKELETON LAYER */}
        {showSkeleton && (
  <div
    style={{
      padding: 0,
      position: "relative",
      zIndex: 2,
    }}
  >
            {/* PRIMARY GRID SKELETON */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 40,
              }}
            >
              {renderSkeletonGrid(5, "primary")}
            </div>

            {/* BACKDROP GRID SKELETON */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {renderSkeletonGrid(5, "backdrop")}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          LOADING SCREEN (SPRINT 2)
          ===================================================== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          opacity:
            uiPhase === "loading" || uiPhase === "boot"
              ? 1
              : 0,
          transition: "opacity 800ms ease",
          pointerEvents: uiPhase === "ready" ? "none" : "auto",
        }}
      >
        <div style={{ padding: 20, color: "#fff" }}>
          {status === "checking-cache" && "Checking library cache..."}
          {status === "scanning" && "Scanning Jellyfin library..."}
          {status === "loading-results" && "Loading audit results..."}
          {!status && "Loading dashboard..."}
        </div>
      </div>

      {/* =====================================================
          MAIN UI
          ===================================================== */}
      {data && library && (
        <div
          style={{
            position: "relative",
            zIndex: 4,
            opacity: dashboardOpacity,
            transform:
              uiPhase === "transition"
                ? "translateY(8px)"
                : "translateY(0px)",
            transition: "all 800ms ease",
          }}
        >
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
            {[
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
                id: "artMissing",
                title: "Artwork",
                value: data.artMissing,
                href: `/drilldown/artMissing?libraryId=${library.id}`,
                img: "/art.png",
              }
            ].map((tile) => (
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

          {/* =====================================================
              PHYSICAL MEDIA ASSETS (SPRINT 4C)
              ===================================================== */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ marginBottom: 12 }}>
              Physical Media Assets
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  id: "discMissing",
                  title: "Discs",
                  value: data.discMissing,
                  href: `/drilldown/discMissing?libraryId=${library.id}`,
                  img: "/discs.png",
                },
                {
                  id: "boxMissing",
                  title: "Box Covers",
                  value: data.boxMissing,
                  href: `/drilldown/boxMissing?libraryId=${library.id}`,
                  img: "/box.png",
                },
                {
                  id: "boxRearMissing",
                  title: "Back Covers",
                  value: data.boxRearMissing,
                  href: `/drilldown/boxRearMissing?libraryId=${library.id}`,
                  img: "/boxrear.png",
                },
                {
                  id: "menuMissing",
                  title: "Menus",
                  value: data.menuMissing,
                  href: `/drilldown/menuMissing?libraryId=${library.id}`,
                  img: "/menu.png",
                },
              ].map((tile) => (
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
                    <div style={{ fontSize: 14 }}>
                      {tile.title}
                    </div>

                    <div style={{ fontSize: 26 }}>
                      {tile.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* BACKDROP DISTRIBUTION */}
          <div>
            <h2 style={{ marginBottom: 12 }}>Backdrop Distribution</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {[
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
              ].map((tile) => (
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
      )}
    </div>
  );
}