import {
	BarChart3,
	Car,
	Check,
	ClipboardList,
	ClockCheck,
	Menu,
	Moon,
	Plus,
	Sparkles,
	Sun,
	Timer,
} from "lucide-react";
import React, { useState } from "react";
import PaceIntake from "@/components/pace/pace-intake";
import PaceJobs from "@/components/pace/pace-jobs";
import PaceRecords from "@/components/pace/pace-records";
import PaceStats from "@/components/pace/pace-stats";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from "@/components/ui/menubar";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type ActiveTab = "jobs" | "intake" | "records" | "stats";

export default function App() {
	const [activeTab, setActiveTab] = useState<ActiveTab>("jobs");
	const [isIntakeOpen, setIsIntakeOpen] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const { resolvedTheme, toggleTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const isMobile = useIsMobile();

	const triggerRefresh = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	const getActiveTabLabel = () => {
		switch (activeTab) {
			case "jobs":
				return "Jobs";
			case "intake":
				return "Intake";
			case "records":
				return "Records";
			case "stats":
				return "Metrics";
		}
	};

	return (
		<div
			id="detailpace-app-root"
			className="min-h-screen bg-background text-foreground transition-colors duration-200"
		>
			{/* Top Navigation & Brand Header */}
			<header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
					{/* Brand Logo & Heading */}
					<div
						onClick={() => setActiveTab("jobs")}
						className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
					>
						<div className="size-9 bg-primary flex items-center justify-center text-primary-foreground shadow-xs shrink-0 group-hover:opacity-90 transition-opacity">
							<ClockCheck className="size-5" />
						</div>
						<div>
							<h1 className="font-heading text-base font-bold tracking-wider uppercase text-foreground leading-none">
								DetailPace
							</h1>
							<p className="text-xs text-muted-foreground font-mono mt-1">
								Detailing Tracker &amp; Metrics
							</p>
						</div>
					</div>

					{/* Menubar & Separate Quick Intake Button (Desktop only, mobile uses bottom nav) */}
					{!isMobile && (
						<div className="flex items-center gap-2 sm:gap-3 shrink-0">
							{/* Shadcn Menubar with Jobs, Intake, Records, Metrics, and Theme Toggle */}
							<Menubar
								id="main-menubar"
								className="h-9 rounded-none border border-border bg-muted/80 px-1 py-1"
							>
								<MenubarMenu>
									<MenubarTrigger
										id="menubar-nav-trigger"
										className="gap-1.5 h-7 px-2.5 text-xs font-mono font-semibold uppercase tracking-wider"
										aria-label="Navigation and Settings Menu"
									>
										<Menu className="size-3.5" />
										<span className="hidden xs:inline">Menu</span>
										<span className="text-[10px] text-muted-foreground font-normal ml-0.5 hidden md:inline">
											({getActiveTabLabel()})
										</span>
									</MenubarTrigger>

									<MenubarContent align="end" className="min-w-56 font-mono">
										<MenubarLabel>Navigation Views</MenubarLabel>
										<MenubarItem
											id="menu-item-jobs"
											onClick={() => setActiveTab("jobs")}
											className={`gap-2 cursor-pointer ${
												activeTab === "jobs"
													? "bg-accent text-accent-foreground font-bold"
													: ""
											}`}
										>
											<Timer className="size-3.5 text-primary" />
											<span className="flex-1">Jobs</span>
											{activeTab === "jobs" && (
												<Check className="size-3 text-primary stroke-[3]" />
											)}
											<MenubarShortcut>⌘1</MenubarShortcut>
										</MenubarItem>

										<MenubarItem
											id="menu-item-intake"
											onClick={() => setActiveTab("intake")}
											className={`gap-2 cursor-pointer ${
												activeTab === "intake"
													? "bg-accent text-accent-foreground font-bold"
													: ""
											}`}
										>
											<Car className="size-3.5 text-primary" />
											<span className="flex-1">Intake</span>
											{activeTab === "intake" && (
												<Check className="size-3 text-primary stroke-[3]" />
											)}
											<MenubarShortcut>⌘2</MenubarShortcut>
										</MenubarItem>

										<MenubarItem
											id="menu-item-records"
											onClick={() => setActiveTab("records")}
											className={`gap-2 cursor-pointer ${
												activeTab === "records"
													? "bg-accent text-accent-foreground font-bold"
													: ""
											}`}
										>
											<ClipboardList className="size-3.5 text-primary" />
											<span className="flex-1">Records</span>
											{activeTab === "records" && (
												<Check className="size-3 text-primary stroke-[3]" />
											)}
											<MenubarShortcut>⌘3</MenubarShortcut>
										</MenubarItem>

										<MenubarItem
											id="menu-item-metrics"
											onClick={() => setActiveTab("stats")}
											className={`gap-2 cursor-pointer ${
												activeTab === "stats"
													? "bg-accent text-accent-foreground font-bold"
													: ""
											}`}
										>
											<BarChart3 className="size-3.5 text-primary" />
											<span className="flex-1">Metrics</span>
											{activeTab === "stats" && (
												<Check className="size-3 text-primary stroke-[3]" />
											)}
											<MenubarShortcut>⌘4</MenubarShortcut>
										</MenubarItem>

										<MenubarSeparator />

										<MenubarLabel>Appearance</MenubarLabel>
										<MenubarItem
											id="menu-item-theme"
											onClick={toggleTheme}
											className="gap-2 cursor-pointer"
										>
											{isDark ? (
												<Sun className="size-3.5 text-amber-500" />
											) : (
												<Moon className="size-3.5 text-sky-500" />
											)}
											<span className="flex-1">
												{isDark ? "Light Mode" : "Dark Mode"}
											</span>
											<MenubarShortcut>D</MenubarShortcut>
										</MenubarItem>
									</MenubarContent>
								</MenubarMenu>
							</Menubar>

							{/* Dedicated Quick Intake Button (Opens Quick Add Sheet) */}
							<Button
								id="header-intake-btn"
								size="sm"
								onClick={() => setIsIntakeOpen(true)}
								className="gap-1.5 font-mono text-xs uppercase tracking-wider h-9 shadow-xs"
							>
								<Plus className="size-3.5 stroke-[2.5]" />
								<span>Quick Intake</span>
							</Button>
						</div>
					)}
				</div>
			</header>

			{/* Main View Area */}
			<main
				className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${
					isMobile ? "pb-24" : "pb-8"
				}`}
			>
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
						<PaceIntake
							onVehicleAdded={triggerRefresh}
							onCancel={() => setActiveTab("jobs")}
						/>
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
						<PaceStats
							refreshTrigger={refreshTrigger}
							onRefresh={triggerRefresh}
						/>
					</div>
				)}
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
						{isDark ? (
							<Sun className="size-4.5 mb-0.5" />
						) : (
							<Moon className="size-4.5 mb-0.5" />
						)}
						<span className="text-[10px] uppercase tracking-wider">{isDark ? "Light" : "Dark"}</span>
					</button>
				</nav>
			)}

			{/* Quick Vehicle Intake Drawer Sheet */}
			<Sheet open={isIntakeOpen} onOpenChange={setIsIntakeOpen}>
				<SheetContent
					side={isMobile ? "bottom" : "right"}
					className={`w-full overflow-y-auto p-6 sm:p-8 ${
						isMobile
							? "max-h-[85vh] rounded-t-lg"
							: "data-[side=right]:sm:max-w-md sm:max-w-md"
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

					<div className="pt-6">
						<PaceIntake
							isSheet={true}
							onVehicleAdded={() => {
								triggerRefresh();
								setIsIntakeOpen(false);
							}}
							onCancel={() => setIsIntakeOpen(false)}
							onNavigateToFullIntake={() => {
								setIsIntakeOpen(false);
								setActiveTab("intake");
							}}
						/>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
