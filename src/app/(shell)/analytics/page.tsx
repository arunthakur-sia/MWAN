"use client";
import useSWR from "swr";
import { StatCard } from "@/components/shared/StatCard";
import { RetrainButton } from "@/components/analytics/RetrainButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardFlush } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { LocalizedDateTime } from "@/components/shared/LocalizedDate";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Metrics {
  active: {
    version: string;
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    f1Score: number | null;
    aucRoc: number | null;
    trainingSamples: number | null;
    trainedAt: string;
  } | null;
  history: { version: string; accuracy: number | null; trainedAt: string; isActive: boolean }[];
}

function pct(v: number | null) {
  return v == null ? "—" : `${(v * 100).toFixed(1)}%`;
}

export default function AnalyticsPage() {
  const { data, mutate } = useSWR<Metrics>("/api/ml/metrics", fetcher);
  const { t, locale } = useLocale();
  const active = data?.active;

  return (
    <div className="space-y-3">
      <PageHeader
        title={t("analytics.title")}
        subtitle={t("analytics.subtitle")}
        action={<RetrainButton onDone={() => mutate()} />}
      />

      {!active && (
        <Card>
          <EmptyState>{t("analytics.noModelYet")}</EmptyState>
        </Card>
      )}

      {active && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("analytics.accuracy")} value={pct(active.accuracy)} />
            <StatCard label={t("analytics.precision")} value={pct(active.precision)} />
            <StatCard label={t("analytics.recall")} value={pct(active.recall)} />
            <StatCard label={t("analytics.aucRoc")} value={pct(active.aucRoc)} />
          </div>

          {/* CardFlush, not Card: the table must bleed to the card edge and own
              its own cell padding (see Card.tsx's docblock on why a table in a
              padded Card is wrong, not a matter of taste). CardHeader is built
              for a padded card, so it gets its own p-5 pb-0 wrapper here instead
              of living inside CardFlush's unpadded body. */}
          <CardFlush>
            <div className="p-5 pb-0">
              <CardHeader title={t("analytics.versionHistory")} />
            </div>
            <Table>
              <Thead>
                <Th>{t("analytics.version")}</Th>
                <Th>{t("analytics.accuracy")}</Th>
                <Th>{t("analytics.trainedAt")}</Th>
              </Thead>
              <Tbody>
                {data?.history.map((h, i) => (
                  <Tr key={i}>
                    {/* Not <Td num>: this cell mixes the version number with a
                        text chip. Td num's font-mono + dir="ltr" would leak
                        onto the chip's Arabic label, so the digit run is
                        isolated by hand and the chip stays outside it. */}
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        <span dir="ltr" className="font-mono tabular-nums">
                          {h.version}
                        </span>
                        {h.isActive && (
                          <span className="rounded-control bg-surface-sunken px-2 py-0.5 text-caption font-medium text-forest">
                            {t("analytics.active")}
                          </span>
                        )}
                      </span>
                    </Td>
                    <Td num>{pct(h.accuracy)}</Td>
                    <Td num>
                      <LocalizedDateTime value={h.trainedAt} locale={locale} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardFlush>
        </>
      )}
    </div>
  );
}
