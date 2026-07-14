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

export function useAlerts(unreadOnly = false) {
  const { data, error, isLoading, mutate } = useSWR<{ alerts: AlertItem[] }>(
    `/api/alerts${unreadOnly ? "?unreadOnly=true" : ""}`,
    fetcher,
    { refreshInterval: 30000 },
  );
  return { data, error, isLoading, mutate };
}
