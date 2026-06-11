import { NextResponse } from "next/server";
import { JellyfinClient } from "@/lib/jellyfin/client";

export async function GET() {
  const client = new JellyfinClient(
    process.env.JELLYFIN_URL!,
    process.env.JELLYFIN_API_KEY!
  );

  const libraries = await client.getLibraries?.();

  return NextResponse.json({
    items: libraries || [],
  });
}