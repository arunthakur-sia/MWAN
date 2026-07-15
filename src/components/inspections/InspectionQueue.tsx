"use client";
import { useState } from "react";
import Link from "next/link";
import { useInspections } from "@/hooks/useInspections";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { CardFlush } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Table, Thead, Th, Tbody, Tr, Td, TdEmpty } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function InspectionQueue() {
  const [status, setStatus] = useState("SCHEDULED");
  const { data, isLoading } = useInspections(status || undefined);
  const { t, locale } = useLocale();
  const inspections = data?.inspections ?? [];

  const STATUS_FILTERS = [
    { value: "SCHEDULED", label: t("inspections.filterScheduled") },
    { value: "COMPLETED", label: t("inspections.filterCompleted") },
    { value: "", label: t("common.all") },
  ] as const;

  const STATUS_LABELS: Record<string, string> = {
    SCHEDULED: t("inspections.statusScheduled"),
    IN_PROGRESS: t("inspections.statusInProgress"),
    COMPLETED: t("inspections.statusCompleted"),
    CANCELLED: t("inspections.statusCancelled"),
  };

  return (
    <CardFlush>
      <div className="flex gap-1 p-4 border-b border-border">
        <SegmentedControl name="status" value={status} onChange={setStatus} options={STATUS_FILTERS} />
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
                    <bdi>{i.companyName}</bdi>
                  </Link>
                  <div className="text-caption text-ink-muted">
                    <span dir="ltr" className="font-mono tabular-nums">
                      {i.licenseNumber}
                    </span>
                  </div>
                </Td>
                <Td num>{new Date(i.scheduledDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</Td>
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
