import cron from "node-cron";
import { JellyfinClient } from "@/lib/jellyfin/client";
import { buildMissingIndex } from "@/lib/compute/missing";
import { writeAuditCache } from "@/lib/cache/auditCache";

async function runScan() {
  console.log("[SCAN] Starting Jellyfin audit...");

  const client = new JellyfinClient(
    process.env.JELLYFIN_URL!,
    process.env.JELLYFIN_API_KEY!
  );

  const data = await client.getMovies(
    process.env.JELLYFIN_USER_ID!
  );

  const { summary, groups } = buildMissingIndex(
    data.Items
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    movieCount: data.Items.length,
    scanDurationMs: Date.now(),
    summary,
    groups,
  };

  await writeAuditCache(payload);

  console.log("[SCAN] Completed");
}

// run at 03:00 AM every night
cron.schedule("0 3 * * *", runScan);

// also run once on startup
runScan();