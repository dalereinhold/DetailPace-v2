import type { User } from "@supabase/supabase-js"
import {
  BarChart3,
  Car,
  ClipboardList,
  ClockCheck,
  LogIn,
  Moon,
  Plus,
  Sun,
  Timer,
  UserRound,
} from "lucide-react"
import { lazy, Suspense, useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { supabase } from "@/lib/supabase"

type ActiveTab = "jobs" | "intake" | "records" | "stats"

const LoginForm = lazy(() =>
  import("@/components/login-form").then(module => ({ default: module.LoginForm }))
)
const PaceIntake = lazy(() => import("@/components/pace/pace-intake"))
const PaceJobs = lazy(() => import("@/components/pace/pace-jobs"))
const PaceRecords = lazy(() => import("@/components/pace/pace-records"))
const PaceStats = lazy(() => import("@/components/pace/pace-stats"))

function FeatureLoadingState() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="h-4 w-32 animate-pulse bg-muted" />
      <div className="h-32 w-full animate-pulse border border-border bg-muted/30" />
      <span className="sr-only">Loading view</span>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("jobs")
  const [isIntakeOpen, setIsIntakeOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isMobile = useIsMobile()

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div
      id="detailpace-app-root"
      className="min-h-screen bg-background text-foreground transition-colors duration-200"
    >
      {/* Top Navigation & Brand Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-30">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo & Heading */}
          <div className="flex items-center gap-3 shrink-0 select-none">
            <button
              type="button"
              onClick={() => setActiveTab("jobs")}
              aria-label="Go to Jobs"
              className="size-9 bg-primary flex items-center justify-center text-primary-foreground shadow-xs shrink-0 hover:opacity-90 transition-opacity cursor-pointer border-none p-0 focus:outline-none"
            >
              <ClockCheck className="size-5" />
            </button>
            <div>
              <span className="block font-heading text-base font-bold tracking-wider uppercase text-foreground leading-none">
                DetailPace
              </span>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Detailing Tracker &amp; Metrics
              </p>
            </div>
          </div>

          {/* Dedicated Quick Intake Button (Desktop only) */}
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button
                id="header-intake-btn"
                size="sm"
                onClick={() => setIsIntakeOpen(true)}
                className="gap-1.5 font-mono text-xs uppercase tracking-wider h-9 shadow-xs"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Quick Intake</span>
              </Button>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open account menu"
                    className="rounded-full focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {user.email?.slice(0, 1).toUpperCase() ?? <UserRound className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="max-w-56 truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void supabase.auth.signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                className="gap-1.5"
              >
                <Avatar size="sm" className="size-6 after:hidden">
                  <AvatarFallback>
                    <LogIn className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Sub-Header Navigation Bar */}
        {!isMobile && (
          <div className="border-t border-border bg-muted/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <nav className="flex items-center gap-1 py-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("jobs")}
                  className={`flex items-center gap-2 px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent ${
                    activeTab === "jobs"
                      ? "bg-accent text-accent-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Timer className="size-3.5 text-primary" />
                  <span>Jobs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("intake")}
                  className={`flex items-center gap-2 px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent ${
                    activeTab === "intake"
                      ? "bg-accent text-accent-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Car className="size-3.5 text-primary" />
                  <span>Intake</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("records")}
                  className={`flex items-center gap-2 px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent ${
                    activeTab === "records"
                      ? "bg-accent text-accent-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <ClipboardList className="size-3.5 text-primary" />
                  <span>Records</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("stats")}
                  className={`flex items-center gap-2 px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent ${
                    activeTab === "stats"
                      ? "bg-accent text-accent-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <BarChart3 className="size-3.5 text-primary" />
                  <span>Metrics</span>
                </button>
              </nav>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
              >
                {isDark ? (
                  <Sun className="size-3.5 text-amber-500" />
                ) : (
                  <Moon className="size-3.5 text-sky-500" />
                )}
                <span>{isDark ? "Light" : "Dark"}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main View Area */}
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${
          isMobile ? "pb-24" : "pb-8"
        }`}
      >
        <Suspense fallback={<FeatureLoadingState />}>
          {/* VIEW 1: JOBS (Active Tab On Load) */}
          {activeTab === "jobs" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PaceJobs
                refreshTrigger={refreshTrigger}
                onVehiclesUpdated={triggerRefresh}
                onAddVehicleClick={() => setIsIntakeOpen(true)}
              />
            </div>
          )}

          {/* VIEW 2: INTAKE (Full Tab Registration Page) */}
          {activeTab === "intake" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PaceIntake onVehicleAdded={triggerRefresh} onCancel={() => setActiveTab("jobs")} />
            </div>
          )}

          {/* VIEW 3: RECORDS (Fleet Data-Table) */}
          {activeTab === "records" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PaceRecords
                refreshTrigger={refreshTrigger}
                onRefresh={triggerRefresh}
                onAddVehicleClick={() => setIsIntakeOpen(true)}
              />
            </div>
          )}

          {/* VIEW 4: METRICS (Fleet & Service Metrics) */}
          {activeTab === "stats" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PaceStats refreshTrigger={refreshTrigger} onRefresh={triggerRefresh} />
            </div>
          )}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar (Full Width App Style) */}
      {isMobile && (
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-1.5 py-1 flex items-center justify-around shadow-lg pb-[max(0.35rem,env(safe-area-inset-bottom))]"
        >
          {/* Jobs Tab */}
          <button
            id="mobile-nav-jobs"
            type="button"
            onClick={() => setActiveTab("jobs")}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-xs font-mono transition-colors ${
              activeTab === "jobs"
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Timer className="size-4.5 mb-0.5" />
            <span className="text-[10px] uppercase tracking-wider">Jobs</span>
          </button>

          {/* Records Tab */}
          <button
            id="mobile-nav-records"
            type="button"
            onClick={() => setActiveTab("records")}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-xs font-mono transition-colors ${
              activeTab === "records"
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="size-4.5 mb-0.5" />
            <span className="text-[10px] uppercase tracking-wider">Records</span>
          </button>

          {/* Center Quick Intake Action Button (Opens Quick Intake Sheet) */}
          <button
            id="mobile-nav-intake"
            type="button"
            onClick={() => setIsIntakeOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-xs font-mono text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-xs mx-1"
          >
            <Plus className="size-4.5 mb-0.5 stroke-[2.5]" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Quick</span>
          </button>

          {/* Metrics Tab */}
          <button
            id="mobile-nav-metrics"
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-xs font-mono transition-colors ${
              activeTab === "stats"
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="size-4.5 mb-0.5" />
            <span className="text-[10px] uppercase tracking-wider">Metrics</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            id="mobile-nav-theme"
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-4.5 mb-0.5" /> : <Moon className="size-4.5 mb-0.5" />}
            <span className="text-[10px] uppercase tracking-wider">
              {isDark ? "Light" : "Dark"}
            </span>
          </button>
        </nav>
      )}

      {/* Quick Vehicle Intake Drawer Sheet */}
      <Sheet open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="w-full overflow-y-auto p-6 sm:max-w-md sm:p-8"
        >
          <SheetHeader className="p-0 pb-5">
            <SheetTitle>Account Login</SheetTitle>
            <SheetDescription>Sign in with your email to manage DetailPace.</SheetDescription>
          </SheetHeader>
          <Suspense fallback={<FeatureLoadingState />}>
            {isLoginOpen && <LoginForm onSuccess={() => setIsLoginOpen(false)} />}
          </Suspense>
        </SheetContent>
      </Sheet>

      <Sheet open={isIntakeOpen} onOpenChange={setIsIntakeOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={`w-full overflow-y-auto p-6 sm:p-8 ${
            isMobile ? "max-h-[85vh]" : "data-[side=right]:sm:max-w-md sm:max-w-md"
          }`}
        >
          <SheetHeader className="p-0 pb-5 border-b border-border">
            <SheetTitle className="font-heading uppercase tracking-wider text-base font-bold flex items-center gap-2">
              <Car className="size-4 text-primary" />
              <span>Quick Vehicle Intake</span>
            </SheetTitle>
            <SheetDescription className="font-mono text-xs text-muted-foreground">
              Fast check-in with auto-assigned condition and service package presets.
            </SheetDescription>
          </SheetHeader>

          <Suspense fallback={<FeatureLoadingState />}>
            {isIntakeOpen && (
              <div className="pt-6">
                <PaceIntake
                  isSheet={true}
                  onVehicleAdded={() => {
                    triggerRefresh()
                    setIsIntakeOpen(false)
                  }}
                  onCancel={() => setIsIntakeOpen(false)}
                  onNavigateToFullIntake={() => {
                    setIsIntakeOpen(false)
                    setActiveTab("intake")
                  }}
                />
              </div>
            )}
          </Suspense>
        </SheetContent>
      </Sheet>
    </div>
  )
}
