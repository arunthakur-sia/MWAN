"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface AlertItem {
  id: string;
  carrierId: string;
  companyName: string;
  licenseNumber: string;
  alertType: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  titleEn: string;
  descriptionEn: string;
  isRead: boolean;
  createdAt: string;
}

export function useAlerts(params: { unreadOnly?: boolean; severity?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.unreadOnly) query.set("unreadOnly", "true");
  if (params.severity) query.set("severity", params.severity);
  if (params.search) query.set("search", params.search);

  const { data, error, isLoading, mutate } = useSWR<{ alerts: AlertItem[] }>(
    `/api/alerts?${query.toString()}`,
    fetcher,
    { refreshInterval: 30000 },
  );
  return { data, error, isLoading, mutate };
}
