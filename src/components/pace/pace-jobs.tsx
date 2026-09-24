import { ArrowLeft, LayoutGrid, Plus } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getDisplayStatus, STATUS_ORDER } from "@/lib/pace/vehicle"
import { supabase, type Vehicle } from "@/lib/supabase"
import VehicleCard from "./vehicle-card"

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"]

interface PaceJobsProps {
  refreshTrigger?: number
  onVehiclesUpdated?: () => void
  onAddVehicleClick?: () => void
  onFocusedChange?: (isFocused: boolean) => void
}

export default function PaceJobs({
  refreshTrigger,
  onVehiclesUpdated,
  onAddVehicleClick,
  onFocusedChange,
}: PaceJobsProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [focusedVehicleId, setFocusedVehicleId] = useState<string | null>(null)

  const fetchVehicles = useCallback(async () => {
    setError(null)
    const { data, error: dbError } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false })

    if (dbError) {
      setError(dbError.message)
    } else {
      setVehicles((data as Vehicle[]) ?? [])
    }
    setLoading(false)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is an intentional refetch signal, not read inside the effect.
  useEffect(() => {
    setLoading(true)
    fetchVehicles()
  }, [fetchVehicles, refreshTrigger])

  const handleVehicleUpdated = () => {
    fetchVehicles()
    onVehiclesUpdated?.()
  }

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort(
      (a, b) => STATUS_ORDER[getDisplayStatus(a)] - STATUS_ORDER[getDisplayStatus(b)]
    )
  }, [vehicles])

  const MAX_JOBS = 12
  const displayedVehicles = useMemo(() => sortedVehicles.slice(0, MAX_JOBS), [sortedVehicles])
  const focusedVehicle = vehicles.find(vehicle => vehicle.id === focusedVehicleId) ?? null

  useEffect(() => {
    if (focusedVehicleId && !focusedVehicle) {
      setFocusedVehicleId(null)
    }
  }, [focusedVehicle, focusedVehicleId])

  useEffect(() => {
    onFocusedChange?.(Boolean(focusedVehicle))
    return () => {
      onFocusedChange?.(false)
    }
  }, [focusedVehicle, onFocusedChange])

  return (
    <div
      className={focusedVehicle ? "h-full min-h-0 flex flex-col" : "space-y-6"}
      id="pace-jobs-container"
    >
      {/* Error Notice */}
      {error && (
        <div className="border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-xs font-mono flex items-center justify-between">
          <span>Failed to load vehicles: {error}</span>
          <Button variant="outline" size="xs" onClick={fetchVehicles}>
            Retry
          </Button>
        </div>
      )}

      {/* Grid of Vehicle Cards */}
      {!focusedVehicle &&
        (loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKELETON_KEYS.map(key => (
              <div
                key={key}
                className="border border-border bg-muted/30 p-4 min-h-175px flex flex-col justify-between animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="h-2.5 bg-muted w-16" />
                    <div className="h-6 bg-muted w-28" />
                  </div>
                  <div className="h-5 bg-muted w-20" />
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-muted w-14" />
                  <div className="h-4 bg-muted w-14" />
                  <div className="h-4 bg-muted w-14" />
                </div>
                <div className="h-7 bg-muted w-full" />
              </div>
            ))}
          </div>
        ) : displayedVehicles.length === 0 ? (
          <Card className="border-border py-16 text-center">
            <CardContent className="flex flex-col items-center justify-center gap-2">
              <LayoutGrid className="size-8 text-muted-foreground/40 mb-1" />
              <div className="font-heading uppercase text-sm font-semibold tracking-wider text-foreground">
                No Vehicles In This View
              </div>
              <p className="text-xs text-muted-foreground font-mono max-w-sm">
                No vehicle jobs are currently registered. Use the Intake form to register a new
                vehicle.
              </p>
              {onAddVehicleClick && (
                <Button size="xs" onClick={onAddVehicleClick} className="mt-3 gap-1 font-mono">
                  <Plus className="size-3" />
                  <span>Open Intake Sheet</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedVehicles.map(vehicle => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onUpdated={handleVehicleUpdated}
                  onOpenFocus={() => setFocusedVehicleId(vehicle.id)}
                />
              ))}
            </div>
          </div>
        ))}

      {focusedVehicle && (
        <div className="flex flex-1 min-h-0 h-full flex-col overflow-hidden animate-in fade-in duration-200 gap-3">
          {/* Focused View Header Bar */}
          <div className="flex items-center justify-between shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFocusedVehicleId(null)}
              aria-label="Back to all jobs"
              className="gap-2 font-mono text-xs uppercase tracking-wider h-8"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Jobs</span>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground hidden sm:inline">
                Focused Job
              </span>
              <span className="font-mono text-xs font-bold text-foreground bg-muted px-2.5 py-0.5 border border-border">
                {focusedVehicle.license_plate}
              </span>
            </div>
          </div>

          {/* Focused Vehicle Card Container */}
          <div className="min-h-0 flex-1 flex flex-col">
            <VehicleCard
              key={`focused-${focusedVehicle.id}`}
              vehicle={focusedVehicle}
              onUpdated={handleVehicleUpdated}
              isFocused
              onCloseFocus={() => setFocusedVehicleId(null)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
