import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { retrainModel } from "@/lib/ml/client";

export const maxDuration = 60;

export async function POST() {
  const result = await retrainModel();

  if (result.status !== "retrained") {
    return NextResponse.json(result);
  }

  const priorCount = await prisma.modelVersion.count({ where: { modelType: "PREDICTION" } });
  await prisma.modelVersion.updateMany({
    where: { modelType: "PREDICTION", isActive: true },
    data: { isActive: false },
  });

  const modelVersion = await prisma.modelVersion.create({
    data: {
      id: randomUUID(),
      modelType: "PREDICTION",
      version: `v1.${priorCount}`,
      accuracy: result.accuracy ?? null,
      precision_: result.precision ?? null,
      recall: result.recall ?? null,
      f1Score: result.f1 ?? null,
      aucRoc: result.auc_roc ?? null,
      trainingSamples: result.training_samples ?? null,
      isActive: true,
    },
  });

  return NextResponse.json({ ...result, modelVersion });
}
