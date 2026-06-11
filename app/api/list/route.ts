import { NextResponse } from "next/server";
import { readAuditGroups } from "@/lib/cache/auditCache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "primaryMissing";

  const cache = await readAuditGroups();

  if (!cache) {
    return NextResponse.json(
      { error: "No audit cache found" },
      { status: 404 }
    );
  }

  const groups = cache.groups;

  const items = (groups[type] || []).map((i: any) => ({
    id: i.Id,
    title: i.Name,
    backdropCount: i.BackdropImageTags?.length ?? 0,
  }));

  return NextResponse.json({
    count: items.length,
    items,
  });
}