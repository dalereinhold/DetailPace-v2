import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Car,
  Clock,
  Compass,
  Gauge,
  Layers,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { SERVICE_TYPE_COLORS, TYPE_COLORS, VEHICLE_TYPE_BAR_COLORS } from "@/lib/pace/colors"
import { VEHICLE_TYPES } from "@/lib/pace/intake"
import { SERVICE_TYPES } from "@/lib/pace/services"
import { useStats } from "@/lib/pace/stats"
import { formatDuration, formatSecondsToClock } from "@/lib/pace/vehicle"

interface PaceStatsProps {
  refreshTrigger: number
  onRefresh?: () => void
}

type ChartViewMode = "by-service" | "by-type" | "actual-vs-target"
type TimeUnit = "hours" | "minutes"

const chartConfig: ChartConfig = {
  New: {
    label: "New Vehicle",
    color: "oklch(0.65 0.18 220)",
  },
  Used: {
    label: "Used Vehicle",
    color: "oklch(0.72 0.16 55)",
  },
  Demo: {
    label: "Demo Vehicle",
    color: "oklch(0.65 0.22 300)",
  },
  target: {
    label: "Target Benchmark",
    color: "oklch(0.6 0.03 240)",
  },
  actual: {
    label: "Actual Avg",
    color: "oklch(0.65 0.17 155)",
  },
  "Full Detail": {
    label: "Full Detail",
    color: "oklch(0.65 0.18 220)",
  },
  "Ceramic Coating": {
    label: "Ceramic Coating",
    color: "oklch(0.65 0.22 300)",
  },
  "Quick Detail": {
    label: "Quick Detail",
    color: "oklch(0.72 0.16 55)",
  },
  "Delivery Prep": {
    label: "Delivery Prep",
    color: "oklch(0.65 0.22 25)",
  },
  "Full-Detail": {
    label: "Full Detail",
    color: "oklch(0.65 0.18 220)",
  },
  "Ceramic-Coating": {
    label: "Ceramic Coating",
    color: "oklch(0.65 0.22 300)",
  },
  "Quick-Detail": {
    label: "Quick Detail",
    color: "oklch(0.72 0.16 55)",
  },
  "Delivery-Prep": {
    label: "Delivery Prep",
    color: "oklch(0.65 0.22 25)",
  },
}

function secondsToUnit(seconds: number, unit: TimeUnit): number {
  if (seconds <= 0) return 0
  if (unit === "hours") {
    return Number((seconds / 3600).toFixed(2))
  }
  return Math.round(seconds / 60)
}

export default function PaceStats({ refreshTrigger, onRefresh }: PaceStatsProps) {
  const { stats, loading, error, refetch } = useStats(refreshTrigger)
  const [viewMode, setChartViewMode] = useState<ChartViewMode>("by-service")
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("hours")

  const lastUpdatedLabel = stats
    ? new Date(stats.lastUpdated).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null

  const overall = stats?.overall
  const totalFleet = stats ? VEHICLE_TYPES.reduce((sum, t) => sum + stats.totalByType[t], 0) : 0
  const totalProcessed = stats?.totalProcessed ?? 0

  // 1. Chart Data: Combined View By Service (X: Service, Bars: New, Used, Demo + Target)
  const byServiceChartData = useMemo(() => {
    if (!stats) return []
    return SERVICE_TYPES.map(s => {
      const newStats = stats.byTypeAndService.New?.[s.name]
      const usedStats = stats.byTypeAndService.Used?.[s.name]
      const demoStats = stats.byTypeAndService.Demo?.[s.name]
      const overallService = stats.byService[s.name]

      return {
        service: s.name,
        target: secondsToUnit(s.estimatedSeconds, timeUnit),
        targetRaw: s.estimatedSeconds,
        New: secondsToUnit(newStats?.avgSeconds ?? 0, timeUnit),
        NewCount: newStats?.count ?? 0,
        NewRaw: newStats?.avgSeconds ?? 0,
        Used: secondsToUnit(usedStats?.avgSeconds ?? 0, timeUnit),
        UsedCount: usedStats?.count ?? 0,
        UsedRaw: usedStats?.avgSeconds ?? 0,
        Demo: secondsToUnit(demoStats?.avgSeconds ?? 0, timeUnit),
        DemoCount: demoStats?.count ?? 0,
        DemoRaw: demoStats?.avgSeconds ?? 0,
        overallAvg: secondsToUnit(overallService?.avgSeconds ?? 0, timeUnit),
        overallAvgRaw: overallService?.avgSeconds ?? 0,
        overallCount: overallService?.count ?? 0,
      }
    })
  }, [stats, timeUnit])

  // 2. Chart Data: Combined View By Vehicle Type (X: Vehicle Type, Bars: Full Detail, Ceramic, Quick, Delivery Prep)
  const byTypeChartData = useMemo(() => {
    if (!stats) return []
    return VEHICLE_TYPES.map(type => {
      const typeData = stats.byTypeAndService[type]
      const typeOverall = stats.byType[type]

      return {
        type: `${type} Vehicles`,
        rawType: type,
        "Full Detail": secondsToUnit(typeData?.["Full Detail"]?.avgSeconds ?? 0, timeUnit),
        "Full Detail Raw": typeData?.["Full Detail"]?.avgSeconds ?? 0,
        "Full Detail Count": typeData?.["Full Detail"]?.count ?? 0,
        "Ceramic Coating": secondsToUnit(typeData?.["Ceramic Coating"]?.avgSeconds ?? 0, timeUnit),
        "Ceramic Coating Raw": typeData?.["Ceramic Coating"]?.avgSeconds ?? 0,
        "Ceramic Coating Count": typeData?.["Ceramic Coating"]?.count ?? 0,
        "Quick Detail": secondsToUnit(typeData?.["Quick Detail"]?.avgSeconds ?? 0, timeUnit),
        "Quick Detail Raw": typeData?.["Quick Detail"]?.avgSeconds ?? 0,
        "Quick Detail Count": typeData?.["Quick Detail"]?.count ?? 0,
        "Delivery Prep": secondsToUnit(typeData?.["Delivery Prep"]?.avgSeconds ?? 0, timeUnit),
        "Delivery Prep Raw": typeData?.["Delivery Prep"]?.avgSeconds ?? 0,
        "Delivery Prep Count": typeData?.["Delivery Prep"]?.count ?? 0,
        typeAvg: secondsToUnit(typeOverall?.avgSeconds ?? 0, timeUnit),
        typeTarget: secondsToUnit(typeOverall?.estimatedSeconds ?? 0, timeUnit),
        totalCount: typeOverall?.count ?? 0,
      }
    })
  }, [stats, timeUnit])

  // 3. Chart Data: Actual vs Target Benchmark comparison per Service
  const actualVsTargetData = useMemo(() => {
    if (!stats) return []
    return SERVICE_TYPES.map(s => {
      const serviceStats = stats.byService[s.name]
      const actualSec = serviceStats?.avgSeconds ?? 0
      const targetSec = s.estimatedSeconds
      const diffSec = actualSec > 0 ? actualSec - targetSec : 0
      const diffPct = actualSec > 0 && targetSec > 0 ? Math.round((diffSec / targetSec) * 100) : 0

      return {
        service: s.name,
        actual: secondsToUnit(actualSec, timeUnit),
        actualRaw: actualSec,
        target: secondsToUnit(targetSec, timeUnit),
        targetRaw: targetSec,
        count: serviceStats?.count ?? 0,
        diffSec,
        diffPct,
      }
    })
  }, [stats, timeUnit])

  // 4. Vehicle Type Overall Benchmark Summary Data
  const typeBenchmarkSummary = useMemo(() => {
    if (!stats) return []
    return VEHICLE_TYPES.map(type => {
      const typeStats = stats.byType[type]
      const count = typeStats?.count ?? 0
      const avgSec = typeStats?.avgSeconds ?? 0
      const estSec = typeStats?.estimatedSeconds ?? 0
      const diffSec = avgSec > 0 && estSec > 0 ? avgSec - estSec : 0
      const diffPct = avgSec > 0 && estSec > 0 ? Math.round(((avgSec - estSec) / estSec) * 100) : 0
      const isFaster = diffSec < 0
      const totalInventory = stats.totalByType[type] ?? 0
      const completionRate = totalInventory > 0 ? Math.round((count / totalInventory) * 100) : 0

      return {
        type,
        count,
        totalInventory,
        completionRate,
        avgSec,
        estSec,
        avgFormatted: avgSec > 0 ? formatDuration(avgSec) : "--",
        estFormatted: estSec > 0 ? formatDuration(estSec) : "--",
        diffSec,
        diffPct,
        isFaster,
      }
    })
  }, [stats])

  return (
    <div className="space-y-8" id="pace-stats-container">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
              Telemetry &amp; Productivity Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold uppercase tracking-wider text-foreground">
            Fleet Performance &amp; Benchmark Metrics
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Combined multi-dimensional benchmarks measuring real turnaround times against target
            estimates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Unit Switcher */}
          <div className="flex items-center border border-border bg-muted/40 p-0.5 rounded-md">
            <button
              type="button"
              onClick={() => setTimeUnit("hours")}
              className={`px-2.5 py-1 text-xs font-mono transition-colors rounded ${
                timeUnit === "hours"
                  ? "bg-background text-foreground font-bold shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Hours
            </button>
            <button
              type="button"
              onClick={() => setTimeUnit("minutes")}
              className={`px-2.5 py-1 text-xs font-mono transition-colors rounded ${
                timeUnit === "minutes"
                  ? "bg-background text-foreground font-bold shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Minutes
            </button>
          </div>

          {lastUpdatedLabel && (
            <span className="text-xs text-muted-foreground font-mono hidden lg:inline px-2 py-1 bg-muted/30 border border-border/60">
              Synced: {lastUpdatedLabel}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch()
              onRefresh?.()
            }}
            disabled={loading}
            className="gap-1.5 font-mono text-xs shadow-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Recalculate</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-xs font-mono rounded-md">
          Failed to fetch analytical stats: {error}
        </div>
      )}

      {/* High Impact Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Overall Average Turnaround vs Target */}
        <Card className="border-border relative overflow-hidden">
          <CardHeader className="border-b border-border/80 pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider">
                Fleet Turnaround Average
              </CardTitle>
            </div>
            {overall && overall.avgSeconds > 0 && overall.estimatedSeconds > 0 && (
              <Badge
                variant="outline"
                className={`text-[10px] font-mono font-bold ${
                  overall.variancePct <= 0
                    ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                }`}
              >
                {overall.variancePct <= 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <TrendingDown className="size-3" />
                    {Math.abs(overall.variancePct)}% Faster
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="size-3" />+{overall.variancePct}% Over Target
                  </span>
                )}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="space-y-0.5">
                <div className="text-3xl font-black font-mono tracking-tight text-foreground tabular-nums">
                  {overall?.avgFormatted || "--"}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Actual net detailing average
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-muted-foreground">Target Standard</div>
                <div className="text-sm font-bold text-foreground">
                  {overall?.estimatedFormatted || "--"}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>Variance from Target</span>
                <span
                  className={`font-bold ${
                    overall && overall.varianceSeconds <= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {overall && overall.avgSeconds > 0 && overall.estimatedSeconds > 0
                    ? overall.varianceSeconds <= 0
                      ? `-${formatDuration(Math.abs(overall.varianceSeconds))} ahead`
                      : `+${formatDuration(overall.varianceSeconds)} delta`
                    : "No baseline delta"}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    overall && overall.variancePct <= 0 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{
                    width: `${
                      overall && overall.estimatedSeconds > 0
                        ? Math.min(
                            100,
                            Math.max(10, (overall.avgSeconds / overall.estimatedSeconds) * 100)
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: On-Time Benchmark Adherence */}
        <Card className="border-border">
          <CardHeader className="border-b border-border/80 pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="size-4 text-emerald-500" />
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider">
                Benchmark Adherence
              </CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {overall?.onTimePct ?? 0}% On-Target
            </Badge>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="space-y-0.5">
                <div className="text-3xl font-black font-mono tracking-tight text-foreground tabular-nums">
                  {overall?.onTimeCount ?? 0}
                  <span className="text-lg font-normal text-muted-foreground">
                    {" "}
                    / {totalProcessed}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Jobs within standard benchmark
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-muted-foreground">Efficiency Index</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {overall?.onTimePct ?? 0}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-border/60">
              <div className="p-2 bg-muted/30 border border-border/50 rounded">
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Fastest Class
                </span>
                <span className="font-bold text-sky-500 mt-0.5 block">
                  {overall?.fastestType ? `${overall.fastestType} Vehicles` : "--"}
                </span>
              </div>
              <div className="p-2 bg-muted/30 border border-border/50 rounded">
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Longest Class
                </span>
                <span className="font-bold text-amber-500 mt-0.5 block">
                  {overall?.slowestType ? `${overall.slowestType} Vehicles` : "--"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Fleet Processing Volume & Inventory Mix */}
        <Card className="border-border">
          <CardHeader className="border-b border-border/80 pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="size-4 text-primary" />
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider">
                Fleet Throughput
              </CardTitle>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {totalFleet} Total in Fleet
            </Badge>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="space-y-0.5">
                <div className="text-3xl font-black font-mono tracking-tight text-foreground tabular-nums">
                  {totalProcessed}
                  <span className="text-lg font-normal text-muted-foreground"> / {totalFleet}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Vehicles completed &amp; audited
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-muted-foreground">In-Bay / Queue</div>
                <div className="text-sm font-bold text-primary">
                  {overall?.totalActive ?? 0} active
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>Fleet Completion</span>
                <span className="font-bold text-foreground">{overall?.completionPct ?? 0}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                {VEHICLE_TYPES.map(type => {
                  const typeCount = stats?.totalByType[type] ?? 0
                  const widthPct = totalFleet > 0 ? (typeCount / totalFleet) * 100 : 0
                  return (
                    <div
                      key={type}
                      className={`${VEHICLE_TYPE_BAR_COLORS[type]} h-full`}
                      style={{ width: `${widthPct}%` }}
                      title={`${type}: ${typeCount} vehicles (${Math.round(widthPct)}%)`}
                    />
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Dedicated Vehicle Type Benchmarks Breakdown (New / Used / Demo) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-heading font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>Vehicle Classification Benchmarks (New vs. Used vs. Demo)</span>
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Aggregated cycle times, target estimates, and pacing variance broken down by inventory
              condition.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {typeBenchmarkSummary.map(item => {
            const hasData = item.count > 0 && item.avgSec > 0
            const pctOfTarget =
              item.estSec > 0 && item.avgSec > 0 ? Math.round((item.avgSec / item.estSec) * 100) : 0

            return (
              <Card
                key={item.type}
                className="border-border hover:border-primary/40 transition-colors"
              >
                <CardHeader className="pb-3 pt-4 px-4 border-b border-border/60 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 border uppercase ${
                        TYPE_COLORS[item.type]
                      }`}
                    >
                      {item.type} Vehicle
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {item.count} completed &bull; {item.totalInventory} total
                  </span>
                </CardHeader>

                <CardContent className="px-4 py-4 space-y-3.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground font-mono uppercase">
                        Average Duration
                      </div>
                      <div className="text-2xl font-black font-mono text-foreground tabular-nums">
                        {item.avgFormatted}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-muted-foreground font-mono uppercase">
                        Target Est.
                      </div>
                      <div className="text-sm font-bold font-mono text-muted-foreground">
                        {item.estFormatted}
                      </div>
                    </div>
                  </div>

                  {/* Variance Indicator */}
                  {hasData ? (
                    <div className="space-y-1.5 pt-1 border-t border-border/40">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            item.isFaster
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.isFaster ? (
                            <ArrowDownRight className="size-3.5" />
                          ) : (
                            <ArrowUpRight className="size-3.5" />
                          )}
                          {item.isFaster
                            ? `${Math.abs(item.diffPct)}% faster than target`
                            : `+${item.diffPct}% over target`}
                        </span>
                        <span className="text-muted-foreground">{pctOfTarget}% of benchmark</span>
                      </div>

                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.isFaster ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, pctOfTarget)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-border/40 text-center py-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        No completed {item.type.toLowerCase()} vehicles logged yet
                      </span>
                    </div>
                  )}

                  {/* Completion Rate Pill */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                    <span>Classification Volume</span>
                    <span className="font-semibold text-foreground">
                      {item.completionRate}% throughput ({item.count}/{item.totalInventory})
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* SECTION 3: Primary Multi-Dimensional Shadcn Charts */}
      <Card className="border-border">
        <CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-heading font-bold uppercase">
              <BarChart3 className="size-4 text-primary" />
              <span>Comparative Duration Benchmarks by Service &amp; Classification</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs mt-1">
              Interactive multi-bar visualizer combining timing metrics across vehicle types and
              service tiers.
            </CardDescription>
          </div>

          {/* Chart View Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 border border-border bg-muted/30 p-1 rounded-md">
            <button
              type="button"
              onClick={() => setChartViewMode("by-service")}
              className={`px-3 py-1 text-xs font-mono transition-colors rounded ${
                viewMode === "by-service"
                  ? "bg-background text-foreground font-bold shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Service Tier
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode("by-type")}
              className={`px-3 py-1 text-xs font-mono transition-colors rounded ${
                viewMode === "by-type"
                  ? "bg-background text-foreground font-bold shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Vehicle Classification
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode("actual-vs-target")}
              className={`px-3 py-1 text-xs font-mono transition-colors rounded ${
                viewMode === "actual-vs-target"
                  ? "bg-background text-foreground font-bold shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Actual vs. Benchmark
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          {/* VIEW MODE 1: Combined Chart Grouped by Service (Bars for New, Used, Demo, Target) */}
          {viewMode === "by-service" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
                <span>
                  Showing duration in <strong className="text-foreground">{timeUnit}</strong> for
                  New, Used, and Demo vehicles across all 4 service tiers.
                </span>
                <span className="hidden sm:inline text-[11px]">
                  Gray bar represents Standard Target Benchmark
                </span>
              </div>

              <ChartContainer config={chartConfig} className="h-90 w-full">
                <BarChart
                  data={byServiceChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="service"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="font-mono text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `${v}${timeUnit === "hours" ? "h" : "m"}`}
                    className="font-mono text-xs"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => {
                          const numVal = Number(value)
                          const rawSec =
                            name === "New"
                              ? item.payload.NewRaw
                              : name === "Used"
                                ? item.payload.UsedRaw
                                : name === "Demo"
                                  ? item.payload.DemoRaw
                                  : item.payload.targetRaw
                          const count =
                            name === "New"
                              ? item.payload.NewCount
                              : name === "Used"
                                ? item.payload.UsedCount
                                : name === "Demo"
                                  ? item.payload.DemoCount
                                  : null

                          return (
                            <div className="flex items-center justify-between gap-4 font-mono text-xs w-full">
                              <span className="text-muted-foreground">
                                {name === "target" ? "Target Benchmark" : `${name} Vehicle`}
                                {count !== null && ` (${count} completed)`}:
                              </span>
                              <span className="font-bold text-foreground">
                                {rawSec > 0 ? formatSecondsToClock(rawSec) : "--"} ({numVal}
                                {timeUnit === "hours" ? "h" : "m"})
                              </span>
                            </div>
                          )
                        }}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="target"
                    name="target"
                    fill="var(--color-target)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="New"
                    name="New"
                    fill="var(--color-New)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Used"
                    name="Used"
                    fill="var(--color-Used)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Demo"
                    name="Demo"
                    fill="var(--color-Demo)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* VIEW MODE 2: Combined Chart Grouped by Vehicle Type (Bars for Full Detail, Ceramic, Quick, Delivery) */}
          {viewMode === "by-type" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
                <span>
                  Comparing detailing service times in{" "}
                  <strong className="text-foreground">{timeUnit}</strong> for each vehicle category.
                </span>
              </div>

              <ChartContainer config={chartConfig} className="h-90 w-full">
                <BarChart
                  data={byTypeChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="type"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="font-mono text-xs font-bold"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `${v}${timeUnit === "hours" ? "h" : "m"}`}
                    className="font-mono text-xs"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => {
                          const numVal = Number(value)
                          const serviceKey = String(name)
                          const rawSec = item.payload[`${serviceKey} Raw`] || 0
                          const count = item.payload[`${serviceKey} Count`] || 0

                          return (
                            <div className="flex items-center justify-between gap-4 font-mono text-xs w-full">
                              <span className="text-muted-foreground">
                                {serviceKey} ({count} logged):
                              </span>
                              <span className="font-bold text-foreground">
                                {rawSec > 0 ? formatSecondsToClock(rawSec) : "--"} ({numVal}
                                {timeUnit === "hours" ? "h" : "m"})
                              </span>
                            </div>
                          )
                        }}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="Full Detail"
                    name="Full Detail"
                    fill="var(--color-Full-Detail, oklch(0.65 0.18 220))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="Ceramic Coating"
                    name="Ceramic Coating"
                    fill="var(--color-Ceramic-Coating, oklch(0.65 0.22 300))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="Quick Detail"
                    name="Quick Detail"
                    fill="var(--color-Quick-Detail, oklch(0.72 0.16 55))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="Delivery Prep"
                    name="Delivery Prep"
                    fill="var(--color-Delivery-Prep, oklch(0.65 0.22 25))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* VIEW MODE 3: Actual vs Estimated Benchmark Direct Comparison */}
          {viewMode === "actual-vs-target" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
                <span>
                  Side-by-side comparison of overall{" "}
                  <strong className="text-emerald-500">Actual Average Time</strong> vs.{" "}
                  <strong className="text-muted-foreground">Standard Target Estimate</strong>.
                </span>
              </div>

              <ChartContainer config={chartConfig} className="h-90 w-full">
                <BarChart
                  data={actualVsTargetData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="service"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="font-mono text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `${v}${timeUnit === "hours" ? "h" : "m"}`}
                    className="font-mono text-xs"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => {
                          const numVal = Number(value)
                          const isActual = name === "actual"
                          const rawSec = isActual ? item.payload.actualRaw : item.payload.targetRaw
                          const diffPct = item.payload.diffPct
                          const count = item.payload.count

                          return (
                            <div className="flex flex-col gap-1 font-mono text-xs w-full">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                  {isActual
                                    ? `Actual Avg (${count} vehicles)`
                                    : "Standard Benchmark"}
                                  :
                                </span>
                                <span className="font-bold text-foreground">
                                  {rawSec > 0 ? formatSecondsToClock(rawSec) : "--"} ({numVal}
                                  {timeUnit === "hours" ? "h" : "m"})
                                </span>
                              </div>
                              {isActual && rawSec > 0 && (
                                <div className="text-[10px] text-muted-foreground">
                                  Variance:{" "}
                                  <span
                                    className={`font-bold ${
                                      diffPct <= 0 ? "text-emerald-500" : "text-amber-500"
                                    }`}
                                  >
                                    {diffPct <= 0
                                      ? `${Math.abs(diffPct)}% Ahead of target`
                                      : `+${diffPct}% Over target`}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        }}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="target"
                    name="target"
                    fill="var(--color-target)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={55}
                  />
                  <Bar
                    dataKey="actual"
                    name="actual"
                    fill="var(--color-actual)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={55}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 4: Detailing Matrix & Classification Table */}
      <Card className="border-border">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-heading font-bold uppercase">
              <Compass className="size-4 text-primary" />
              <span>Full Detailing Matrix &amp; Pacing Variance</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs mt-0.5">
              Granular cross-tabulation of average turnaround times per service across New, Used,
              and Demo classifications.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Service Tier</th>
                <th className="py-3 px-4 font-semibold">Target Benchmark</th>
                <th className="py-3 px-4 font-semibold text-sky-600 dark:text-sky-400">
                  New Vehicle Avg
                </th>
                <th className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400">
                  Used Vehicle Avg
                </th>
                <th className="py-3 px-4 font-semibold text-purple-600 dark:text-purple-400">
                  Demo Vehicle Avg
                </th>
                <th className="py-3 px-4 font-semibold">Overall Actual</th>
                <th className="py-3 px-4 font-semibold text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {SERVICE_TYPES.map(service => {
                const newStats = stats?.byTypeAndService.New?.[service.name]
                const usedStats = stats?.byTypeAndService.Used?.[service.name]
                const demoStats = stats?.byTypeAndService.Demo?.[service.name]
                const overallService = stats?.byService[service.name]

                const hasOverall =
                  (overallService?.count ?? 0) > 0 && (overallService?.avgSeconds ?? 0) > 0
                const targetSec = service.estimatedSeconds
                const overallSec = overallService?.avgSeconds ?? 0
                const diffSec = overallSec > 0 ? overallSec - targetSec : 0
                const diffPct =
                  overallSec > 0 && targetSec > 0 ? Math.round((diffSec / targetSec) * 100) : 0
                const isOptimal = diffSec <= 0

                return (
                  <tr key={service.name} className="hover:bg-muted/20 transition-colors">
                    {/* Service Name & Badge */}
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 border uppercase ${
                            SERVICE_TYPE_COLORS[service.name]
                          }`}
                        >
                          {service.name}
                        </span>
                      </div>
                    </td>

                    {/* Standard Target */}
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {formatSecondsToClock(service.estimatedSeconds)}
                    </td>

                    {/* New Vehicles */}
                    <td className="py-3.5 px-4">
                      {newStats && newStats.count > 0 && newStats.avgSeconds > 0 ? (
                        <div>
                          <span className="font-bold text-foreground">{newStats.avgFormatted}</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">
                            ({newStats.count} {newStats.count === 1 ? "car" : "cars"})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </td>

                    {/* Used Vehicles */}
                    <td className="py-3.5 px-4">
                      {usedStats && usedStats.count > 0 && usedStats.avgSeconds > 0 ? (
                        <div>
                          <span className="font-bold text-foreground">
                            {usedStats.avgFormatted}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">
                            ({usedStats.count} {usedStats.count === 1 ? "car" : "cars"})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </td>

                    {/* Demo Vehicles */}
                    <td className="py-3.5 px-4">
                      {demoStats && demoStats.count > 0 && demoStats.avgSeconds > 0 ? (
                        <div>
                          <span className="font-bold text-foreground">
                            {demoStats.avgFormatted}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">
                            ({demoStats.count} {demoStats.count === 1 ? "car" : "cars"})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </td>

                    {/* Overall Service Avg */}
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {hasOverall ? (
                        <div className="flex items-center gap-1.5">
                          <span>{overallService?.avgFormatted}</span>
                          <span className="text-[10px] text-muted-foreground">
                            (n={overallService?.count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </td>

                    {/* Performance Status */}
                    <td className="py-3.5 px-4 text-right">
                      {hasOverall ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 border ${
                            isOptimal
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
                          }`}
                        >
                          {isOptimal ? (
                            <>
                              <TrendingDown className="size-3" />
                              <span>{Math.abs(diffPct)}% Ahead</span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="size-3" />
                              <span>+{diffPct}% Over</span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase">
                          No logged jobs
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
