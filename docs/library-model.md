JELLYFIN AUDIT — LIBRARY ID PROPAGATION MODEL
VERSION

2026-06-13

1. PURPOSE

This document defines how libraryId is propagated through the entire system.

It is the single routing + scoping key that ensures:

Data isolation per Jellyfin library
Cache correctness
UI consistency
No cross-library bleed
2. CORE PRINCIPLE
libraryId is the ONLY global scoping identifier in the system

It is required at every layer after initial library selection.

3. ENTRY POINTS (HOW libraryId ENTERS SYSTEM)
3.1 Library Selection Page

File:

/app/page.tsx

Flow:

User clicks library card
        ↓
selectLibrary(lib)
        ↓
localStorage (UI convenience only)
        ↓
redirect
/dashboard?libraryId=<id>
Key rule:
URL is the real source of truth
localStorage is optional UI memory only
3.2 Direct URL Access

Users can also enter:

/dashboard?libraryId=XYZ

or

/drilldown/...?...libraryId=XYZ
4. DASHBOARD PROPAGATION LAYER

File:

/app/dashboard/page.tsx
4.1 Extraction
const params = new URLSearchParams(window.location.search);
const libId = params.get("libraryId") || "legacy";
Important:
legacy is fallback only for safety
It MUST NOT merge with real libraries
4.2 State Binding
setLibrary({
  id: libId,
  name: "Loading library...",
  type: "unknown",
});

At this point:

libraryId is now UI state anchor
4.3 Resolution Phase

Dashboard resolves metadata:

GET /api/libraries

Then:

match library.id === libId

Result:

library object becomes fully enriched
4.4 Cache Fetch
GET /api/cache?libraryId=<id>

This is the first real dependency on libraryId as backend scope key

5. CACHE LAYER PROPAGATION

File:

/app/api/cache/route.ts
5.1 Contract
GET /api/cache?libraryId=...
Behaviour:
REQUIRED parameter
NO implicit fallback (except validation error handling)
Scope = filesystem folder
5.2 Filesystem Mapping
/data/<libraryId>/

Contains:

audit-summary.json
audit-groups.json
5.3 Read Flow
libraryId
  ↓
readAuditSummary(libraryId)
  ↓
/data/<libraryId>/audit-summary.json
6. SCAN LAYER PROPAGATION

File:

/app/api/scan/route.ts
6.1 Input
POST (primary)
{
  "libraryId": "abc123"
}
6.2 Resolution Chain
libraryId
  ↓
resolveLibraryTypeFromId()
  ↓
buildQuery()
  ↓
Jellyfin API fetch
6.3 Output Write
writeAuditCache(payload, libraryId);

This is critical:

SCAN OUTPUT IS ALWAYS LIBRARY-SCOPED
6.4 Legacy GET behaviour
GET /api/scan?libraryId=...

Still supported for debugging but discouraged.

7. DRILLDOWN PROPAGATION

File:

/app/drilldown/[type]/page.tsx
7.1 Input
type + libraryId

Example:

/drilldown/logoMissing?libraryId=XYZ
7.2 Usage
fetch(`/api/list?type=${type}&libraryId=${libraryId}`)
7.3 UI binding
libraryId is used ONLY for routing + API calls
NOT for display
8. APP HEADER PROPAGATION (UI CONTEXT LAYER)

File:

/components/AppHeader.tsx
8.1 Breadcrumb usage
{
  label: "Dashboard",
  href: `/dashboard?libraryId=${library.id}`
}
Rule:
Every breadcrumb link MUST carry libraryId forward
Otherwise navigation breaks scope isolation
9. LOCAL STORAGE ROLE

Used ONLY for convenience:

activeLibraryId
activeLibraryName
activeLibraryType
NOT authoritative

It can be missing, stale, or ignored.

System does NOT depend on it.
10. PROPAGATION MAP (END-TO-END)
[User selects library]
        ↓
URL: /dashboard?libraryId=X
        ↓
Dashboard reads libraryId
        ↓
Dashboard resolves library metadata
        ↓
Dashboard requests cache:
/api/cache?libraryId=X
        ↓
Cache reads:
/data/X/audit-summary.json
        ↓
User clicks tile
        ↓
/drilldown/[type]?libraryId=X
        ↓
Drilldown calls:
/api/list?type=Y&libraryId=X
        ↓
Server fetches Jellyfin scoped to X
11. CRITICAL RULES
11.1 NEVER DO
Never merge multiple libraryIds
Never fallback silently to "legacy" in UI logic
Never display raw libraryId in UI
Never fetch cache without libraryId
11.2 ALWAYS DO
Pass libraryId in every API call
Preserve libraryId in every route transition
Resolve library metadata separately from ID
Treat cache as immutable per library scope
12. FAILURE MODES (KNOWN)
12.1 Missing libraryId

Effect:

cache returns 400
dashboard may show empty state

Fix:

ensure URL always includes libraryId
12.2 Cache mismatch

Effect:

wrong counts shown

Cause:

scan wrote wrong library folder
12.3 UI desync

Effect:

breadcrumbs correct but tiles wrong OR vice versa

Cause:

library resolution mismatch vs URL state
13. DESIGN INTENT

This architecture intentionally enforces:

strict scoping
deterministic cache reads
no implicit global state
URL-driven navigation