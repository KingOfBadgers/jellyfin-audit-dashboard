import { NextResponse } from "next/server";
import { JellyfinClient } from "@/lib/jellyfin/client";

/**
 * =========================================================
 * LIBRARY DISCOVERY API (SCAN-AWARE CONTRACT V2)
 * =========================================================
 *
 * PURPOSE:
 * - Fetch Jellyfin Views
 * - Map to deterministic scan contract
 * - Provide scan-ready metadata for /api/scan
 *
 * KEY CHANGE:
 * - Added "scanType" field = direct scan instruction
 */

type LibraryType = "movie" | "tv" | "collection" | "unknown";

type LibraryItem = {
  id: string;
  name: string;

  // UI label type
  type: LibraryType;

  // RAW Jellyfin type
  itemType: string;

  // NEW: scan contract type (used by /api/scan)
  scanType: LibraryType;
};

function mapLibraryType(collectionType: string | null | undefined): LibraryType {
  switch ((collectionType || "").toLowerCase()) {
    case "movies":
      return "movie";

    case "tvshows":
      return "tv";

    case "boxsets":
      return "collection";

    default:
      return "unknown";
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.JELLYFIN_URL!;
    const apiKey = process.env.JELLYFIN_API_KEY!;
    const userId = process.env.JELLYFIN_USER_ID!;

    const res = await fetch(
      `${baseUrl}/Users/${userId}/Views`,
      {
        headers: {
          "X-Emby-Token": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Jellyfin libraries" },
        { status: 500 }
      );
    }

    const data = await res.json();

    const items: LibraryItem[] = (data?.Items || []).map((lib: any) => {
      const type = mapLibraryType(lib.CollectionType);

      return {
        id: lib.Id,
        name: lib.Name,
        type,
        itemType: lib.CollectionType,

        /**
         * =====================================================
         * SCAN CONTRACT (CRITICAL)
         * =====================================================
         * This tells /api/scan exactly how to behave.
         */
        scanType: type,
      };
    });

    const filtered = items.filter((i) => i.type !== "unknown");

    console.log("[LIBRARIES] Found:", filtered.length);

    return NextResponse.json({
      libraries: filtered,
    });
  } catch (error) {
    console.error("[LIBRARIES] Error:", error);

    return NextResponse.json(
      { error: "LIBRARY_DISCOVERY_FAILED" },
      { status: 500 }
    );
  }
}