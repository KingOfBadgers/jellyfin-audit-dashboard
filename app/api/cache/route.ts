import { NextResponse } from "next/server";
import { readAuditSummary } from "@/lib/cache/auditCache";

export async function GET() {
  try {
    const cache = await readAuditSummary();

    if (!cache) {
      return NextResponse.json({
        cacheExists: false,
      });
    }

    const { summary, generatedAt, movieCount, scanDurationMs } = cache;

    return NextResponse.json({
      cacheExists: true,

      primaryMissing: summary.primaryMissing,
      logoMissing: summary.logoMissing,
      thumbMissing: summary.thumbMissing,
      bannerMissing: summary.bannerMissing,
      discMissing: summary.discMissing,

      backdropBuckets: summary.backdropBuckets,

      generatedAt,
      movieCount,
      scanDurationMs,
    });
  } catch (e) {
    return NextResponse.json({
      cacheExists: false,
      error: "CACHE_READ_FAILED",
    });
  }
}