"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface NetworkListItem {
  id: string;
  networkName: string | null;
  primaryOwnerName: string;
  primaryOwnerNameEn: string;
  memberCount: number;
  totalDeclared: number;
  totalActual: number;
  combinedGap: number;
  sharedAddress: string | null;
  sharedAddressEn: string | null;
  members: { id: string; companyName: string; companyNameEn: string }[];
}

export function useNetworks(params: { search?: string; gapStatus?: "under" | "over" | "correct" } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.gapStatus) query.set("gapStatus", params.gapStatus);

  const { data, error, isLoading, mutate } = useSWR<{ networks: NetworkListItem[] }>(
    `/api/networks?${query.toString()}`,
    fetcher,
  );
  return { data, error, isLoading, mutate };
}
