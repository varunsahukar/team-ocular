"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SpendingChartProps {
  data: { date: string; amount: number }[];
}

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SpendingChart({ data }: SpendingChartProps) {
  const totalSpent = data.reduce((total, day) => total + day.amount, 0);
  const averageSpend = totalSpent / Math.max(data.length, 1);
  const hasSpending = data.some((day) => day.amount > 0);
  const highestDay = data.reduce(
    (current, day) => (day.amount > current.amount ? day : current),
    data[0] ?? { date: "-", amount: 0 }
  );

  return (
    <section className="surface-panel overflow-hidden py-0 glass-card hover-glow">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label text-white/20">7-day spend</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-[2rem]">
              Spending this week
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/40">
              A simple view of the last 7 days, so you can spot spikes quickly.
            </p>
          </div>

          <div className="grid gap-3 sm:min-w-[320px] sm:grid-cols-2">
            <ChartStat label="Total" value={compactCurrencyFormatter.format(totalSpent)} />
            <ChartStat label="Highest day" value={`${highestDay.date} · ${compactCurrencyFormatter.format(highestDay.amount)}`} />
          </div>
        </div>
      </div>

      <div className="p-4 pt-5 sm:p-6 sm:pt-6">
        {hasSpending ? (
          <div className="h-[340px] w-full rounded-[1.5rem] bg-black/20 p-3 sm:p-5">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 10"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "rgba(255,255,255,0.44)", fontSize: 12 }}
                  tickFormatter={(value: number) => compactCurrencyFormatter.format(value)}
                  tickLine={false}
                  width={60}
                />
                <ReferenceLine
                  ifOverflow="extendDomain"
                  label={{
                    value: "Average",
                    fill: "rgba(255,255,255,0.34)",
                    fontSize: 11,
                    position: "insideTopRight",
                  }}
                  stroke="rgba(255,255,255,0.22)"
                  strokeDasharray="4 6"
                  y={averageSpend}
                />
                <Tooltip
                  content={<SpendingTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="amount"
                  fill="var(--stock-green)"
                  opacity={0.4}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  activeDot={{
                    r: 5,
                    stroke: "var(--stock-green)",
                    strokeWidth: 2,
                    fill: "#000",
                  }}
                  dataKey="amount"
                  dot={false}
                  stroke="var(--stock-green)"
                  strokeWidth={2}
                  type="monotone"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[340px] flex-col items-center justify-center rounded-[1.5rem] bg-black/20 px-6 text-center">
            <p className="text-sm font-medium text-white/76">No spend recorded yet</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/52">
              Once transactions start flowing in, this chart will show a clean 7-day trend here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ChartStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.025] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function SpendingTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = typeof payload[0]?.value === "number" ? payload[0].value : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/95 px-4 py-3 backdrop-blur-xl">
      <p className="text-xs text-white/44">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{currencyFormatter.format(value)}</p>
    </div>
  );
}
