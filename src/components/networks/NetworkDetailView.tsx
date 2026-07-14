"use client";
import Link from "next/link";
import { NetworkGraph } from "@/components/networks/NetworkGraph";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
    <div className="space-y-6">
      <div>
        <Link href="/networks" className="text-sm text-mwan-green hover:underline">
          ← {t("networkDetail.back")}
        </Link>
        <h1 className="text-2xl font-semibold text-mwan-charcoal mt-1">{data.primaryOwnerName}</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono" dir="ltr">
          {data.networkName}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("networkDetail.companiesCount")}</p>
          <p className="text-xl font-bold font-mono" dir="ltr">
            {data.memberCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("networkDetail.totalDeclared")}</p>
          <p className="text-xl font-bold font-mono" dir="ltr">
            {data.totalDeclared}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("networkDetail.totalActual")}</p>
          <p className="text-xl font-bold font-mono" dir="ltr">
            {data.totalActual}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("networkDetail.combinedGap")}</p>
          <p className={`text-xl font-bold font-mono ${data.combinedGap > 0 ? "text-risk-high" : ""}`} dir="ltr">
            {data.combinedGap > 0 ? `+${data.combinedGap}` : data.combinedGap}
          </p>
        </div>
      </div>

      <NetworkGraph nodes={data.nodes} links={data.links} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("networkDetail.companiesInNetwork")}</h3>
        <ul className="divide-y divide-gray-100">
          {data.members.map((m) => (
            <li key={m.id} className="py-3 flex items-center justify-between">
              <Link href={`/carriers/${m.carrierId}`} className="hover:text-mwan-green">
                {m.companyName}
              </Link>
              <span className="text-sm text-gray-500 font-mono" dir="ltr">
                {m.declaredFleetSize} {t("networkDetail.declaredVehiclesSuffix")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
