import {
  Calendar,
  Check,
  CheckCircle2,
  ClockCheck,
  Pause,
  Play,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Timer,
} from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CONDITION_COLORS,
  FALLBACK_BADGE_COLOR,
  SERVICE_TYPE_COLORS,
  TYPE_COLORS,
} from "@/lib/pace/colors"
import { SERVICE_TYPES } from "@/lib/pace/services"
import {
  computeLiveSeconds,
  elapsedSecondsSince,
  formatDuration,
  formatShortDate,
  getDisplayStatus,
  isPending,
} from "@/lib/pace/vehicle"
import { supabase, type Vehicle } from "@/lib/supabase"
import VehicleInspectionSheet from "./vehicle-inspection-sheet"

export interface JobDetailWorkspaceProps {
  vehicle: Vehicle
  onUpdated: () => void
  onBack?: () => void
}

const COMMON_NOTE_SNIPPETS = [
  "Deep interior vacuum",
  "Paint scratches noted",
  "Leather conditioning",
  "Pet hair removed",
  "Ceramic coating curing",
  "Wheel faces coated",
  "Glass streak-free",
  "Clay bar decontamination",
  "Upholstery shampooed",
  "Customer rush priority",
  "Ready for delivery",
]

export default function JobDetailWorkspace({ vehicle, onUpdated }: JobDetailWorkspaceProps) {
  const [liveSeconds, setLiveSeconds] = useState(() => computeLiveSeconds(vehicle))
  const [busy, setBusy] = useState(false)
  const [notes, setNotes] = useState(vehicle.notes || "")
  const [savingNotes, setSavingNotes] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setNotes(vehicle.notes || "")
  }, [vehicle.notes])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (vehicle.status === "In Progress" && vehicle.started_at) {
      setLiveSeconds(computeLiveSeconds(vehicle))
      intervalRef.current = setInterval(() => {
        setLiveSeconds(computeLiveSeconds(vehicle))
      }, 1000)
    } else {
      setLiveSeconds(vehicle.net_work_seconds)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [vehicle])

  const isNotStarted = isPending(vehicle)
  const isRunning = vehicle.status === "In Progress" && !!vehicle.started_at
  const isOnBreak = vehicle.status === "On Break"
  const isCompleted = vehicle.status === "Completed"
  const displayStatus = getDisplayStatus(vehicle)

  const serviceDef = SERVICE_TYPES.find(s => s.name === vehicle.service_type)
  const estimatedSeconds = serviceDef?.estimatedSeconds

  const progressRatio =
    estimatedSeconds && estimatedSeconds > 0 ? liveSeconds / estimatedSeconds : 0
  const progressPercent =
    estimatedSeconds && estimatedSeconds > 0
      ? Math.min(100, Math.max(0, (liveSeconds / estimatedSeconds) * 100))
      : 0

  const progressBarColor =
    liveSeconds === 0
      ? "bg-muted-foreground/30"
      : progressRatio > 1
        ? "bg-red-500"
        : progressRatio >= 0.8
          ? "bg-amber-500"
          : "bg-emerald-500"

  const timerColorClass =
    liveSeconds === 0
      ? "text-muted-foreground"
      : progressRatio > 1
        ? "text-red-600 dark:text-red-400"
        : progressRatio >= 0.8
          ? "text-amber-600 dark:text-amber-400"
          : "text-emerald-600 dark:text-emerald-400"

  const handleStart = async () => {
    setBusy(true)
    const now = new Date().toISOString()
    await supabase
      .from("vehicles")
      .update({ status: "In Progress", started_at: now, updated_at: now })
      .eq("id", vehicle.id)
    setBusy(false)
    onUpdated()
  }

  const handleBreak = async () => {
    setBusy(true)
    const now = new Date()
    const additionalSeconds = elapsedSecondsSince(vehicle.started_at, now)
    await supabase
      .from("vehicles")
      .update({
        status: "On Break",
        started_at: null,
        break_started_at: now.toISOString(),
        net_work_seconds: vehicle.net_work_seconds + additionalSeconds,
        updated_at: now.toISOString(),
      })
      .eq("id", vehicle.id)
    setBusy(false)
    onUpdated()
  }

  const handleResume = async () => {
    setBusy(true)
    const now = new Date().toISOString()
    await supabase
      .from("vehicles")
      .update({
        status: "In Progress",
        started_at: now,
        break_started_at: null,
        updated_at: now,
      })
      .eq("id", vehicle.id)
    setBusy(false)
    onUpdated()
  }

  const handleDone = async () => {
    setBusy(true)
    const now = new Date()
    const additionalSeconds = elapsedSecondsSince(vehicle.started_at, now)
    await supabase
      .from("vehicles")
      .update({
        status: "Completed",
        started_at: null,
        break_started_at: null,
        net_work_seconds: vehicle.net_work_seconds + additionalSeconds,
        updated_at: now.toISOString(),
      })
      .eq("id", vehicle.id)
    setBusy(false)
    onUpdated()
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    setSaveStatus("idle")
    const trimmed = notes.trim() || null
    const now = new Date().toISOString()
    const { error } = await supabase
      .from("vehicles")
      .update({
        notes: trimmed,
        updated_at: now,
      })
      .eq("id", vehicle.id)

    setSavingNotes(false)
    if (!error) {
      setSaveStatus("saved")
      onUpdated()
      setTimeout(() => setSaveStatus("idle"), 2500)
    } else {
      setSaveStatus("error")
    }
  }

  const isNotesDirty = (notes.trim() || null) !== (vehicle.notes || null)

  const appendNoteSnippet = (snippet: string) => {
    setNotes(prev => {
      const cleanPrev = prev.trim()
      if (!cleanPrev) return snippet
      if (cleanPrev.includes(snippet)) return cleanPrev
      return `${cleanPrev} • ${snippet}`
    })
  }

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-background text-foreground animate-in fade-in duration-200">
      {/* Scrollable Mobile Workspace Canvas */}
      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-5 sm:px-6 space-y-5">
        {/* 1. Minimalist Hero Section */}
        <div className="space-y-2">
          {/* Row 1: Large Bold Plate + Floating Status Badge */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-black font-mono tracking-wider text-foreground text-3xl sm:text-4xl leading-none">
              {vehicle.license_plate}
            </h1>

            <div
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 font-mono font-bold text-xs uppercase tracking-wider rounded-none ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : isOnBreak
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : isRunning
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                      : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {isRunning && (
                <span className="size-2 rounded-none bg-sky-500 animate-pulse" aria-hidden="true" />
              )}
              {isOnBreak && (
                <span className="size-2 rounded-none bg-amber-500" aria-hidden="true" />
              )}
              {isCompleted && <Check className="size-3 text-emerald-500" aria-hidden="true" />}
              <span>{displayStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* Row 2: Date + Compact Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground pt-0.5">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              <span>{formatShortDate(vehicle.created_at)}</span>
            </span>
            <span aria-hidden="true">&bull;</span>
            <span
              className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold rounded-none ${
                TYPE_COLORS[vehicle.type] || FALLBACK_BADGE_COLOR
              }`}
            >
              {vehicle.type}
            </span>
            <span
              className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold rounded-none ${
                CONDITION_COLORS[vehicle.condition] || FALLBACK_BADGE_COLOR
              }`}
            >
              {vehicle.condition}
            </span>
            <span
              className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold rounded-none ${
                SERVICE_TYPE_COLORS[vehicle.service_type] || FALLBACK_BADGE_COLOR
              }`}
            >
              {vehicle.service_type}
            </span>
            <button
              type="button"
              onClick={() => setIsInspectionOpen(true)}
              className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="size-3" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* 2. Clean Notes Field + Multi-Row Tag Cloud */}
        <div className="space-y-2.5 pt-1">
          <div className="relative">
            <textarea
              id="workspace-job-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => {
                if (isNotesDirty && !savingNotes) {
                  handleSaveNotes()
                }
              }}
              placeholder="Add notes..."
              rows={7}
              className="w-full p-3 pb-9 min-h-40 font-mono text-xs sm:text-sm border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-none resize-y leading-relaxed transition-all shadow-xs"
            />

            {/* Docked Save & Sync State in bottom-right corner */}
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {saveStatus === "saved" && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-card/90 px-1.5 py-0.5 rounded-none shadow-2xs">
                  <CheckCircle2 className="size-3" /> Saved
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-[11px] font-mono text-destructive bg-card/90 px-1.5 py-0.5 rounded-none">
                  Failed
                </span>
              )}
              {isNotesDirty && (
                <Button
                  type="button"
                  size="xs"
                  disabled={savingNotes}
                  onClick={handleSaveNotes}
                  className="h-6 px-2 text-[10px] font-mono uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 rounded-none shadow-xs cursor-pointer gap-1"
                >
                  <Save className="size-2.5" />
                  <span>{savingNotes ? "Saving..." : "Save"}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Multi-Row Tag Cloud (Spans multiple rows, no horizontal scroll) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {COMMON_NOTE_SNIPPETS.map(snippet => (
              <button
                key={snippet}
                type="button"
                onClick={() => appendNoteSnippet(snippet)}
                className="px-2.5 py-1 text-[11px] font-mono font-medium text-foreground bg-muted/60 hover:bg-muted border border-border rounded-none transition-colors active:scale-95 cursor-pointer"
              >
                + {snippet}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Dashboard (Fixed at bottom combining timer & actions) */}
      <div className="sticky bottom-0 z-20 w-full bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 sm:py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg flex flex-col gap-3 shrink-0">
        {/* Timer Bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between font-mono">
            <div
              className={`tabular-nums text-2xl sm:text-3xl font-black flex items-center gap-2 ${timerColorClass}`}
            >
              <Timer className="size-5 sm:size-6" />
              <span>{formatDuration(liveSeconds)}</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground tabular-nums flex items-center gap-1">
              <ClockCheck className="size-3.5" />
              <span>
                Target: {estimatedSeconds != null ? formatDuration(estimatedSeconds) : "--"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="h-1.5 w-full bg-muted overflow-hidden rounded-none"
            title={`${Math.round(progressRatio * 100)}% of target pace`}
          >
            <div
              className={`h-full w-(--progress-width) transition-all duration-300 rounded-none ${progressBarColor}`}
              style={{ "--progress-width": `${progressPercent}%` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div>
          {isNotStarted && (
            <Button
              className="w-full h-12 text-sm font-bold uppercase tracking-wider font-mono gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-[0.98] transition-transform rounded-none cursor-pointer"
              onClick={handleStart}
              disabled={busy}
            >
              <Play className="size-4 fill-current" />
              <span>Start Job</span>
            </Button>
          )}

          {isRunning && (
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 h-12 text-sm font-bold uppercase tracking-wider font-mono gap-2 text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] transition-transform rounded-none cursor-pointer"
                onClick={handleBreak}
                disabled={busy}
              >
                <Pause className="size-4" />
                <span>Take Break</span>
              </Button>
              <Button
                className="flex-1 h-12 text-sm font-bold uppercase tracking-wider font-mono gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.98] transition-transform rounded-none cursor-pointer"
                onClick={handleDone}
                disabled={busy}
              >
                <CheckCircle2 className="size-4" />
                <span>Complete</span>
              </Button>
            </div>
          )}

          {isOnBreak && (
            <div className="flex items-center gap-2 w-full">
              <Button
                className="flex-1 h-12 text-sm font-bold uppercase tracking-wider font-mono gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-[0.98] transition-transform rounded-none cursor-pointer"
                onClick={handleResume}
                disabled={busy}
              >
                <RotateCcw className="size-4" />
                <span>Resume</span>
              </Button>
              <Button
                className="flex-1 h-12 text-sm font-bold uppercase tracking-wider font-mono gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.98] transition-transform rounded-none cursor-pointer"
                onClick={handleDone}
                disabled={busy}
              >
                <CheckCircle2 className="size-4" />
                <span>Complete</span>
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-12 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none">
                <CheckCircle2 className="size-4" />
                <span>Completed ({formatDuration(liveSeconds)})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResume}
                disabled={busy}
                className="h-12 px-4 font-mono text-xs uppercase tracking-wider shrink-0 rounded-none cursor-pointer"
              >
                Reopen
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Inspection Sheet for full metadata editing */}
      <VehicleInspectionSheet
        vehicle={vehicle}
        open={isInspectionOpen}
        onOpenChange={setIsInspectionOpen}
        onUpdated={() => {
          onUpdated()
        }}
      />
    </div>
  )
}
