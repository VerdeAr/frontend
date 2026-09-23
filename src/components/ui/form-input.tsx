import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
	id?: string;
	label?: string;
	required?: boolean;
	error?: string;
	helperText?: string;
	className?: string;
	children: React.ReactNode;
}

export function FormField({
	id,
	label,
	required,
	error,
	helperText,
	className,
	children,
}: FormFieldProps) {
	return (
		<div className={cn("flex flex-col gap-1.5 w-full", className)}>
			{label && (
				<Label
					htmlFor={id}
					className="text-sm font-medium text-foreground/90 flex items-center gap-1 select-none"
				>
					<span>{label}</span>
					{required && (
						<span
							className="text-emerald-600 dark:text-emerald-400 font-bold text-xs"
							aria-hidden="true"
						>
							*
						</span>
					)}
				</Label>
			)}
			{children}
			{error ? (
				<span
					role="alert"
					className="text-xs font-medium text-destructive transition-all"
				>
					{error}
				</span>
			) : helperText ? (
				<span className="text-xs text-muted-foreground">{helperText}</span>
			) : null}
		</div>
	);
}

export interface FormInputProps
	extends Omit<React.ComponentProps<"input">, "ref"> {
	label?: string;
	error?: string;
	required?: boolean;
	helperText?: string;
	leftIcon?: React.ComponentType<{ className?: string }>;
	rightElement?: React.ReactNode;
	containerClassName?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
	(
		{
			id,
			label,
			error,
			required,
			helperText,
			leftIcon: LeftIcon,
			rightElement,
			containerClassName,
			className,
			type,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId();
		const inputId = id || props.name || generatedId;

		return (
			<FormField
				id={inputId}
				label={label}
				required={required}
				error={error}
				helperText={helperText}
				className={containerClassName}
			>
				<div className="relative flex items-center w-full">
					{LeftIcon && (
						<div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
							<LeftIcon className="size-4" />
						</div>
					)}
					<Input
						id={inputId}
						ref={ref}
						type={type}
						className={cn(
							"h-11 text-sm rounded-xl bg-muted/20 hover:bg-muted/40 focus:bg-background transition-all",
							LeftIcon && "pl-10",
							rightElement && "pr-11",
							error &&
								"border-destructive/60 focus-visible:ring-destructive/20",
							className,
						)}
						aria-invalid={!!error}
						{...props}
					/>
					{rightElement && (
						<div className="absolute right-0 flex items-center h-full">
							{rightElement}
						</div>
					)}
				</div>
			</FormField>
		);
	},
);
FormInput.displayName = "FormInput";

export interface FormSelectProps
	extends Omit<React.ComponentProps<"select">, "ref"> {
	label?: string;
	error?: string;
	required?: boolean;
	helperText?: string;
	containerClassName?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
	(
		{
			id,
			label,
			error,
			required,
			helperText,
			containerClassName,
			className,
			children,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId();
		const selectId = id || props.name || generatedId;

		return (
			<FormField
				id={selectId}
				label={label}
				required={required}
				error={error}
				helperText={helperText}
				className={containerClassName}
			>
				<select
					id={selectId}
					ref={ref}
					className={cn(
						"h-11 w-full rounded-xl border border-input bg-muted/20 hover:bg-muted/40 focus:bg-background px-3 text-sm transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/20",
						error && "border-destructive/60 focus-visible:ring-destructive/20",
						className,
					)}
					aria-invalid={!!error}
					{...props}
				>
					{children}
				</select>
			</FormField>
		);
	},
);
FormSelect.displayName = "FormSelect";

export interface FormTextareaProps
	extends Omit<React.ComponentProps<"textarea">, "ref"> {
	label?: string;
	error?: string;
	required?: boolean;
	helperText?: string;
	containerClassName?: string;
}

export const FormTextarea = React.forwardRef<
	HTMLTextAreaElement,
	FormTextareaProps
>(
	(
		{
			id,
			label,
			error,
			required,
			helperText,
			containerClassName,
			className,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId();
		const textareaId = id || props.name || generatedId;

		return (
			<FormField
				id={textareaId}
				label={label}
				required={required}
				error={error}
				helperText={helperText}
				className={containerClassName}
			>
				<textarea
					id={textareaId}
					ref={ref}
					className={cn(
						"w-full rounded-xl border border-input bg-muted/20 hover:bg-muted/40 focus:bg-background p-3 text-sm transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
						error && "border-destructive/60 focus-visible:ring-destructive/20",
						className,
					)}
					aria-invalid={!!error}
					{...props}
				/>
			</FormField>
		);
	},
);
FormTextarea.displayName = "FormTextarea";
