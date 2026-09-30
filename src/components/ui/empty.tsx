import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

function Empty({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty"
			className={cn(
				"flex w-full flex-col items-center justify-center text-center",
				className,
			)}
			{...props}
		/>
	);
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-header"
			className={cn("flex max-w-md flex-col items-center gap-1.5", className)}
			{...props}
		/>
	);
}

const emptyMediaVariants = cva("flex items-center justify-center mb-3", {
	variants: {
		variant: {
			default:
				"size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 [&_svg]:size-8",
			icon: "size-12 rounded-xl bg-muted text-muted-foreground [&_svg]:size-6",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

function EmptyMedia({
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
	return (
		<div
			data-slot="empty-media"
			className={cn(emptyMediaVariants({ variant, className }))}
			{...props}
		/>
	);
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"h3">) {
	return (
		<h3
			data-slot="empty-title"
			className={cn(
				"font-heading text-base sm:text-lg font-semibold text-foreground tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="empty-description"
			className={cn(
				"text-xs sm:text-sm text-muted-foreground max-w-md",
				className,
			)}
			{...props}
		/>
	);
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-content"
			className={cn(
				"flex flex-col sm:flex-row items-center gap-3 mt-4",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
};
