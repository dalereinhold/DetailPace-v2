import { ArrowLeft, LayoutGrid, Plus } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { getDisplayStatus, STATUS_ORDER } from "@/lib/pace/vehicle"
import { supabase, type Vehicle } from "@/lib/supabase"
import VehicleCard from "./vehicle-card"

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"]

interface PaceJobsProps {
  refreshTrigger?: number
  onVehiclesUpdated?: () => void
  onAddVehicleClick?: () => void
}

export default function PaceJobs({
  refreshTrigger,
  onVehiclesUpdated,
  onAddVehicleClick,
}: PaceJobsProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [focusedVehicleId, setFocusedVehicleId] = useState<string | null>(null)
  const isMobile = useIsMobile()

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

  return (
    <div className="space-y-6" id="pace-jobs-container">
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
                  onOpenFocus={isMobile ? () => setFocusedVehicleId(vehicle.id) : undefined}
                />
              ))}
            </div>
          </div>
        ))}

      {isMobile && focusedVehicle && (
        <div className="flex h-[calc(100dvh-11rem)] min-h-0 flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFocusedVehicleId(null)}
              aria-label="Close focused vehicle view"
              className="size-9 shrink-0"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <p className="font-heading text-sm font-bold uppercase tracking-wider">Focused Job</p>
              <p className="font-mono text-xs text-muted-foreground">
                {focusedVehicle.license_plate}
              </p>
            </div>
          </div>
          <div className="min-h-0 flex-1 py-6">
            <VehicleCard
              key={`focused-${focusedVehicle.id}`}
              vehicle={focusedVehicle}
              onUpdated={handleVehicleUpdated}
              isFocused
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
