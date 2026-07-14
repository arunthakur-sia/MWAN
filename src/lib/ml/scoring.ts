import { SCORE_WEIGHTS, scoreToRiskTier } from "@/lib/utils/constants";

export function fleetGapToScore(gapPct: number): number {
  // 0% gap -> 0, 50%+ gap -> 100
  return Math.max(0, Math.min(100, gapPct * 2));
}

export function networkToScore(memberCount: number, combinedGap: number): number {
  if (memberCount < 2) return 0;
  const memberScore = Math.min(60, (memberCount - 1) * 15);
  const gapScore = Math.min(40, combinedGap * 2);
  return Math.min(100, memberScore + gapScore);
}

export function computeCompositeScore(params: {
  fleetGapScore: number;
  predictionScore: number;
  networkRiskScore: number;
}) {
  const overallScore =
    params.fleetGapScore * SCORE_WEIGHTS.fleetGap +
    params.predictionScore * SCORE_WEIGHTS.prediction +
    params.networkRiskScore * SCORE_WEIGHTS.network;

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    riskTier: scoreToRiskTier(overallScore),
  };
}
