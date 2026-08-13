"use client";
import Link from "next/link";
import { NetworkGraph } from "@/components/networks/NetworkGraph";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PageHeader, BackLink } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { StatCard } from "@/components/shared/StatCard";

export interface NetworkDetailData {
  id: string;
  networkName: string | null;
  primaryOwnerName: string;
  memberCount: number;
  totalDeclared: number;
  totalActual: number;
  combinedGap: number;
  members: { id: string; carrierId: string; companyName: string; declaredFleetSize: number }[];
  nodes: { id: string; type: "company" | "person"; label: string }[];
  links: { source: string; target: string; relation: string; weight: number }[];
}

export function NetworkDetailView({ data }: { data: NetworkDetailData }) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <PageHeader
        /* <bdi>: an owner's name is Arabic DATA that renders inside an English UI
           when locale=en, and without isolation the bidi algorithm reorders it
           against the surrounding run. Possible now that title takes a ReactNode. */
        title={<bdi>{data.primaryOwnerName}</bdi>}
        back={
          <Link href="/networks">
            <BackLink>{t("networkDetail.back")}</BackLink>
          </Link>
        }
        meta={
          <bdi>
            <span dir="ltr" className="font-mono">
              {data.networkName}
            </span>
          </bdi>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t("networkDetail.companiesCount")} value={data.memberCount} />
        <StatCard label={t("networkDetail.totalDeclared")} value={data.totalDeclared} />
        <StatCard label={t("networkDetail.totalActual")} value={data.totalActual} />
        <StatCard
          label={
            data.combinedGap > 0
              ? t("networkDetail.underdeclared")
              : data.combinedGap < 0
                ? t("networkDetail.overdeclared")
                : t("networkDetail.noGap")
          }
          value={`${Math.abs(data.combinedGap).toLocaleString("en-US")} ${Math.abs(data.combinedGap) === 1 ? t("networkDetail.vehicle") : t("networkDetail.vehicles")}`}
          tone={data.combinedGap > 0 ? "high" : "default"}
        />
      </div>

      <NetworkGraph nodes={data.nodes} links={data.links} />

      <Card>
        <CardHeader title={t("networkDetail.companiesInNetwork")} />
        <ul className="divide-y divide-border">
          {data.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3">
              <Link href={`/carriers/${m.carrierId}`} className="text-body text-ink hover:text-forest">
                <bdi>{m.companyName}</bdi>
              </Link>
              <span dir="ltr" className="font-mono text-caption tabular-nums text-ink-muted">
                {m.declaredFleetSize.toLocaleString("en-US")} {t("networkDetail.declaredVehiclesSuffix")}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
