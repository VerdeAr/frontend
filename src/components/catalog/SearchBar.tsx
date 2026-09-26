import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onSearch?: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
	className?: string;
	disabled?: boolean;
}

export function SearchBar({
	value: controlledValue,
	defaultValue = "",
	onChange,
	onSearch,
	placeholder = "Buscar produtos frescos, produtores...",
	debounceMs = 350,
	className,
	disabled = false,
}: SearchBarProps) {
	const [term, setTerm] = useState(controlledValue ?? defaultValue);
	const isControlled = controlledValue !== undefined;
	const isInitialMount = useRef(true);

	// Sincroniza com prop externa se for componente controlado
	useEffect(() => {
		if (isControlled) {
			setTerm(controlledValue);
		}
	}, [controlledValue, isControlled]);

	// Debounce para emitir as buscas sem sobrecarregar chamadas de API
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		const handler = setTimeout(() => {
			onChange?.(term);
			onSearch?.(term);
		}, debounceMs);

		return () => {
			clearTimeout(handler);
		};
	}, [term, debounceMs, onChange, onSearch]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setTerm(val);
		if (isControlled) {
			onChange?.(val);
		}
	};

	const handleClear = () => {
		setTerm("");
		onChange?.("");
		onSearch?.("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			onChange?.(term);
			onSearch?.(term);
		}
	};

	const displayValue = isControlled ? controlledValue : term;

	return (
		<div
			className={cn(
				"relative flex items-center w-full rounded-2xl border border-border/70 bg-card/90 shadow-xs backdrop-blur-xs transition-all duration-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 hover:border-border",
				disabled && "opacity-60 pointer-events-none",
				className,
			)}
		>
			<div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
				<Search className="size-4.5 text-emerald-600 dark:text-emerald-400" />
			</div>

			<input
				type="text"
				value={displayValue}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				aria-label={placeholder}
				className="h-11 w-full bg-transparent pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
			/>

			{Boolean(displayValue) && (
				<button
					type="button"
					onClick={handleClear}
					aria-label="Limpar busca"
					className="absolute right-2.5 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
				>
					<X className="size-4" />
				</button>
			)}
		</div>
	);
}
