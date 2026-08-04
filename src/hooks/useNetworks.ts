"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface NetworkListItem {
  id: string;
  networkName: string | null;
  primaryOwnerName: string;
  memberCount: number;
  totalDeclared: number;
  totalActual: number;
  combinedGap: number;
  sharedAddress: string | null;
  members: { id: string; companyName: string }[];
}

export function useNetworks(params: { search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);

  const { data, error, isLoading, mutate } = useSWR<{ networks: NetworkListItem[] }>(
    `/api/networks?${query.toString()}`,
    fetcher,
  );
  return { data, error, isLoading, mutate };
}
