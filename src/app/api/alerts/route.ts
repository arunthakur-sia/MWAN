import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { RISK_TIER_ORDER } from "@/lib/utils/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const alerts = await prisma.alert.findMany({
    where: {
      isDismissed: false,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    include: { carrier: { select: { companyName: true, licenseNumber: true } } },
    orderBy: { createdAt: "desc" },
  });

  alerts.sort((a, b) => {
    const severityDiff = RISK_TIER_ORDER[a.severity] - RISK_TIER_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return NextResponse.json({
    alerts: alerts.slice(0, 100).map((a) => ({
      id: a.id,
      carrierId: a.carrierId,
      companyName: a.carrier.companyName,
      licenseNumber: a.carrier.licenseNumber,
      alertType: a.alertType,
      severity: a.severity,
      title: a.title,
      description: a.description,
      titleEn: a.titleEn ?? a.title,
      descriptionEn: a.descriptionEn ?? a.description,
      isRead: a.isRead,
      createdAt: a.createdAt,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, isRead, isDismissed } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const alert = await prisma.alert.update({
    where: { id },
    data: {
      ...(typeof isRead === "boolean" ? { isRead } : {}),
      ...(typeof isDismissed === "boolean" ? { isDismissed } : {}),
    },
  });

  return NextResponse.json({ alert });
}
