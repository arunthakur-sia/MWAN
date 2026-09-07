import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const rows = await prisma.carrier.findMany({
    where: { region: { not: null } },
    select: { region: true, regionEn: true },
    distinct: ["region"],
    orderBy: { region: "asc" },
  });

  const regions = rows.map((r) => ({ region: r.region as string, regionEn: r.regionEn ?? r.region }));

  return NextResponse.json({ regions });
}
