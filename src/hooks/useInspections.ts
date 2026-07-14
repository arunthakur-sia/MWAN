"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface InspectionQueueItem {
  id: string;
  carrierId: string;
  companyName: string;
  licenseNumber: string;
  scheduledDate: string;
  inspectorName: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  outcome: string | null;
  overallScore: number | null;
  riskTier: "HIGH" | "MEDIUM" | "LOW" | null;
}

export function useInspections(status?: string) {
  const { data, error, isLoading, mutate } = useSWR<{ inspections: InspectionQueueItem[] }>(
    `/api/inspections${status ? `?status=${status}` : ""}`,
    fetcher,
  );
  return { data, error, isLoading, mutate };
}
