"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface CarrierListItem {
  id: string;
  licenseNumber: string;
  companyName: string;
  companyNameEn: string;
  companyId: string;
  declaredFleet: number;
  actualFleet: number;
  fleetGap: number;
  licenseStatus: string;
  city: string | null;
  cityEn: string | null;
  region: string | null;
  regionEn: string | null;
  score: { overallScore: number; riskTier: "HIGH" | "MEDIUM" | "LOW"; computedAt: string } | null;
}

export function useCarriers(
  params: {
    page?: number;
    limit?: number;
    riskTier?: string;
    licenseStatus?: string;
    region?: string;
    search?: string;
  } = {},
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.riskTier) query.set("riskTier", params.riskTier);
  if (params.licenseStatus) query.set("licenseStatus", params.licenseStatus);
  if (params.region) query.set("region", params.region);
  if (params.search) query.set("search", params.search);

  const { data, error, isLoading, mutate } = useSWR<{
    carriers: CarrierListItem[];
    total: number;
    page: number;
    limit: number;
  }>(`/api/carriers?${query.toString()}`, fetcher);

  return { data, error, isLoading, mutate };
}

export function useCarrierRegions() {
  const { data, error, isLoading } = useSWR<{ regions: { region: string; regionEn: string }[] }>(
    "/api/carriers/regions",
    fetcher,
  );

  return { regions: data?.regions ?? [], error, isLoading };
}
