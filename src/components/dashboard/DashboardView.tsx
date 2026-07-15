"use client";
import { Truck, AlertTriangle, Network as NetworkIcon, ClipboardList } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { RunPipelineButtons } from "@/components/dashboard/RunPipelineButtons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface DashboardStats {
  totalCarriers: number;
  riskCounts: { HIGH: number; MEDIUM: number; LOW: number };
  unreadAlerts: number;
  scheduledInspections: number;
  networksDetected: number;
  carriersWithGap: number;
  inspectionsSinceLastPrediction: number;
}

export function DashboardView({ stats }: { stats: DashboardStats }) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-mwan-charcoal">{t("dashboard.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <RunPipelineButtons />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t("dashboard.totalCarriers")} value={stats.totalCarriers} icon={Truck} />
        <StatCard label={t("dashboard.highRisk")} value={stats.riskCounts.HIGH} icon={AlertTriangle} tone="high" />
        <StatCard
          label={t("dashboard.fleetGapDetected")}
          value={stats.carriersWithGap}
          icon={AlertTriangle}
          tone="medium"
        />
        <StatCard
          label={t("dashboard.scheduledInspections")}
          value={stats.scheduledInspections}
          icon={ClipboardList}
        />
        <StatCard label={t("dashboard.networksDetected")} value={stats.networksDetected} icon={NetworkIcon} />
        <StatCard
          label={t("dashboard.unreadAlerts")}
          value={stats.unreadAlerts}
          icon={AlertTriangle}
          tone="medium"
        />
        <StatCard
          label={t("dashboard.inspectionsSinceLastPrediction")}
          value={stats.inspectionsSinceLastPrediction}
          icon={ClipboardList}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart
          high={stats.riskCounts.HIGH}
          medium={stats.riskCounts.MEDIUM}
          low={stats.riskCounts.LOW}
        />
        <RecentAlerts />
      </div>
    </div>
  );
}
