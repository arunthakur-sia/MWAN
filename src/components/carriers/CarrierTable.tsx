"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useCarriers } from "@/hooks/useCarriers";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { CardFlush } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Table, Thead, Th, Tbody, Tr, Td, TdEmpty } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type RiskFilter = "" | "HIGH" | "MEDIUM" | "LOW";

export function CarrierTable() {
  const [search, setSearch] = useState("");
  const [riskTier, setRiskTier] = useState<RiskFilter>("");
  const [page, setPage] = useState(1);
  const limit = 25;
  const { t } = useLocale();

  const RISK_FILTERS = [
    { value: "" as RiskFilter, label: t("common.all") },
    { value: "HIGH" as RiskFilter, label: t("common.riskHigh") },
    { value: "MEDIUM" as RiskFilter, label: t("common.riskMedium") },
    { value: "LOW" as RiskFilter, label: t("common.riskLow") },
  ];

  const { data, isLoading } = useCarriers({ page, limit, riskTier: riskTier || undefined, search: search || undefined });
  const carriers = data?.carriers ?? [];
  const total = data?.total ?? 0;

  return (
    <CardFlush>
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-muted" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("carriers.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <SegmentedControl
          name="risk"
          value={riskTier}
          onChange={(v) => {
            setRiskTier(v);
            setPage(1);
          }}
          options={RISK_FILTERS}
        />
      </div>

      <Table>
        <Thead>
          <Th>{t("carriers.company")}</Th>
          <Th>{t("carriers.licenseNumber")}</Th>
          <Th>{t("carriers.declared")}</Th>
          <Th>{t("carriers.actual")}</Th>
          <Th>{t("carriers.gap")}</Th>
          <Th>{t("carriers.score")}</Th>
          <Th>{t("carriers.risk")}</Th>
        </Thead>
        <Tbody>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Tr key={i}>
                <Td>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-20" />
                </Td>
                <Td num>
                  <Skeleton className="h-4 w-16" />
                </Td>
                <Td num>
                  <Skeleton className="h-4 w-8" />
                </Td>
                <Td num>
                  <Skeleton className="h-4 w-8" />
                </Td>
                <Td num>
                  <Skeleton className="h-4 w-8" />
                </Td>
                <Td num>
                  <Skeleton className="h-4 w-8" />
                </Td>
                <Td>
                  <Skeleton className="h-5 w-14 rounded-control" />
                </Td>
              </Tr>
            ))}
          {!isLoading && carriers.length === 0 && <TdEmpty colSpan={7}>{t("common.noResults")}</TdEmpty>}
          {carriers.map((c) => (
            <Tr key={c.id}>
              <Td>
                <Link href={`/carriers/${c.id}`} className="font-medium text-ink hover:text-forest">
                  <bdi>{c.companyName}</bdi>
                </Link>
                <div className="text-caption text-ink-muted">
                  <bdi>{c.city}</bdi>
                </div>
              </Td>
              <Td num>{c.licenseNumber}</Td>
              <Td num>{c.declaredFleet}</Td>
              <Td num>{c.actualFleet}</Td>
              <Td num>
                <span className={c.fleetGap > 0 ? "text-risk-high font-semibold" : "text-ink-muted"}>
                  {c.fleetGap > 0 ? `+${c.fleetGap}` : c.fleetGap}
                </span>
              </Td>
              <Td num>{c.score ? c.score.overallScore.toFixed(0) : "—"}</Td>
              <Td>{c.score ? <RiskBadge tier={c.score.riskTier} /> : "—"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border text-body text-ink-muted">
        <span>
          <span dir="ltr" className="font-mono tabular-nums">
            {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}
          </span>{" "}
          {t("common.of")}{" "}
          <span dir="ltr" className="font-mono tabular-nums">
            {total}
          </span>
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            {t("common.previous")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
            disabled={page * limit >= total}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </CardFlush>
  );
}
