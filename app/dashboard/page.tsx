"use client";

/**
 * =========================================================
 * JELLYFIN AUDIT DASHBOARD (AUTO BOOTSTRAP + BACKDROP UX LAYER)
 * =========================================================
 * DATE: 2026-06-12
 * TIME: 11:05
 *
 * CHANGES:
 * ---------------------------------------------------------
 * ADDED:
 * - Fullscreen backdrop image layer during loading/boot
 * - Improves perceived performance during scan/bootstrap
 *
 * REASON:
 * First-run scan can take time.
 * Background visual keeps UI engaging while API loads.
 *
 * RULES:
 * - NO change to scan logic
 * - NO change to cache contract
 * - NO change to routing or tiles
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

  const [status, setStatus] = useState("initialising");

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
    if (!library?.id) return;

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
  }, [library?.id]);

  /**
   * =========================================================
   * CACHE + AUTO BOOTSTRAP
   * =========================================================
   */
  useEffect(() => {
    if (!library?.id) return;

    async function loadDashboard() {
      try {
        console.log("[DASHBOARD] Checking cache...");
        setStatus("checking-cache");

        const cacheRes = await fetch(
          `/api/cache?libraryId=${library.id}`
        );

        const cacheJson = await cacheRes.json();

        if (cacheJson.cacheExists !== false) {
          console.log("[DASHBOARD] Cache found");

          setData(cacheJson);
          setStatus("ready");
          return;
        }

        console.log("[DASHBOARD] Cache missing");
        console.log("[DASHBOARD] Starting first scan...");

        setStatus("scanning");

        const scanRes = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            libraryId: library.id,
          }),
        });

        await scanRes.json();

        console.log("[DASHBOARD] Reloading cache...");
        setStatus("loading-results");

        const newCacheRes = await fetch(
          `/api/cache?libraryId=${library.id}`
        );

        const newCacheJson = await newCacheRes.json();

        setData(newCacheJson);
        setStatus("ready");

        console.log("[DASHBOARD] Dashboard ready");
      } catch (err) {
        console.error("[DASHBOARD] Bootstrap failed", err);
      }
    }

    loadDashboard();
  }, [library?.id]);

  /**
   * =========================================================
   * BACKDROP LAYER STATE
   * =========================================================
   * Always visible until data is ready
   */
  const showBackdrop = !data || status !== "ready";

  if (!data || !library) {
    return (
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* BACKDROP IMAGE LAYER */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(/backdrop.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4) blur(2px)",
            transform: "scale(1.05)",
          }}
        />

        {/* DARK OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9))",
          }}
        />

        {/* LOADING TEXT */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: 20,
            color: "#fff",
          }}
        >
          {status === "checking-cache" && "Checking library cache..."}
          {status === "scanning" && "Scanning Jellyfin library..."}
          {status === "loading-results" && "Loading audit results..."}
          {!status && "Loading dashboard..."}
        </div>
      </div>
    );
  }

  /**
   * =========================================================
   * MAIN UI
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
        position: "relative",
      }}
    >
      {/* BACKDROP LAYER (subtle behind content once ready) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(/backdrop.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: showBackdrop ? 0.25 : 0.12,
          filter: "brightness(0.4)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
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
    </div>
  );
}