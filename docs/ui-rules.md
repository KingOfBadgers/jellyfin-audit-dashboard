JELLYFIN AUDIT — UI RULES (FORMATTING + BREADCRUMB + LABEL SYSTEM)
VERSION

2026-06-13

1. PURPOSE

This document defines the UI rendering rules for:

Labels (never raw keys)
Breadcrumbs (consistent navigation state)
Titles (human-safe display)
Internal IDs (never exposed in UI text)
2. CORE PRINCIPLE
UI must NEVER display raw system keys or storage identifiers

Examples of forbidden UI output:

logoMissing
backdrop_6_10
210375352bc15d88e370377e63e41324

All such values must be transformed before rendering.

3. LABEL NORMALISATION SYSTEM
3.1 Source of truth

All UI labels must be generated via:

formatDrilldownLabel(key)

Defined in:

/lib/ui/labels.ts
3.2 Transformation Rules
3.2.1 Case splitting
logoMissing → Logo Missing
primaryMissing → Primary Missing
3.2.2 Bucket formatting
backdrop_6_10 → 6–10 Backdrops
backdrop_20_plus → 20+ Backdrops
3.2.3 Numeric range normalization
Raw Key	UI Output
0	0 Backdrops
1-5	1–5 Backdrops
6-10	6–10 Backdrops
3.2.4 Special Cases
logoMissing → Logos
thumbMissing → Thumbnails
discMissing → Discs
bannerMissing → Banners
primaryMissing → Primary Artwork
4. BREADCRUMB RULES
4.1 Source of truth

All breadcrumb construction MUST use:

buildBreadcrumbs()

File:

/lib/ui/breadcrumbs.ts
4.2 Required Structure
type BreadcrumbItem = {
  label: string;
  href?: string;
};
4.3 Required breadcrumb chain

Every page must follow:

Home → Dashboard → Drilldown (optional)
4.4 Library propagation rule

Every breadcrumb that references dashboard MUST include:

?libraryId=<id>

Example:

/dashboard?libraryId=abc123
4.5 Forbidden breadcrumb states

❌ NEVER:

show raw libraryId
show undefined labels
concatenate labels without spacing
skip dashboard node entirely (unless explicitly landing page)
4.6 Breadcrumb label rules
Node	Rule
Home	Always static "Home"
Dashboard	Always "Dashboard"
Library	Must use resolved library.name
Drilldown	Must use formatDrilldownLabel()
5. TITLE RENDERING RULES
5.1 Single source of truth
Title MUST reuse same label function as breadcrumbs
5.2 Required consistency rule
Breadcrumb current node label === Page H1 title

No divergence allowed.

5.3 Forbidden patterns

❌ Do NOT:

compute title separately from breadcrumb
use raw route params as titles
use internal IDs in headings
6. ICON / VISUAL LABEL RULES
6.1 Library icons

Must map via:

/library-movies.png
/library-tv.png
/library-collections.png
/library-default.png
6.2 Backdrop tile images

Each bucket must have:

/backdrop-0.png
/backdrop1-5.png
/backdrop_6_10.png
/backdrop_11_20.png
/backdrop_20_plus.png
6.3 Fallback rule

If image missing:

/fallback.png
7. INTERNAL ID RULES
7.1 Allowed usage

Internal IDs may ONLY be used for:

routing
API calls
cache lookup
filesystem paths
7.2 Forbidden usage

❌ NEVER display:

library.id
item.id
backdrop_6_10
logoMissing

in UI text nodes.

8. FORMATTING RULES
8.1 Typography
Font: system sans-serif
No framework dependency required
Default size hierarchy:
Element	Size
H1	26px
H2	18px
Body	14px
Metadata	12px
8.2 Layout spacing
Grid gap: 12–16px
Section spacing: 24–40px
Breadcrumb gap: 8px
8.3 Color rules
Element	Color
Primary text	#fff
Secondary text	rgba(255,255,255,0.6)
Muted	rgba(255,255,255,0.4)
9. STATE DISPLAY RULES
9.1 Loading states

Must always show:

human-readable label placeholder
never raw IDs

Example:

Loading library...
9.2 Empty states

Must be explicit:

"No results found"
"No data available for this library"

Never blank UI.

10. NAVIGATION RULES
10.1 Rule

All navigation MUST preserve:

libraryId must persist through every route transition
10.2 Examples
/dashboard?libraryId=X
/drilldown/logoMissing?libraryId=X
11. DEBUG RULES
11.1 Allowed logs
library resolution
cache fetch
label resolution mapping
11.2 Forbidden logs

❌ Do NOT log:

raw UI render trees
sensitive cache contents in production
full filesystem paths in UI context
12. DESIGN INTENT

This UI system enforces:

human-first labeling
zero raw key leakage
consistent navigation identity
predictable breadcrumb + title sync
stable visual identity per library
13. SUMMARY RULE
If a user can see it, it must be human-readable