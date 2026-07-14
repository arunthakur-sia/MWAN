import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const versions = await prisma.modelVersion.findMany({
    orderBy: { trainedAt: "desc" },
    take: 20,
  });

  const active = versions.find((v) => v.isActive) ?? versions[0] ?? null;

  return NextResponse.json({
    active: active
      ? {
          version: active.version,
          accuracy: active.accuracy != null ? Number(active.accuracy) : null,
          precision: active.precision_ != null ? Number(active.precision_) : null,
          recall: active.recall != null ? Number(active.recall) : null,
          f1Score: active.f1Score != null ? Number(active.f1Score) : null,
          aucRoc: active.aucRoc != null ? Number(active.aucRoc) : null,
          trainingSamples: active.trainingSamples,
          trainedAt: active.trainedAt,
        }
      : null,
    history: versions.map((v) => ({
      version: v.version,
      accuracy: v.accuracy != null ? Number(v.accuracy) : null,
      trainingSamples: v.trainingSamples,
      trainedAt: v.trainedAt,
      isActive: v.isActive,
    })),
  });
}
