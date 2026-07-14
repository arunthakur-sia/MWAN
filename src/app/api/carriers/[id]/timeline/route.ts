import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const declarations = await prisma.declaration.findMany({
    where: { carrierId: id },
    orderBy: { declarationDate: "asc" },
    select: { period: true, declaredFleet: true, changeVsPrior: true, changeReason: true, declarationDate: true },
  });

  return NextResponse.json({
    declarations,
  });
}
