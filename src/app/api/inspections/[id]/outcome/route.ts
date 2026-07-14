import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { outcome, actualFleetSize, notes } = body;

  if (!outcome) {
    return NextResponse.json({ error: "outcome is required" }, { status: 400 });
  }

  const inspection = await prisma.inspection.update({
    where: { id },
    data: {
      status: "COMPLETED",
      outcome,
      actualFleetSize: actualFleetSize ?? null,
      notes: notes ?? null,
      completedAt: new Date(),
    },
  });

  // Confirmed under-declaration corrects the carrier's declared fleet size,
  // closing the loop that /api/ml/retrain later learns from.
  if (outcome === "CONFIRMED_UNDER_DECLARATION" && actualFleetSize) {
    await prisma.carrier.update({
      where: { id: inspection.carrierId },
      data: { declaredFleetSize: actualFleetSize },
    });
  }

  return NextResponse.json({ inspection });
}
