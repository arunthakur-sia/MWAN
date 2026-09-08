"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface InspectionQueueItem {
  id: string;
  carrierId: string;
  companyName: string;
  companyNameEn: string;
  licenseNumber: string;
  city: string | null;
  cityEn: string | null;
  region: string | null;
  regionEn: string | null;
  scheduledDate: string;
  inspectorName: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  outcome: string | null;
  overallScore: number | null;
  riskTier: "HIGH" | "MEDIUM" | "LOW" | null;
}

export function useInspections(
  params: { status?: string; riskTier?: string; region?: string; search?: string } = {},
) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.riskTier) query.set("riskTier", params.riskTier);
  if (params.region) query.set("region", params.region);
  if (params.search) query.set("search", params.search);

  const { data, error, isLoading, mutate } = useSWR<{ inspections: InspectionQueueItem[] }>(
    `/api/inspections?${query.toString()}`,
    fetcher,
  );
  return { data, error, isLoading, mutate };
}
