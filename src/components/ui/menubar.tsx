"use client";

import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { Menubar as MenubarPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Menubar({
	className,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
	return (
		<MenubarPrimitive.Root
			data-slot="menubar"
			className={cn(
				"flex h-9 items-center gap-1 border border-border bg-muted/80 p-1 shadow-xs",
				className,
			)}
			{...props}
		/>
	);
}

function MenubarMenu({
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
	return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
	return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
	return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
	...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
	return (
		<MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
	);
}

function MenubarTrigger({
	className,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
	return (
		<MenubarPrimitive.Trigger
			data-slot="menubar-trigger"
			className={cn(
				"flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider select-none outline-hidden transition-colors focus:bg-background focus:text-foreground data-[state=open]:bg-background data-[state=open]:text-foreground hover:bg-background/60 hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function MenubarContent({
	className,
	align = "start",
	alignOffset = -4,
	sideOffset = 8,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
	return (
		<MenubarPortal>
			<MenubarPrimitive.Content
				data-slot="menubar-content"
				align={align}
				alignOffset={alignOffset}
				sideOffset={sideOffset}
				className={cn(
					"z-50 min-w-[12rem] overflow-hidden border border-border bg-popover p-1 text-popover-foreground shadow-md backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					className,
				)}
				{...props}
			/>
		</MenubarPortal>
	);
}

function MenubarItem({
	className,
	inset,
	variant = "default",
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
	inset?: boolean;
	variant?: "default" | "destructive";
}) {
	return (
		<MenubarPrimitive.Item
			data-slot="menubar-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"relative flex cursor-pointer select-none items-center gap-2 px-2.5 py-1.5 text-xs font-mono font-medium outline-hidden transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function MenubarCheckboxItem({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
	return (
		<MenubarPrimitive.CheckboxItem
			data-slot="menubar-checkbox-item"
			className={cn(
				"relative flex cursor-pointer select-none items-center gap-2 py-1.5 pr-2 pl-8 text-xs font-mono font-medium outline-hidden transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			checked={checked}
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<MenubarPrimitive.ItemIndicator>
					<CheckIcon className="size-3.5 stroke-[2.5]" />
				</MenubarPrimitive.ItemIndicator>
			</span>
			{children}
		</MenubarPrimitive.CheckboxItem>
	);
}

function MenubarRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
	return (
		<MenubarPrimitive.RadioItem
			data-slot="menubar-radio-item"
			className={cn(
				"relative flex cursor-pointer select-none items-center gap-2 py-1.5 pr-2 pl-8 text-xs font-mono font-medium outline-hidden transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<MenubarPrimitive.ItemIndicator>
					<CircleIcon className="size-2 fill-current" />
				</MenubarPrimitive.ItemIndicator>
			</span>
			{children}
		</MenubarPrimitive.RadioItem>
	);
}

function MenubarLabel({
	className,
	inset,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
	inset?: boolean;
}) {
	return (
		<MenubarPrimitive.Label
			data-slot="menubar-label"
			data-inset={inset}
			className={cn(
				"px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function MenubarSeparator({
	className,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
	return (
		<MenubarPrimitive.Separator
			data-slot="menubar-separator"
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function MenubarShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="menubar-shortcut"
			className={cn(
				"ml-auto text-[10px] font-mono tracking-widest text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function MenubarSub({
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
	return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
	inset?: boolean;
}) {
	return (
		<MenubarPrimitive.SubTrigger
			data-slot="menubar-sub-trigger"
			data-inset={inset}
			className={cn(
				"flex cursor-pointer select-none items-center gap-2 px-2.5 py-1.5 text-xs font-mono font-medium outline-hidden transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				inset && "pl-8",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto size-3.5 text-muted-foreground" />
		</MenubarPrimitive.SubTrigger>
	);
}

function MenubarSubContent({
	className,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
	return (
		<MenubarPrimitive.SubContent
			data-slot="menubar-sub-content"
			className={cn(
				"z-50 min-w-[10rem] overflow-hidden border border-border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarItem,
	MenubarSeparator,
	MenubarLabel,
	MenubarCheckboxItem,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarPortal,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarGroup,
	MenubarSub,
	MenubarShortcut,
};
