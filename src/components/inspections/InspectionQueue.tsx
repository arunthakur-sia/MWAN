"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useInspections } from "@/hooks/useInspections";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { CardFlush } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Table, Thead, Th, Tbody, Tr, Td, TdEmpty } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { LocalizedDate } from "@/components/shared/LocalizedDate";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeField } from "@/lib/i18n/localizeField";

type RiskFilter = "" | "HIGH" | "MEDIUM" | "LOW";

export function InspectionQueue() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("SCHEDULED");
  const [riskTier, setRiskTier] = useState<RiskFilter>("");
  const { data, isLoading } = useInspections({
    status: status || undefined,
    riskTier: riskTier || undefined,
    search: search || undefined,
  });
  const { t, locale } = useLocale();
  const inspections = data?.inspections ?? [];

  const STATUS_FILTERS = [
    { value: "", label: t("common.all") },
    { value: "SCHEDULED", label: t("inspections.filterScheduled") },
    { value: "IN_PROGRESS", label: t("inspections.statusInProgress") },
    { value: "COMPLETED", label: t("inspections.filterCompleted") },
    { value: "CANCELLED", label: t("inspections.statusCancelled") },
  ] as const;

  const RISK_FILTERS = [
    { value: "" as RiskFilter, label: t("common.all") },
    { value: "HIGH" as RiskFilter, label: t("common.riskHigh") },
    { value: "MEDIUM" as RiskFilter, label: t("common.riskMedium") },
    { value: "LOW" as RiskFilter, label: t("common.riskLow") },
  ];

  const STATUS_LABELS: Record<string, string> = {
    SCHEDULED: t("inspections.statusScheduled"),
    IN_PROGRESS: t("inspections.statusInProgress"),
    COMPLETED: t("inspections.statusCompleted"),
    CANCELLED: t("inspections.statusCancelled"),
  };

  return (
    <CardFlush>
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("inspections.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <SegmentedControl name="status" value={status} onChange={setStatus} options={STATUS_FILTERS} />
        <SegmentedControl name="risk" value={riskTier} onChange={setRiskTier} options={RISK_FILTERS} />
      </div>

      <Table>
        <Thead>
          <Th>{t("inspections.company")}</Th>
          <Th>{t("inspections.scheduledDate")}</Th>
          <Th>{t("inspections.inspector")}</Th>
          <Th>{t("inspections.status")}</Th>
          <Th>{t("inspections.score")}</Th>
          <Th>{t("inspections.risk")}</Th>
        </Thead>
        <Tbody>
          {/* Skeleton rows mirror the real row geometry — company name + license
              sub-line, a mono date, a plain name, a status word, a mono score,
              a badge-shaped chip — so the panel does not jump when data lands. */}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Tr key={i}>
                <Td>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-20" />
                </Td>
                <Td num>
                  <Skeleton className="h-4 w-16" />
                </Td>
                <Td>
                  <Skeleton className="h-4 w-24" />
                </Td>
                <Td>
                  <Skeleton className="h-4 w-20" />
                </Td>
                <Td num>
                  <Skeleton className="h-4 w-8" />
                </Td>
                <Td>
                  <Skeleton className="h-5 w-14 rounded-control" />
                </Td>
              </Tr>
            ))}

          {!isLoading && inspections.length === 0 && (
            <TdEmpty colSpan={6}>{t("inspections.noInspections")}</TdEmpty>
          )}

          {!isLoading &&
            inspections.map((i) => (
              <Tr key={i.id}>
                <Td>
                  <Link href={`/inspections/${i.id}`} className="font-medium text-ink hover:text-forest">
                    {/* <bdi> isolates the company name: it is Arabic DATA that
                        renders inside a possibly-English UI, and without
                        isolation the bidi algorithm lets it reorder against the
                        surrounding run. */}
                    <bdi>{localizeField(locale, i.companyName, i.companyNameEn)}</bdi>
                  </Link>
                  <div className="text-caption text-ink-muted">
                    <span dir="ltr" className="font-mono tabular-nums">
                      {i.licenseNumber}
                    </span>
                  </div>
                </Td>
                <Td num>
                  <LocalizedDate value={i.scheduledDate} locale={locale} />
                </Td>
                <Td>{i.inspectorName ?? "—"}</Td>
                <Td>{STATUS_LABELS[i.status]}</Td>
                <Td num>{i.overallScore != null ? i.overallScore.toFixed(0) : "—"}</Td>
                <Td>{i.riskTier ? <RiskBadge tier={i.riskTier} /> : "—"}</Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </CardFlush>
  );
}
