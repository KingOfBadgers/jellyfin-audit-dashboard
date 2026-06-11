import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

const SUMMARY_FILE = path.join(DATA_DIR, "audit-summary.json");
const GROUPS_FILE = path.join(DATA_DIR, "audit-groups.json");

export async function writeAuditCache(payload: any) {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const summaryPayload = {
    generatedAt: payload.generatedAt,
    movieCount: payload.movieCount,
    scanDurationMs: payload.scanDurationMs,
    summary: payload.summary,
  };

  const groupsPayload = {
    groups: payload.groups,
  };

  await fs.writeFile(
    SUMMARY_FILE,
    JSON.stringify(summaryPayload, null, 2),
    "utf8"
  );

  await fs.writeFile(
    GROUPS_FILE,
    JSON.stringify(groupsPayload, null, 2),
    "utf8"
  );
}

export async function readAuditSummary() {
  try {
    const raw = await fs.readFile(SUMMARY_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function readAuditGroups() {
  try {
    const raw = await fs.readFile(GROUPS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}