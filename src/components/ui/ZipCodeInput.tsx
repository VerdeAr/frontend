import { Loader2, MapPin } from "lucide-react";
import * as React from "react";
import { FormField } from "@/components/ui/form-input";
import { Input } from "@/components/ui/input";
import { maskCep, unmask } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { cepService, type ViaCepAddress } from "@/services";

export interface ZipCodeInputProps
	extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
	label?: string;
	error?: string;
	required?: boolean;
	helperText?: string;
	containerClassName?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onAddressFound?: (address: ViaCepAddress) => void;
	onLoadingChange?: (isLoading: boolean) => void;
	onErrorChange?: (error: string | null) => void;
}

export const ZipCodeInput = React.forwardRef<
	HTMLInputElement,
	ZipCodeInputProps
>(
	(
		{
			id,
			label = "CEP",
			error,
			required,
			helperText,
			containerClassName,
			className,
			value = "",
			onChange,
			onAddressFound,
			onLoadingChange,
			onErrorChange,
			disabled,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId();
		const inputId = id || props.name || generatedId;

		const [internalValue, setInternalValue] = React.useState(
			typeof value === "string" ? maskCep(value) : "",
		);
		const [isSearching, setIsSearching] = React.useState(false);
		const [searchError, setSearchError] = React.useState<string | null>(null);
		const lastSearchedCepRef = React.useRef<string>("");

		// Sincroniza valor recebido externamente (ex.: react-hook-form ou reset)
		React.useEffect(() => {
			if (typeof value === "string") {
				const masked = maskCep(value);
				setInternalValue(masked);
				const digits = unmask(masked);
				if (digits.length < 8) {
					lastSearchedCepRef.current = "";
					setSearchError(null);
					onErrorChange?.(null);
				}
			}
		}, [value, onErrorChange]);

		const handleSearch = React.useCallback(
			async (cepDigits: string) => {
				if (cepDigits === lastSearchedCepRef.current) return;
				lastSearchedCepRef.current = cepDigits;

				setIsSearching(true);
				onLoadingChange?.(true);
				setSearchError(null);
				onErrorChange?.(null);

				try {
					const address = await cepService.getAddressByCep(cepDigits);
					if (address) {
						setSearchError(null);
						onErrorChange?.(null);
						onAddressFound?.(address);
					} else {
						const msg = "CEP não encontrado";
						setSearchError(msg);
						onErrorChange?.(msg);
					}
				} catch {
					const msg = "Erro ao consultar CEP";
					setSearchError(msg);
					onErrorChange?.(msg);
				} finally {
					setIsSearching(false);
					onLoadingChange?.(false);
				}
			},
			[onAddressFound, onLoadingChange, onErrorChange],
		);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const masked = maskCep(e.target.value);
			setInternalValue(masked);

			if (onChange) {
				const syntheticEvent = {
					...e,
					target: {
						...e.target,
						value: masked,
						name: e.target.name || props.name || "",
					},
				} as React.ChangeEvent<HTMLInputElement>;
				onChange(syntheticEvent);
			}

			const digits = unmask(masked);
			if (digits.length === 8) {
				handleSearch(digits);
			} else {
				lastSearchedCepRef.current = "";
				if (searchError) {
					setSearchError(null);
					onErrorChange?.(null);
				}
			}
		};

		const displayError = error || searchError || undefined;

		return (
			<FormField
				id={inputId}
				label={label}
				required={required}
				error={displayError}
				helperText={helperText}
				className={containerClassName}
			>
				<div className="relative flex items-center w-full">
					<Input
						id={inputId}
						ref={ref}
						type="text"
						inputMode="numeric"
						placeholder="00000-000"
						maxLength={9}
						disabled={disabled || isSearching}
						value={internalValue}
						onChange={handleChange}
						className={cn(
							"h-11 text-sm rounded-xl bg-muted/20 hover:bg-muted/40 focus:bg-background pr-10 transition-all",
							displayError &&
								"border-destructive/60 focus-visible:ring-destructive/20",
							className,
						)}
						aria-invalid={!!displayError}
						{...props}
					/>
					<div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground">
						{isSearching ? (
							<Loader2 className="size-4 animate-spin text-primary" />
						) : (
							<MapPin className="size-4 text-muted-foreground/60" />
						)}
					</div>
				</div>
			</FormField>
		);
	},
);

ZipCodeInput.displayName = "ZipCodeInput";
