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
  formatSecondsToMinutes,
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
      className={`group relative flex flex-col justify-between gap-3 ${
        isFocused ? "min-h-full p-0" : "min-h-43.75 bg-card border border-border p-4"
      } ${onOpenFocus ? "cursor-pointer touch-manipulation" : ""} ${className ?? ""}`}
      onClick={onOpenFocus ? handleCardClick : undefined}
      onKeyDown={onOpenFocus ? handleCardKeyDown : undefined}
      tabIndex={onOpenFocus ? 0 : undefined}
      role={onOpenFocus ? "button" : undefined}
      aria-label={onOpenFocus ? `Open ${vehicle.license_plate} focused view` : undefined}
    >
      {/* Top Row: Plate & Status / Date Added */}
      <div
        className={`flex items-start justify-between gap-4 ${
          isFocused ? "border-b border-border pb-6" : ""
        }`}
      >
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            License Plate
          </div>
          <div
            className={`font-black font-mono tracking-widest text-foreground leading-tight ${
              isFocused ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
            }`}
          >
            {vehicle.license_plate}
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {/* Status (text-only color, no border, no bg) */}
          <div
            className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
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
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <Calendar className="size-3" />
            <span>{formatShortDate(vehicle.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Vehicle Attribute Chips & Optional Notes */}
      <div className={isFocused ? "space-y-5 py-6" : "space-y-2"}>
        <div className={`flex flex-wrap ${isFocused ? "gap-2" : "gap-1.5"}`}>
          <span
            className={`inline-flex items-center font-mono border ${
              isFocused ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
            } ${TYPE_COLORS[vehicle.type] || FALLBACK_BADGE_COLOR}`}
          >
            {vehicle.type}
          </span>
          <span
            className={`inline-flex items-center font-mono border ${
              isFocused ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
            } ${CONDITION_COLORS[vehicle.condition] || FALLBACK_BADGE_COLOR}`}
          >
            {vehicle.condition}
          </span>
          <span
            className={`inline-flex items-center font-mono border ${
              isFocused ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
            } ${SERVICE_TYPE_COLORS[vehicle.service_type] || FALLBACK_BADGE_COLOR}`}
          >
            {vehicle.service_type}
          </span>
        </div>

        {/* Notes & Edit Control */}
        {isEditingNotes ? (
          <div className="border-t border-border/50 pt-1.5 font-mono space-y-1.5">
            <div className="flex items-center justify-between text-[9px] uppercase font-semibold text-muted-foreground">
              <span>Edit Notes</span>
              <span className="text-[8px] text-muted-foreground/70 lowercase font-normal">
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
              rows={2}
              disabled={savingNotes}
              className="w-full p-1.5 text-xs font-mono border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-tight"
            />
            {saveError && <div className="text-[10px] text-destructive font-mono">{saveError}</div>}
            <div className="flex items-center justify-end gap-1.5">
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
          <Button
            variant="ghost"
            disabled={busy || savingNotes}
            onClick={() => {
              setEditingNotes(vehicle.notes || "")
              setIsEditingNotes(true)
              setSaveError(null)
            }}
            className={`w-full text-muted-foreground border-t border-border/50 font-mono flex items-center justify-between gap-1.5 group/notes hover:bg-muted/40 rounded transition-colors h-auto font-normal whitespace-normal ${
              isFocused ? "pt-4 p-2 -mx-2 text-sm" : "pt-1.5 p-1 -mx-1 text-[11px]"
            }`}
            title={vehicle.notes ? "Click to edit notes" : "Click to add notes"}
          >
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[9px] uppercase text-muted-foreground mr-1.5 font-semibold">
                Notes:
              </span>
              {vehicle.notes && (
                <span className="italic text-foreground line-clamp-2">
                  &ldquo;{vehicle.notes}&rdquo;
                </span>
              )}
            </div>
            <div className="shrink-0 text-muted-foreground group-hover/notes:text-foreground opacity-60 group-hover/notes:opacity-100 transition-opacity p-0.5">
              <Pencil className="size-3" />
            </div>
          </Button>
        )}
      </div>

      {/* Bottom Row: Metadata info (timer / estimate) & Action Buttons */}
      <div
        className={`flex items-center justify-between gap-3 border-t border-border/50 font-mono ${
          isFocused ? "flex-wrap pt-6 text-sm" : "pt-2 text-[11px] min-h-9"
        }`}
      >
        {/* Timer / Est. */}
        <div
          className={`flex items-center gap-1.5 text-muted-foreground ${
            isFocused ? "text-sm" : "text-[10px]"
          }`}
        >
          <div
            className={`inline-flex items-center gap-1 font-mono tabular-nums text-muted-foreground ${
              isFocused ? "text-sm" : "text-[11px]"
            }`}
            title="Elapsed Time"
          >
            <Timer className="size-3" />
            <span>{isNotStarted ? "--" : formatDuration(liveSeconds)}</span>
          </div>

          <span className="text-muted-foreground/50">/</span>

          <div
            className={`inline-flex items-center gap-1 font-mono tabular-nums text-muted-foreground ${
              isFocused ? "text-sm" : "text-[11px]"
            }`}
            title="Estimated Time"
          >
            <ClockCheck className="size-3" />
            <span>{formatSecondsToMinutes(estimatedSeconds)}</span>
          </div>
        </div>

        {/* Actions - if completed/done, leave blank where buttons were */}
        {!isCompleted && (
          <div
            className={`flex items-center gap-1.5 ${isFocused ? "w-full sm:w-auto sm:ml-auto" : "ml-auto"}`}
          >
            {isNotStarted && (
              <Button
                className={`gap-1 font-mono uppercase tracking-wider ${
                  isFocused ? "h-10 flex-1 sm:flex-none px-5 text-xs" : "h-7 px-3 text-[11px]"
                }`}
                onClick={handleStart}
                disabled={busy}
                size="xs"
              >
                <Play className="size-2.5 fill-current" />
                <span>Start Job</span>
              </Button>
            )}

            {isRunning && (
              <>
                <Button
                  variant="outline"
                  className={`gap-1 font-mono uppercase tracking-wider text-amber-600 border-amber-500/40 hover:bg-amber-500/10 ${
                    isFocused ? "h-10 flex-1 sm:flex-none px-5 text-xs" : "h-7 px-2.5 text-[11px]"
                  }`}
                  onClick={handleBreak}
                  disabled={busy}
                  size="xs"
                >
                  <Pause className="size-2.5" />
                  <span>Break</span>
                </Button>
                <Button
                  variant="default"
                  className={`gap-1 font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white ${
                    isFocused ? "h-10 flex-1 sm:flex-none px-5 text-xs" : "h-7 px-2.5 text-[11px]"
                  }`}
                  onClick={handleDone}
                  disabled={busy}
                  size="xs"
                >
                  <CheckCircle2 className="size-2.5" />
                  <span>Done</span>
                </Button>
              </>
            )}

            {isOnBreak && (
              <>
                <Button
                  className={`gap-1 font-mono uppercase tracking-wider ${
                    isFocused ? "h-10 flex-1 sm:flex-none px-5 text-xs" : "h-7 px-2.5 text-[11px]"
                  }`}
                  onClick={handleResume}
                  disabled={busy}
                  size="xs"
                >
                  <RotateCcw className="size-2.5" />
                  <span>Resume</span>
                </Button>
                <Button
                  variant="default"
                  className={`gap-1 font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white ${
                    isFocused ? "h-10 flex-1 sm:flex-none px-5 text-xs" : "h-7 px-2.5 text-[11px]"
                  }`}
                  onClick={handleDone}
                  disabled={busy}
                  size="xs"
                >
                  <CheckCircle2 className="size-2.5" />
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
