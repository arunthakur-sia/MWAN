const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export interface PredictionResult {
  carrier_id: string;
  probability: number;
  risk_tier: "HIGH" | "MEDIUM" | "LOW";
  top_factors: { feature: string; impact: number }[];
}

export interface NetworkResult {
  network_id: string;
  primary_owner_id: string;
  member_company_ids: string[];
  member_count: number;
  connection_strength: number;
}

async function callMlService<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ML_SERVICE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ML service ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

export function runPredictions(horizonMonths = 12) {
  return callMlService<{ predictions: PredictionResult[]; model_version: string }>("/predict", {
    body: JSON.stringify({ mode: "batch", horizon_months: horizonMonths }),
  });
}

export function detectNetworks() {
  return callMlService<{ networks_detected: number; networks: NetworkResult[] }>("/detect-networks");
}

export function retrainModel() {
  return callMlService<{
    status: string;
    training_samples?: number;
    positive_samples?: number;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    auc_roc?: number;
  }>("/retrain");
}
