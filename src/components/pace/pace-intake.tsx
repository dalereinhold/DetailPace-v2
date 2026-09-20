import {
	AlertCircle,
	ArrowRight,
	Car,
	Check,
	CheckCircle2,
	Clock,
	ExternalLink,
	Plus,
	RotateCcw,
	Sparkles,
	Zap,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import {
	CONDITION_COLORS,
	FALLBACK_BADGE_COLOR,
	SERVICE_TYPE_COLORS,
	TYPE_COLORS,
} from "@/lib/pace/colors";
import {
	DEFAULTS_BY_VEHICLE_TYPE,
	formatLicensePlateInput,
	isValidSwedishPlate,
	VEHICLE_CONDITIONS,
	VEHICLE_TYPES,
} from "@/lib/pace/intake";
import { SERVICE_TYPES } from "@/lib/pace/services";
import { formatSecondsToClock } from "@/lib/pace/vehicle";
import {
	supabase,
	type VehicleCondition,
	type VehicleServiceType,
	type VehicleType,
} from "@/lib/supabase";

interface IntakeFormProps {
	onVehicleAdded: () => void;
	onCancel?: () => void;
	isSheet?: boolean;
	onNavigateToFullIntake?: () => void;
}

export default function PaceIntake({
	onVehicleAdded,
	onCancel,
	isSheet = false,
	onNavigateToFullIntake,
}: IntakeFormProps) {
	// Form state
	const [licensePlate, setLicensePlate] = useState("");
	const [type, setType] = useState<VehicleType>("New");
	const [condition, setCondition] = useState<VehicleCondition>("Excellent");
	const [serviceType, setServiceType] =
		useState<VehicleServiceType>("Full Detail");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastRegisteredPlate, setLastRegisteredPlate] = useState<string | null>(
		null,
	);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleLicensePlateChange = (val: string) => {
		setLicensePlate(formatLicensePlateInput(val));
		if (error) setError(null);
	};

	const handleTypeChange = (newType: VehicleType) => {
		setType(newType);
		const defaults = DEFAULTS_BY_VEHICLE_TYPE[newType];
		if (defaults) {
			setCondition(defaults.condition);
			setServiceType(defaults.serviceType);
		}
	};

	const handleQuickAddSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedPlate = licensePlate.trim().toUpperCase();

		if (!trimmedPlate) {
			setError("License plate identifier is required.");
			return;
		}

		if (!isValidSwedishPlate(trimmedPlate)) {
			setError(
				"Please enter a valid format: 3 letters + 2 digits + 1 alphanumeric (e.g. ABC 123 or ABC 12A).",
			);
			return;
		}

		setLoading(true);
		setError(null);

		// Auto-selected condition and service type based on vehicle class
		const autoDefaults = DEFAULTS_BY_VEHICLE_TYPE[type] || {
			condition: "Excellent",
			serviceType: "Full Detail",
		};

		const { error: dbError } = await supabase.from("vehicles").insert({
			license_plate: trimmedPlate,
			type,
			condition: autoDefaults.condition,
			service_type: autoDefaults.serviceType,
			notes: null,
			status: "In Progress",
			net_work_seconds: 0,
			started_at: null,
			break_started_at: null,
		});

		setLoading(false);

		if (dbError) {
			setError(dbError.message);
			return;
		}

		setLicensePlate("");
		setType("New");
		onVehicleAdded();
	};

	const handleFullSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedPlate = licensePlate.trim().toUpperCase();

		if (!trimmedPlate) {
			setError("License plate identifier is required.");
			return;
		}

		if (!isValidSwedishPlate(trimmedPlate)) {
			setError(
				"Please enter a valid format: 3 letters + 2 digits + 1 alphanumeric (e.g. ABC 123 or ABC 12A).",
			);
			return;
		}

		setLoading(true);
		setError(null);
		setSuccessMessage(null);

		const { error: dbError } = await supabase.from("vehicles").insert({
			license_plate: trimmedPlate,
			type,
			condition,
			service_type: serviceType,
			notes: notes.trim() || null,
			status: "In Progress",
			net_work_seconds: 0,
			started_at: null,
			break_started_at: null,
		});

		setLoading(false);

		if (dbError) {
			setError(dbError.message);
			return;
		}

		setLastRegisteredPlate(trimmedPlate);
		setSuccessMessage(
			`Vehicle ${trimmedPlate} successfully registered and added to active queue!`,
		);
		setLicensePlate("");
		setNotes("");
		setType("New");
		setCondition("Excellent");
		setServiceType("Full Detail");

		onVehicleAdded();
	};

	const isPlateValid =
		licensePlate.length >= 7 && isValidSwedishPlate(licensePlate);

	// QUICK ADD INTAKE (For Sheet / Drawer Modal)
	if (isSheet) {
		const autoDefaults = DEFAULTS_BY_VEHICLE_TYPE[type] || {
			condition: "Excellent" as VehicleCondition,
			serviceType: "Full Detail" as VehicleServiceType,
		};
		const autoService = SERVICE_TYPES.find(
			(s) => s.name === autoDefaults.serviceType,
		);

		return (
			<form
				onSubmit={handleQuickAddSubmit}
				className="space-y-6"
				id="pace-quick-intake-form"
			>
				<FieldSet className="space-y-5">
					<FieldGroup className="gap-5">
						{/* License Plate Field */}
						<Field>
							<div className="flex items-center justify-between">
								<FieldLabel htmlFor="quick-license-plate-input">
									License Plate
								</FieldLabel>
								{licensePlate && (
									<span
										className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
											isPlateValid
												? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
												: "bg-amber-500/10 text-amber-600 border-amber-500/30"
										}`}
									>
										{isPlateValid ? "Valid Format" : "Invalid Format"}
									</span>
								)}
							</div>
							<input
								id="quick-license-plate-input"
								type="text"
								placeholder="ABC 123"
								autoFocus
								value={licensePlate}
								onChange={(e) => handleLicensePlateChange(e.target.value)}
								maxLength={7}
								className="w-full h-12 px-3.5 border border-input bg-card text-foreground text-xl font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-ring"
							/>
							<FieldDescription>
								Enter Swedish registration (e.g. ABC 123 or ABC 12A).
							</FieldDescription>
						</Field>

						{/* Vehicle Class / Type Selector */}
						<Field>
							<div className="flex items-center justify-between">
								<FieldLabel>Vehicle Class</FieldLabel>
								<span className="text-[11px] font-mono text-muted-foreground">
									Auto-selects presets
								</span>
							</div>
							<div className="grid grid-cols-3 gap-2 pt-1">
								{VEHICLE_TYPES.map((t) => {
									const isSelected = type === t;
									return (
										<button
											key={t}
											type="button"
											onClick={() => handleTypeChange(t)}
											className={`h-11 px-3 border text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
												isSelected
													? "bg-primary text-primary-foreground border-primary shadow-xs"
													: "bg-card text-muted-foreground border-input hover:text-foreground hover:bg-muted/50"
											}`}
										>
											<span>{t}</span>
											{isSelected && <Check className="size-3.5 stroke-[3]" />}
										</button>
									);
								})}
							</div>
						</Field>

						{/* Auto-Selected Presets Summary Card */}
						<div className="p-4 bg-muted/40 border border-border space-y-3 font-mono text-xs">
							<div className="flex items-center gap-1.5 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
								<Zap className="size-3.5 text-amber-500" />
								<span>Auto-Configured Presets</span>
							</div>

							<div className="grid grid-cols-2 gap-2 pt-1">
								<div className="p-2.5 bg-card border border-border space-y-1">
									<span className="text-[10px] text-muted-foreground block uppercase">
										Condition Preset:
									</span>
									<span
										className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 border ${
											CONDITION_COLORS[autoDefaults.condition] ||
											FALLBACK_BADGE_COLOR
										}`}
									>
										{autoDefaults.condition}
									</span>
								</div>

								<div className="p-2.5 bg-card border border-border space-y-1">
									<span className="text-[10px] text-muted-foreground block uppercase">
										Service Preset:
									</span>
									<div className="flex items-center gap-1.5 flex-wrap">
										<span
											className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 border ${
												SERVICE_TYPE_COLORS[autoDefaults.serviceType] ||
												FALLBACK_BADGE_COLOR
											}`}
										>
											{autoDefaults.serviceType}
										</span>
										{autoService && (
											<span className="text-[10px] text-muted-foreground">
												({formatSecondsToClock(autoService.estimatedSeconds)})
											</span>
										)}
									</div>
								</div>
							</div>

							<p className="text-[11px] text-muted-foreground pt-1 leading-normal font-sans">
								Condition and service package are automatically determined by
								vehicle classification.
							</p>
						</div>
					</FieldGroup>
				</FieldSet>

				{/* Error display */}
				{error && (
					<div className="text-xs font-mono text-destructive flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 p-2.5">
						<AlertCircle className="size-3.5 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Quick Action Footer */}
				<div className="border-t border-border pt-4 flex flex-col gap-3">
					<div className="flex items-center gap-2 justify-end">
						{onCancel && (
							<Button
								variant="outline"
								size="default"
								type="button"
								onClick={onCancel}
								className="font-mono text-xs flex-1 sm:flex-none"
							>
								Cancel
							</Button>
						)}
						<Button
							type="submit"
							size="default"
							disabled={loading}
							className="gap-2 font-mono text-xs flex-1 sm:flex-none"
						>
							<Plus className="size-4 stroke-[2.5]" />
							<span>{loading ? "Registering..." : "Quick Add Vehicle"}</span>
						</Button>
					</div>

					{/* Link to Full Intake Page */}
					{onNavigateToFullIntake && (
						<button
							type="button"
							onClick={onNavigateToFullIntake}
							className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 font-mono pt-1 text-center"
						>
							<span>Need custom services or detailing notes?</span>
							<span className="font-semibold text-primary underline underline-offset-2 flex items-center gap-0.5">
								Open Full Intake Tab <ArrowRight className="size-3" />
							</span>
						</button>
					)}
				</div>
			</form>
		);
	}

	// FULL TAB INTAKE PAGE VIEW
	return (
		<div className="space-y-6" id="pace-full-intake-page">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-border">
				<div>
					<h2 className="text-lg sm:text-xl font-bold font-heading uppercase tracking-wider text-foreground flex items-center gap-2">
						<Car className="size-5 text-primary" />
						<span>Vehicle Intake Registration</span>
					</h2>
					<p className="text-xs text-muted-foreground font-mono mt-0.5">
						Comprehensive vehicle check-in with custom detailing packages,
						condition scoring, and bay notes.
					</p>
				</div>
			</div>

			{/* Success Alert Banner */}
			{successMessage && (
				<div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-4 font-mono text-xs flex items-center justify-between gap-3 animate-in fade-in">
					<div className="flex items-center gap-2">
						<CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
						<span>{successMessage}</span>
					</div>
					{lastRegisteredPlate && (
						<span className="font-bold text-xs bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/30">
							{lastRegisteredPlate}
						</span>
					)}
				</div>
			)}

			<form onSubmit={handleFullSubmit} id="pace-full-intake-form">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Form (2 cols) */}
					<div className="lg:col-span-2 space-y-6">
						<Card className="border-border">
							<CardHeader className="border-b border-border pb-4">
								<CardTitle className="text-base font-bold uppercase tracking-wider font-heading">
									Registration &amp; Specifications
								</CardTitle>
								<CardDescription className="text-xs font-mono">
									Fill in vehicle identifier and select customized package
									requirements.
								</CardDescription>
							</CardHeader>

							<CardContent className="pt-6">
								<FieldSet className="space-y-6">
									<FieldGroup className="gap-6">
										{/* License Plate Field */}
										<Field>
											<div className="flex items-center justify-between">
												<FieldLabel htmlFor="full-license-plate-input">
													License Plate (Registration Number)
												</FieldLabel>
												{licensePlate && (
													<span
														className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
															isPlateValid
																? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
																: "bg-amber-500/10 text-amber-600 border-amber-500/30"
														}`}
													>
														{isPlateValid ? "Valid Format" : "Invalid Format"}
													</span>
												)}
											</div>
											<input
												id="full-license-plate-input"
												type="text"
												placeholder="ABC 123"
												value={licensePlate}
												onChange={(e) =>
													handleLicensePlateChange(e.target.value)
												}
												maxLength={7}
												className="w-full h-12 px-3.5 border border-input bg-card text-foreground text-xl font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-ring"
											/>
											<FieldDescription>
												Standard Swedish format (e.g. ABC 123 or ABC 12A).
												Auto-formatted as you type.
											</FieldDescription>
										</Field>

										{/* Vehicle Type Selector */}
										<Field>
											<FieldLabel>Vehicle Classification</FieldLabel>
											<div className="grid grid-cols-3 gap-2.5 pt-1">
												{VEHICLE_TYPES.map((t) => (
													<button
														key={t}
														type="button"
														onClick={() => handleTypeChange(t)}
														className={`h-10 px-3 border text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
															type === t
																? "bg-primary text-primary-foreground border-primary shadow-xs"
																: "bg-card text-muted-foreground border-input hover:text-foreground hover:bg-muted/50"
														}`}
													>
														<span>{t} Vehicle</span>
														{type === t && <Check className="size-3.5" />}
													</button>
												))}
											</div>
											<FieldDescription>
												Selecting a classification sets initial recommended
												condition and service presets.
											</FieldDescription>
										</Field>

										<FieldSeparator>Detailing Specifications</FieldSeparator>

										{/* Condition Rating */}
										<Field>
											<FieldLabel>Initial Vehicle Condition</FieldLabel>
											<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
												{VEHICLE_CONDITIONS.map((c) => (
													<button
														key={c}
														type="button"
														onClick={() => setCondition(c)}
														className={`h-9 px-3 border text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
															condition === c
																? "bg-primary text-primary-foreground border-primary shadow-xs"
																: "bg-card text-muted-foreground border-input hover:text-foreground hover:bg-muted/50"
														}`}
													>
														<span>{c}</span>
													</button>
												))}
											</div>
										</Field>

										{/* Service Package */}
										<Field>
											<FieldLabel>Requested Service Package</FieldLabel>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
												{SERVICE_TYPES.map((s) => {
													const active = serviceType === s.name;
													return (
														<button
															key={s.id}
															type="button"
															onClick={() => setServiceType(s.name)}
															className={`p-3 text-left border transition-all ${
																active
																	? "bg-primary/5 border-primary shadow-xs"
																	: "bg-card border-input hover:border-border hover:bg-muted/40"
															}`}
														>
															<div className="flex items-center justify-between mb-1">
																<span
																	className={`text-xs font-bold font-mono uppercase ${
																		active ? "text-primary" : "text-foreground"
																	}`}
																>
																	{s.name}
																</span>
																<Badge
																	variant={active ? "default" : "outline"}
																	className="text-[10px] font-mono px-1.5 py-0"
																>
																	{formatSecondsToClock(s.estimatedSeconds)}
																</Badge>
															</div>
															<p className="text-[11px] text-muted-foreground line-clamp-2">
																{s.description}
															</p>
														</button>
													);
												})}
											</div>
										</Field>

										{/* Special Notes */}
										<Field>
											<FieldLabel htmlFor="full-notes-field">
												Detailing Notes &amp; Instructions
											</FieldLabel>
											<textarea
												id="full-notes-field"
												rows={3}
												placeholder="e.g. Paint correction needed on rear bumper, fragile interior trim..."
												value={notes}
												onChange={(e) => setNotes(e.target.value)}
												className="w-full p-3 text-xs border border-input bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-sans resize-none"
											/>
											<FieldDescription>
												Optional notes accessible to detailing bay technicians.
											</FieldDescription>
										</Field>
									</FieldGroup>
								</FieldSet>
							</CardContent>

							<CardFooter className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
								{error ? (
									<div className="text-xs font-mono text-destructive flex items-center gap-1.5">
										<AlertCircle className="size-3.5 shrink-0" />
										<span>{error}</span>
									</div>
								) : (
									<span className="text-xs text-muted-foreground font-mono">
										Ready to check in to active jobs queue
									</span>
								)}

								<div className="flex items-center gap-2 w-full sm:w-auto justify-end">
									{onCancel && (
										<Button
											variant="outline"
											type="button"
											onClick={onCancel}
											className="font-mono text-xs"
										>
											Cancel
										</Button>
									)}
									<Button
										type="submit"
										disabled={loading}
										className="gap-2 font-mono text-xs"
									>
										<Plus className="size-4" />
										<span>
											{loading
												? "Registering..."
												: "Register Vehicle to Fleet"}
										</span>
									</Button>
								</div>
							</CardFooter>
						</Card>
					</div>

					{/* Right Sidebar: Live Preview Card */}
					<div className="space-y-6">
						<Card className="border-border">
							<CardHeader className="border-b border-border pb-3">
								<CardTitle className="text-sm font-heading uppercase tracking-wider">
									Intake Ticket Preview
								</CardTitle>
								<CardDescription className="text-xs font-mono">
									Real-time preview of generated fleet ticket
								</CardDescription>
							</CardHeader>

							<CardContent className="pt-4 space-y-4">
								{/* Virtual Badge Card */}
								<div className="p-4 bg-muted/40 border border-border space-y-3">
									<div className="flex items-start justify-between">
										<div>
											<div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
												License Plate
											</div>
											<div className="text-2xl font-black font-mono tracking-widest text-foreground">
												{licensePlate || "ABC 123"}
											</div>
										</div>
										<Badge variant="outline" className="font-mono text-[10px]">
											STATUS: PENDING
										</Badge>
									</div>

									<div className="flex flex-wrap gap-1.5 pt-1">
										<span
											className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 border ${
												TYPE_COLORS[type] || FALLBACK_BADGE_COLOR
											}`}
										>
											{type}
										</span>
										<span
											className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 border ${
												CONDITION_COLORS[condition] || FALLBACK_BADGE_COLOR
											}`}
										>
											{condition}
										</span>
										<span
											className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 border ${
												SERVICE_TYPE_COLORS[serviceType] || FALLBACK_BADGE_COLOR
											}`}
										>
											{serviceType}
										</span>
									</div>

									{notes && (
										<div className="text-xs text-muted-foreground border-t border-border/60 pt-2 font-mono">
											<span className="text-[10px] text-muted-foreground block uppercase">
												Instructions:
											</span>
											<p className="line-clamp-3 italic text-foreground">
												&ldquo;{notes}&rdquo;
											</p>
										</div>
									)}
								</div>

								{/* Service Details info */}
								<div className="space-y-2 text-xs font-mono">
									<div className="flex justify-between py-1 border-b border-border/50">
										<span className="text-muted-foreground">
											Est. Duration:
										</span>
										<span className="font-bold text-foreground">
											{formatSecondsToClock(
												SERVICE_TYPES.find((s) => s.name === serviceType)
													?.estimatedSeconds,
											)}
										</span>
									</div>
									<div className="flex justify-between py-1 border-b border-border/50">
										<span className="text-muted-foreground">Default Bay:</span>
										<span className="font-bold text-foreground">Bay A-01</span>
									</div>
									<div className="flex justify-between py-1">
										<span className="text-muted-foreground">Database Sync:</span>
										<span className="font-bold text-emerald-600 dark:text-emerald-400">
											Live Supabase
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</form>
		</div>
	);
}

