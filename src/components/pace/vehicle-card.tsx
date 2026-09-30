import {
  Calendar,
  Check,
  CheckCircle2,
  ClockCheck,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Timer,
  X,
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

export interface VehicleCardProps {
  key?: React.Key
  vehicle: Vehicle
  onUpdated: () => void
  onOpenFocus?: () => void
  onCloseFocus?: () => void
  className?: string
  isFocused?: boolean
}

export default function VehicleCard({
  vehicle,
  onUpdated,
  onOpenFocus,
  className,
  isFocused = false,
}: VehicleCardProps) {
  const [liveSeconds, setLiveSeconds] = useState(() => computeLiveSeconds(vehicle))
  const [busy, setBusy] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editingNotes, setEditingNotes] = useState(vehicle.notes || "")
  const [savingNotes, setSavingNotes] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isEditingNotes) {
      setEditingNotes(vehicle.notes || "")
    }
  }, [vehicle.notes, isEditingNotes])

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

  const estimatedSeconds = SERVICE_TYPES.find(
    s => s.name === vehicle.service_type
  )?.estimatedSeconds

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

  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    setSaveError(null)
    const trimmed = editingNotes.trim() || null
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
      setIsEditingNotes(false)
      onUpdated()
    } else {
      setSaveError(error.message)
    }
  }

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onOpenFocus) return
    const target = event.target
    if (target instanceof Element && target.closest("button, textarea, input, select, a")) return
    onOpenFocus()
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onOpenFocus || (event.key !== "Enter" && event.key !== " ")) return
    event.preventDefault()
    onOpenFocus()
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: The card is keyboard and pointer interactive only when focus navigation is enabled.
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: The button role is enabled with the same focus navigation condition.
    <div
      data-slot="card"
      className={`card-diagonal-grid group relative isolate overflow-hidden flex flex-col justify-start shadow-sm bg-card text-card-foreground border border-border p-4 gap-3 ${
        isFocused ? "h-full min-h-0" : "min-h-43.75"
      } ${onOpenFocus ? "cursor-pointer touch-manipulation" : ""} ${className ?? ""}`}
      onClick={onOpenFocus ? handleCardClick : undefined}
      onKeyDown={onOpenFocus ? handleCardKeyDown : undefined}
      tabIndex={onOpenFocus ? 0 : undefined}
      role={onOpenFocus ? "button" : undefined}
      aria-label={onOpenFocus ? `Open ${vehicle.license_plate} focused view` : undefined}
    >
      {/* Top Row: Plate & Status / Date Added */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            License Plate
          </div>
          <div className="font-black font-mono tracking-widest text-foreground leading-tight text-xl sm:text-2xl">
            {vehicle.license_plate}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div
            className={`font-mono font-bold uppercase tracking-wider text-[10px] ${
              isCompleted
                ? "text-emerald-600 dark:text-emerald-400"
                : isOnBreak
                  ? "text-amber-600 dark:text-amber-400"
                  : displayStatus === "In Progress"
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-muted-foreground"
            }`}
          >
            STATUS: {displayStatus.toUpperCase()}
          </div>

          {/* Date added under status */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono text-muted-foreground">
            <Calendar className="size-3" />
            <span>{formatShortDate(vehicle.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Vehicle Attribute Chips & Notes (Top-Anchored, Expands Downward) */}
      <div className="flex-1 min-h-0 flex flex-col justify-start items-stretch gap-2">
        <div className="flex flex-wrap items-start content-start gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center font-mono border px-2 py-0.5 text-[10px] ${
              TYPE_COLORS[vehicle.type] || FALLBACK_BADGE_COLOR
            }`}
          >
            {vehicle.type}
          </span>
          <span
            className={`inline-flex items-center font-mono border px-2 py-0.5 text-[10px] ${
              CONDITION_COLORS[vehicle.condition] || FALLBACK_BADGE_COLOR
            }`}
          >
            {vehicle.condition}
          </span>
          <span
            className={`inline-flex items-center font-mono border px-2 py-0.5 text-[10px] ${
              SERVICE_TYPE_COLORS[vehicle.service_type] || FALLBACK_BADGE_COLOR
            }`}
          >
            {vehicle.service_type}
          </span>
        </div>

        {/* Notes & Edit Control */}
        {isEditingNotes ? (
          <div
            className={`border border-border shadow-sm bg-card p-2 font-mono flex flex-col justify-start gap-1.5 ${
              isFocused ? "flex-1 min-h-0" : ""
            }`}
          >
            <div className="flex items-start justify-between text-[9px] uppercase font-semibold text-muted-foreground shrink-0">
              <span>Edit Notes</span>
              <span className="text-[8px] text-muted-foreground lowercase font-normal">
                ⌘+Enter to save &bull; Esc to cancel
              </span>
            </div>
            <textarea
              value={editingNotes}
              onChange={e => {
                setEditingNotes(e.target.value)
                if (saveError) setSaveError(null)
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSaveNotes()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  setIsEditingNotes(false)
                  setEditingNotes(vehicle.notes || "")
                  setSaveError(null)
                }
              }}
              placeholder="Enter notes..."
              rows={isFocused ? 6 : 2}
              disabled={savingNotes}
              className={`w-full p-1.5 text-xs font-mono border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-tight ${
                isFocused ? "flex-1 min-h-24 leading-relaxed" : ""
              }`}
            />
            {saveError && (
              <div className="text-[10px] text-destructive font-mono shrink-0">{saveError}</div>
            )}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setIsEditingNotes(false)
                  setEditingNotes(vehicle.notes || "")
                  setSaveError(null)
                }}
                disabled={savingNotes}
                className="h-6 px-2 text-[10px] font-mono"
              >
                <X className="size-2.5 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="h-6 px-2 text-[10px] font-mono bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="size-2.5 mr-1" />
                {savingNotes ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy || savingNotes}
            onClick={() => {
              setEditingNotes(vehicle.notes || "")
              setIsEditingNotes(true)
              setSaveError(null)
            }}
            className={`w-full flex-1 min-h-0 bg-card text-muted-foreground border border-border shadow-sm font-mono flex items-start justify-between gap-1.5 group/notes hover:bg-muted dark:hover:bg-muted rounded transition-colors font-normal whitespace-normal p-2 text-[11px] text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
              isFocused ? "overflow-y-auto" : ""
            }`}
            title={vehicle.notes ? "Click to edit notes" : "Click to add notes"}
          >
            <div className="flex-1 min-w-0 text-left self-start">
              <span className="text-[9px] uppercase text-muted-foreground mr-1.5 font-semibold">
                Notes:
              </span>
              {vehicle.notes && (
                <span
                  className={`italic text-foreground ${
                    isFocused ? "whitespace-pre-wrap break-words" : "line-clamp-2"
                  }`}
                >
                  &ldquo;{vehicle.notes}&rdquo;
                </span>
              )}
            </div>
            <div className="shrink-0 self-start text-muted-foreground group-hover/notes:text-foreground transition-colors p-0.5">
              <Pencil className="size-3" />
            </div>
          </button>
        )}
      </div>

      {/* Bottom Area: Metadata info (timer / estimate + progress bar) & Action Buttons */}
      <div className="mt-auto flex flex-col gap-2.5 border-t border-border/50 font-mono shrink-0 pt-2.5 text-[11px]">
        {/* Timer & Est. spanning the whole card + Tiny Progress Bar */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-start justify-between w-full gap-2">
            <div
              className={`inline-flex items-center gap-1 font-mono tabular-nums text-[11px] font-semibold ${timerColorClass}`}
              title="Elapsed Time"
            >
              <Timer className="size-3" />
              <span>{formatDuration(liveSeconds)}</span>
            </div>

            <div
              className="inline-flex items-center gap-1 font-mono tabular-nums text-muted-foreground text-[11px]"
              title="Estimated Time"
            >
              <ClockCheck className="size-3" />
              <span>{estimatedSeconds != null ? formatDuration(estimatedSeconds) : "--"}</span>
            </div>
          </div>

          {/* Tiny Progress Bar */}
          <div
            className="h-1 w-full bg-muted overflow-hidden rounded-full"
            title={`${Math.round(progressRatio * 100)}% of estimated time`}
          >
            <div
              className={`h-full w-(--progress-width) transition-all duration-300 ${progressBarColor}`}
              style={{ "--progress-width": `${progressPercent}%` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Actions at the bottom */}
        {!isCompleted && (
          <div className="flex items-center gap-2 w-full">
            {isNotStarted && (
              <Button
                className="w-full gap-1.5 font-mono uppercase tracking-wider h-7 px-3 text-[11px]"
                onClick={handleStart}
                disabled={busy}
                size="xs"
              >
                <Play className="size-3 fill-current" />
                <span>Start Job</span>
              </Button>
            )}

            {isRunning && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5 font-mono uppercase tracking-wider text-amber-600 border-amber-500/40 hover:bg-amber-500/10 h-7 px-2.5 text-[11px]"
                  onClick={handleBreak}
                  disabled={busy}
                  size="xs"
                >
                  <Pause className="size-3" />
                  <span>Break</span>
                </Button>
                <Button
                  variant="default"
                  className="flex-1 gap-1.5 font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-[11px]"
                  onClick={handleDone}
                  disabled={busy}
                  size="xs"
                >
                  <CheckCircle2 className="size-3" />
                  <span>Done</span>
                </Button>
              </>
            )}

            {isOnBreak && (
              <>
                <Button
                  className="flex-1 gap-1.5 font-mono uppercase tracking-wider h-7 px-2.5 text-[11px]"
                  onClick={handleResume}
                  disabled={busy}
                  size="xs"
                >
                  <RotateCcw className="size-3" />
                  <span>Resume</span>
                </Button>
                <Button
                  variant="default"
                  className="flex-1 gap-1.5 font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-[11px]"
                  onClick={handleDone}
                  disabled={busy}
                  size="xs"
                >
                  <CheckCircle2 className="size-3" />
                  <span>Done</span>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
