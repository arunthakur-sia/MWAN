import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "high" | "medium" | "low";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-mwan-green/10 text-mwan-green",
    high: "bg-risk-high/10 text-risk-high",
    medium: "bg-risk-medium/10 text-amber-700",
    low: "bg-mwan-green/10 text-mwan-green-dark",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${toneClasses[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-mwan-charcoal" dir="ltr">
          {value}
        </p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
