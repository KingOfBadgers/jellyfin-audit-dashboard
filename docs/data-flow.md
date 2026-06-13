JELLYFIN AUDIT — DATA FLOW LIFECYCLE
VERSION

2026-06-13

1. OVERVIEW

This system is a library-scoped audit engine for Jellyfin.

It tracks missing or incomplete media assets (logos, backdrops, banners, thumbnails, etc.) and presents them through a dashboard + drilldown UI layer.

The entire system is driven by a single pipeline:

SCAN → CACHE → API → DASHBOARD → DRILLDOWN

Everything is library-aware and MUST remain scoped per libraryId.

2. CORE ENTITIES
Library

Represents a Jellyfin collection (movies, TV, collections, legacy fallback).

{
  id: string;
  name: string;
  type: "movie" | "tv" | "collection" | "legacy";
}
Cache Payload (source of truth after scan)

Stored per library in:

/data/<libraryId>/audit-summary.json
/data/<libraryId>/audit-groups.json

Structure:

{
  generatedAt: string;
  movieCount: number;
  scanDurationMs: number;

  summary: {
    primaryMissing: number;
    logoMissing: number;
    thumbMissing: number;
    bannerMissing: number;
    discMissing: number;

    backdropBuckets: {
      "0": number;
      "1-5": number;
      "6-10": number;
      "11-20": number;
      "20+": number;
    };
  };

  groups: any;
}
3. FULL DATA FLOW
STEP 1 — SCAN (SOURCE OF TRUTH GENERATION)
Trigger Sources
Manual API call:
POST /api/scan
Legacy/debug:
GET /api/scan
(Optional future) cron job (currently removed)
What happens in scan
1. Resolve library type
resolveLibraryTypeFromId()

Jellyfin API:

/Users/{userId}/Views

Returns:

movie
tv
collection
legacy fallback
2. Fetch items from Jellyfin
/Users/{userId}/Items?IncludeItemTypes=...

Filtered by:

IncludeItemTypes (Movie / Series / BoxSet)
ParentId = libraryId
Recursive = true
3. Filter + normalise

Movies only:

item.Type === "Movie" && !item.IsFolder
4. Compute missing asset index
buildMissingIndex(items)

Produces:

missing asset counts
backdrop distribution buckets
grouped breakdowns
5. Write cache (CRITICAL STEP)
writeAuditCache(payload, libraryId)

Outputs:

/data/<libraryId>/
  audit-summary.json
  audit-groups.json

This is the ONLY persistent source of truth.

STEP 2 — CACHE LAYER (API READ MODEL)
Endpoint:
GET /api/cache?libraryId=...
Responsibilities
Reads filesystem cache
Returns precomputed summary ONLY
Never recomputes anything
Never queries Jellyfin
Output:
{
  cacheExists: true,
  libraryId: "...",

  primaryMissing: 12,
  logoMissing: 40,
  thumbMissing: 200,
  bannerMissing: 5,
  discMissing: 9,

  backdropBuckets: {
    "0": 10,
    "1-5": 400,
    "6-10": 200,
    "11-20": 50,
    "20+": 10
  },

  generatedAt: "...",
  movieCount: 5586,
  scanDurationMs: 2100
}
STEP 3 — LIBRARY LISTING (ENTRY POINT)
Endpoint:
GET /api/libraries

Used by:

/app/page.tsx
User flow:
User opens app
Libraries load
User selects library
Navigation:
/dashboard?libraryId=<id>
STEP 4 — DASHBOARD (AGGREGATION VIEW)
Route:
/dashboard
Responsibilities
Reads libraryId from URL
Resolves library metadata
Fetches cache:
/api/cache?libraryId=...
UI responsibilities

Displays:

Primary metrics:
primaryMissing
logoMissing
thumbMissing
bannerMissing
discMissing
Backdrop distribution:
0
1–5
6–10
11–20
20+
RULES:
NEVER display raw libraryId
ALWAYS resolve library.name for UI
fallback = "Loading library..."
STEP 5 — DRILLDOWN PAGES
Route:
/drilldown/[type]
Input:
type = primaryMissing | logoMissing | backdrop_6_10 etc
Responsibilities:
Fetch list view from:
/api/list?type=...&libraryId=...
Display paginated / chunked media items
UI rules:
ALWAYS normalize internal keys via:
formatDrilldownLabel()

Examples:

internal key	UI label
logoMissing	Logos
backdrop_6_10	6–10 Backdrops
4. STATE FLOW SUMMARY
[USER SELECTS LIBRARY]
        ↓
/app/page.tsx
        ↓
/dashboard?libraryId=XYZ
        ↓
fetch /api/cache?libraryId=XYZ
        ↓
filesystem:
/data/XYZ/audit-summary.json
        ↓
Dashboard renders tiles
        ↓
User clicks tile
        ↓
/drilldown/[type]
        ↓
/api/list?type=...&libraryId=XYZ
5. CACHE BEHAVIOUR RULES
WRITE

Only occurs in:

/api/scan
optional startup scan script (if enabled)
READ

Only occurs in:

/api/cache
dashboard
drilldown (indirect via list API)
NEVER:
recompute inside UI
fetch Jellyfin from frontend
mix library scopes
6. FIRST RUN EXPERIENCE (NEW USER)

If no cache exists:

/api/cache returns:
{ cacheExists: false }
Dashboard shows:
Loading state OR empty state
User must trigger scan:
POST /api/scan
Cache is generated:
/data/<libraryId>/...
UI becomes populated automatically
7. KEY ARCHITECTURAL RULES
HARD RULES
Library scope is mandatory everywhere
Cache is filesystem-backed, not memory
No implicit fallback library merging
No raw Jellyfin IDs in UI
All labels must be UI-normalised
8. CURRENT SYSTEM STATUS
WORKING
Library selection UI
Dashboard tile rendering
Cache API per library
Scan pipeline (manual + API)
Drilldown layout shell
Backdrop bucket system
Breadcrumb system (partially restored)
FIXED RECENTLY
libraryId bleed ("legacy bug fixed")
cache cross-library contamination
breadcrumb raw key leakage
REMOVED / NOT RELIABLE
cron system (disabled)
localStorage reliance for core state (deprecated pattern)
implicit cache fallback behaviour (removed)
9. FUTURE EXTENSIONS (SAFE ZONE)
Add scan progress UI
Add scan trigger button in dashboard
Add cache freshness indicator
Add “re-scan library” control
Add global search across libraries