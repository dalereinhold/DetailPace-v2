import { Check, ChevronRight, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export interface UserMember {
	id: string;
	name: string;
	email: string;
	role: "Admin" | "Developer" | "Designer" | "Viewer";
	status: "Active" | "Pending" | "Inactive";
	avatarUrl?: string;
	initials: string;
	lastActive: string;
	twoFactor: boolean;
}

const initialUsers: UserMember[] = [
	{
		id: "usr-1",
		name: "Elena Rostova",
		email: "elena.r@example.com",
		role: "Admin",
		status: "Active",
		initials: "ER",
		lastActive: "2 mins ago",
		twoFactor: true,
	},
	{
		id: "usr-2",
		name: "Marcus Chen",
		email: "marcus.c@example.com",
		role: "Developer",
		status: "Active",
		initials: "MC",
		lastActive: "1 hour ago",
		twoFactor: true,
	},
	{
		id: "usr-3",
		name: "Aria Thorne",
		email: "aria.t@example.com",
		role: "Designer",
		status: "Pending",
		initials: "AT",
		lastActive: "Yesterday",
		twoFactor: false,
	},
	{
		id: "usr-4",
		name: "Kaelen Voss",
		email: "kaelen.v@example.com",
		role: "Developer",
		status: "Inactive",
		initials: "KV",
		lastActive: "3 days ago",
		twoFactor: false,
	},
	{
		id: "usr-5",
		name: "Saffron Bell",
		email: "saffron.b@example.com",
		role: "Viewer",
		status: "Active",
		initials: "SB",
		lastActive: "Just now",
		twoFactor: true,
	},
];

export default function UiKitShowcase() {
	const [users, setUsers] = useState<UserMember[]>(initialUsers);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<UserMember | null>(null);
	const [autoSync, setAutoSync] = useState(false);
	const [enableNotifications, setEnableNotifications] = useState(true);

	const filteredUsers = users.filter(
		(u) =>
			u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			u.role.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleDeleteUser = (id: string) => {
		setUsers((prev) => prev.filter((u) => u.id !== id));
		if (selectedUser?.id === id) {
			setSelectedUser(null);
		}
	};

	return (
		<div className="space-y-10 animate-in fade-in duration-200">
			{/* Intro banner */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight font-heading uppercase">
						Component Registry Matrix
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Demonstrating Radix primitives styled with the radix-sera preset
						theme tokens and unified design tokens.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<AvatarGroup>
						{users.slice(0, 4).map((u) => (
							<Avatar key={u.id} size="sm">
								<AvatarFallback>{u.initials}</AvatarFallback>
							</Avatar>
						))}
						{users.length > 4 && (
							<AvatarGroupCount>+{users.length - 4}</AvatarGroupCount>
						)}
					</AvatarGroup>
					<div className="text-xs text-muted-foreground font-mono">
						{users.length} active seats
					</div>
				</div>
			</div>

			{/* Section 1: Interactive Table & Member Management */}
			<section id="section-table-data" className="space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<span className="font-heading text-sm font-semibold tracking-wider uppercase">
							Team Directory (Table Component)
						</span>
						<Badge variant="secondary">{filteredUsers.length} entries</Badge>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative w-64">
							<Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
							<input
								id="user-search-input"
								type="text"
								placeholder="Filter name, email, role..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full h-9 pl-9 pr-3 text-xs border border-input bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						{searchQuery && (
							<Button
								variant="ghost"
								size="xs"
								onClick={() => setSearchQuery("")}
							>
								Clear
							</Button>
						)}
					</div>
				</div>

				<Card className="border-border">
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-64">User &amp; Avatar</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role (Badge)</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>2FA (Switch)</TableHead>
									<TableHead>Last Active</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={7}
											className="h-32 text-center text-muted-foreground"
										>
											No team members matching &ldquo;{searchQuery}&rdquo;
										</TableCell>
									</TableRow>
								) : (
									filteredUsers.map((member) => (
										<TableRow
											key={member.id}
											className="hover:bg-muted/40 transition-colors"
										>
											<TableCell className="font-medium">
												<div className="flex items-center gap-3">
													<Avatar size="default">
														<AvatarFallback>{member.initials}</AvatarFallback>
														{member.status === "Active" && <AvatarBadge />}
													</Avatar>
													<div>
														<div className="font-semibold text-foreground text-xs uppercase tracking-wide">
															{member.name}
														</div>
														<div className="text-[11px] text-muted-foreground font-mono">
															{member.id}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell className="font-mono text-xs text-muted-foreground">
												{member.email}
											</TableCell>
											<TableCell>
												<Badge
													variant={
														member.role === "Admin"
															? "default"
															: member.role === "Developer"
																? "secondary"
																: member.role === "Designer"
																	? "outline"
																	: "ghost"
													}
												>
													{member.role}
												</Badge>
											</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center gap-1.5 text-xs font-mono ${
														member.status === "Active"
															? "text-emerald-600 dark:text-emerald-400"
															: member.status === "Pending"
																? "text-amber-600 dark:text-amber-400"
																: "text-muted-foreground"
													}`}
												>
													<span
														className={`size-1.5 rounded-full ${
															member.status === "Active"
																? "bg-emerald-500"
																: member.status === "Pending"
																	? "bg-amber-500"
																	: "bg-muted-foreground"
														}`}
													/>
													{member.status}
												</span>
											</TableCell>
											<TableCell>
												<Switch
													size="sm"
													checked={member.twoFactor}
													onCheckedChange={(val) => {
														setUsers((prev) =>
															prev.map((u) =>
																u.id === member.id
																	? { ...u, twoFactor: val }
																	: u,
															),
														);
													}}
												/>
											</TableCell>
											<TableCell className="text-xs text-muted-foreground font-mono">
												{member.lastActive}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="icon-xs"
														onClick={() => setSelectedUser(member)}
														title="Inspect Details"
													>
														<ChevronRight className="size-3.5" />
													</Button>
													<Button
														variant="destructive"
														size="icon-xs"
														onClick={() => handleDeleteUser(member.id)}
														title="Remove Member"
													>
														<Trash2 className="size-3" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
							<TableFooter>
								<TableRow>
									<TableCell colSpan={4} className="font-mono text-xs">
										Total Allocated Licenses
									</TableCell>
									<TableCell
										colSpan={3}
										className="text-right font-mono text-xs font-bold"
									>
										{users.length} / 25
									</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					</CardContent>
					<CardFooter className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-4 font-mono">
						<span>Showing {filteredUsers.length} records</span>
						<span>Updated live in client state</span>
					</CardFooter>
				</Card>
			</section>

			{/* Section 2: Card, Field, Form & Control Components */}
			<section
				id="section-form-cards"
				className="grid grid-cols-1 lg:grid-cols-2 gap-8"
			>
				{/* Card 1: Field System & Label Showcase */}
				<Card className="border-border">
					<CardHeader className="border-b border-border pb-4">
						<CardTitle>Field &amp; Label System</CardTitle>
						<CardDescription>
							Radix accessible form primitives with Field, FieldLabel,
							FieldLegend &amp; FieldDescription.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<FieldSet className="space-y-6">
							<FieldLegend variant="legend">
								Organization Preferences
							</FieldLegend>

							<FieldGroup className="gap-6">
								<Field>
									<FieldLabel htmlFor="org-slug">
										Workspace Identifier
									</FieldLabel>
									<input
										id="org-slug"
										type="text"
										defaultValue="engineering-core"
										className="w-full h-10 px-3 border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
									/>
									<FieldDescription>
										Unique subdomain namespace for team collaboration.
									</FieldDescription>
								</Field>

								<FieldSeparator>Security Controls</FieldSeparator>

								<Field
									orientation="horizontal"
									className="justify-between items-center"
								>
									<FieldContent>
										<FieldTitle>Automated Sync</FieldTitle>
										<FieldDescription>
											Periodically sync repository hooks and deployment
											webhooks.
										</FieldDescription>
									</FieldContent>
									<Switch
										id="pref-sync-switch"
										checked={autoSync}
										onCheckedChange={setAutoSync}
									/>
								</Field>

								<Field
									orientation="horizontal"
									className="justify-between items-center"
								>
									<FieldContent>
										<FieldTitle>Email Digest Notifications</FieldTitle>
										<FieldDescription>
											Receive weekly security and access audit logs.
										</FieldDescription>
									</FieldContent>
									<Switch
										id="pref-notif-switch"
										checked={enableNotifications}
										onCheckedChange={setEnableNotifications}
									/>
								</Field>
							</FieldGroup>
						</FieldSet>
					</CardContent>
					<CardFooter className="border-t border-border pt-4 flex justify-between">
						<span className="text-xs text-muted-foreground font-mono">
							Status: Synced
						</span>
						<Button size="sm" variant="default" className="gap-1.5">
							<Check className="size-3.5" />
							<span>Save Changes</span>
						</Button>
					</CardFooter>
				</Card>

				{/* Card 2: Button, Badge & Avatar Variants */}
				<Card className="border-border">
					<CardHeader className="border-b border-border pb-4">
						<CardTitle>Design Tokens &amp; Variants</CardTitle>
						<CardDescription>
							Visual demonstration of Button, Badge, Avatar and Separator
							variants.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6 space-y-6">
						{/* Button Variants */}
						<div>
							<Label className="text-muted-foreground mb-3">
								Button Variants
							</Label>
							<div className="flex flex-wrap gap-2 pt-1">
								<Button variant="default" size="sm">
									Primary
								</Button>
								<Button variant="secondary" size="sm">
									Secondary
								</Button>
								<Button variant="outline" size="sm">
									Outline
								</Button>
								<Button variant="ghost" size="sm">
									Ghost
								</Button>
								<Button variant="destructive" size="sm">
									Destructive
								</Button>
								<Button variant="link" size="sm">
									Link
								</Button>
							</div>
						</div>

						<Separator />

						{/* Badge Variants */}
						<div>
							<Label className="text-muted-foreground mb-3">
								Badge Variants
							</Label>
							<div className="flex flex-wrap gap-4 pt-1 items-center">
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-muted-foreground">
										Default:
									</span>
									<Badge variant="default">Production</Badge>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-muted-foreground">
										Secondary:
									</span>
									<Badge variant="secondary">Staging</Badge>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-muted-foreground">
										Destructive:
									</span>
									<Badge variant="destructive">Critical</Badge>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-muted-foreground">
										Outline:
									</span>
									<Badge variant="outline">Preview</Badge>
								</div>
							</div>
						</div>

						<Separator />

						{/* Avatar Sizes & States */}
						<div>
							<Label className="text-muted-foreground mb-3">
								Avatar Sizes &amp; Badges
							</Label>
							<div className="flex items-center gap-6 pt-1">
								<div className="flex items-center gap-2">
									<Avatar size="sm">
										<AvatarFallback>SM</AvatarFallback>
									</Avatar>
									<span className="text-xs font-mono text-muted-foreground">
										Small (24px)
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Avatar size="default">
										<AvatarFallback>DF</AvatarFallback>
										<AvatarBadge />
									</Avatar>
									<span className="text-xs font-mono text-muted-foreground">
										Default (32px)
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Avatar size="lg">
										<AvatarFallback>LG</AvatarFallback>
										<AvatarBadge />
									</Avatar>
									<span className="text-xs font-mono text-muted-foreground">
										Large (40px)
									</span>
								</div>
							</div>
						</div>
					</CardContent>
					<CardFooter className="border-t border-border pt-4 flex justify-between">
						<span className="text-xs text-muted-foreground font-mono">
							radix-sera style active
						</span>
						<Badge variant="outline">Radix Base</Badge>
					</CardFooter>
				</Card>
			</section>

			{/* Section 3: Detailed Selected Member Inspection Card */}
			{selectedUser && (
				<section
					id="section-inspector"
					className="animate-in fade-in duration-200"
				>
					<Card className="border-primary/40 bg-primary/5">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<div>
								<CardTitle className="text-sm">
									Inspecting: {selectedUser.name}
								</CardTitle>
								<CardDescription className="font-mono text-xs">
									ID: {selectedUser.id} &bull; Email: {selectedUser.email}
								</CardDescription>
							</div>
							<CardAction>
								<Button
									variant="ghost"
									size="xs"
									onClick={() => setSelectedUser(null)}
								>
									Close Inspector
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
							<div>
								<span className="text-muted-foreground block">
									Assigned Role
								</span>
								<Badge variant="default" className="mt-1">
									{selectedUser.role}
								</Badge>
							</div>
							<div>
								<span className="text-muted-foreground block">
									Authentication
								</span>
								<span className="font-semibold">
									{selectedUser.twoFactor ? "2FA Enabled" : "Single Factor"}
								</span>
							</div>
							<div>
								<span className="text-muted-foreground block">
									Session State
								</span>
								<span className="font-semibold">{selectedUser.status}</span>
							</div>
							<div>
								<span className="text-muted-foreground block">
									Activity Timestamp
								</span>
								<span className="font-semibold">{selectedUser.lastActive}</span>
							</div>
						</CardContent>
					</Card>
				</section>
			)}
		</div>
	);
}
