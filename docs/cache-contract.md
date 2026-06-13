JELLYFIN AUDIT — CACHE CONTRACT (STRICT SCHEMA)
VERSION

2026-06-13

1. PURPOSE

This document defines the strict schema contract for:

audit-summary.json

It ensures:

Dashboard consistency
Drilldown reliability
Backdrop distribution integrity
No runtime shape drift between scan → cache → UI
2. CORE PRINCIPLE
cache is a CONTRACT, not a flexible JSON blob

Any deviation from this schema is a breaking change.

3. FILE STRUCTURE
3.1 Location
/data/<libraryId>/audit-summary.json
3.2 Top-Level Shape
AuditSummary
REQUIRED FIELDS
{
  generatedAt: string;
  movieCount: number;
  scanDurationMs: number;

  summary: AuditSummaryMetrics;
}
4. SUMMARY SCHEMA (CORE METRICS)
4.1 Type Definition
type AuditSummaryMetrics = {
  primaryMissing: number;
  logoMissing: number;
  thumbMissing: number;
  bannerMissing: number;
  discMissing: number;

  backdropBuckets: BackdropBucketMap;
};
4.2 FIELD DEFINITIONS
primaryMissing
Missing primary artwork count
logoMissing
Missing logo assets
thumbMissing
Missing thumbnail assets
bannerMissing
Missing banner assets
discMissing
Missing disc images
5. BACKDROP BUCKET SYSTEM
5.1 REQUIRED STRUCTURE
type BackdropBucketMap = {
  "0": number;
  "1-5": number;
  "6-10": number;
  "11-20": number;
  "20+": number;
};
5.2 SEMANTICS
Bucket	Meaning
"0"	No backdrops present
"1-5"	Low coverage
"6-10"	Medium coverage
"11-20"	High coverage
"20+"	Excess / rich metadata libraries
5.3 CRITICAL RULE
ALL KEYS MUST EXIST EVEN IF VALUE IS 0
This guarantees:
stable UI rendering
no undefined access
no conditional bucket logic in frontend
6. FULL JSON EXAMPLE
{
  "generatedAt": "2026-06-13T10:00:00.000Z",
  "movieCount": 5586,
  "scanDurationMs": 12432,

  "summary": {
    "primaryMissing": 120,
    "logoMissing": 430,
    "thumbMissing": 210,
    "bannerMissing": 88,
    "discMissing": 300,

    "backdropBuckets": {
      "0": 40,
      "1-5": 1200,
      "6-10": 2400,
      "11-20": 1500,
      "20+": 446
    }
  }
}
7. PRODUCER CONTRACT (SCAN LAYER)
7.1 Source

File:

/app/api/scan/route.ts
7.2 Rule
ONLY buildMissingIndex() is allowed to generate summary object

No manual mutation allowed after:

const { summary, groups } = buildMissingIndex(items);
7.3 OUTPUT RULE
writeAuditCache({
  generatedAt,
  movieCount,
  scanDurationMs,
  summary,
  groups
}, libraryId);
8. CONSUMER CONTRACT (CACHE API)

File:

/app/api/cache/route.ts
8.1 Response Shape
{
  cacheExists: boolean;
  libraryId: string;

  primaryMissing: number;
  logoMissing: number;
  thumbMissing: number;
  bannerMissing: number;
  discMissing: number;

  backdropBuckets: BackdropBucketMap;

  generatedAt: string;
  movieCount: number;
  scanDurationMs: number;
}
8.2 FLATTENING RULE

Cache API MUST flatten:

summary.primaryMissing → primaryMissing
summary.backdropBuckets → backdropBuckets
9. FRONTEND CONTRACT
9.1 Dashboard expectations

File:

/app/dashboard/page.tsx

Must assume:

data.backdropBuckets is ALWAYS defined OR fallback-safe
9.2 SAFE ACCESS RULE

Frontend must ALWAYS use:

data.backdropBuckets?.["6-10"] ?? 0

Never:

data.backdropBuckets["6-10"]
10. VALIDATION RULES
10.1 SCAN OUTPUT VALIDATION

Before writing cache:

summary must exist
backdropBuckets must contain all keys
all values must be numbers
10.2 INVALID STATE EXAMPLES

❌ BAD:

"backdropBuckets": {
  "6-10": 42
}

Missing keys → BREAKS UI assumptions

11. VERSIONING RULE

Any change to:

bucket names
field names
flattening structure

MUST increment:

CACHE CONTRACT VERSION
12. FAILURE MODES
12.1 Missing keys

Effect:

UI shows 0 incorrectly OR crashes
12.2 Nested mismatch

Effect:

dashboard displays undefined values
12.3 Partial writes

Effect:

cache exists but dashboard incomplete
13. DESIGN INTENT

This contract ensures:

deterministic dashboards
zero UI defensive logic explosion
stable drilldown routing
predictable cache reads