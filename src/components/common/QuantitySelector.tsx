import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface QuantitySelectorProps {
	/** Valor atual de quantidade. */
	value: number;
	/** Quantidade mínima permitida. Padrão: 1. */
	min?: number;
	/** Quantidade máxima (limite de estoque). */
	max?: number;
	/** Indica se os controles estão desabilitados por carregamento externo. */
	disabled?: boolean;
	/** Rótulo acessível do item controlado (para aria-label). */
	itemLabel?: string;
	/** Delay de debounce em ms antes de chamar onChange. Padrão: 300. */
	debounceMs?: number;
	/** Callback disparado após debounce com o novo valor. */
	onChange: (value: number) => void | Promise<void>;
	className?: string;
}

/**
 * Seletor numérico de quantidade com travas de estoque e debounce.
 * Genérico — pode ser usado em carrinho, catálogo ou qualquer outro contexto.
 */
export function QuantitySelector({
	value,
	min = 1,
	max,
	disabled = false,
	itemLabel = "item",
	debounceMs = 300,
	onChange,
	className,
}: QuantitySelectorProps) {
	const [localValue, setLocalValue] = useState(value);
	const [isLocalLoading, setIsLocalLoading] = useState(false);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latestOnChange = useRef(onChange);

	// Mantém a referência do onChange atualizada sem re-disparar efeitos
	useEffect(() => {
		latestOnChange.current = onChange;
	}, [onChange]);

	// Sincroniza o valor local quando o prop externo muda
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	const isAtMin = localValue <= min;
	const isAtMax = max !== undefined && localValue >= max;
	const isDisabled = disabled || isLocalLoading;

	const commitChange = useCallback(
		(nextValue: number) => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}

			debounceTimer.current = setTimeout(async () => {
				try {
					setIsLocalLoading(true);
					await latestOnChange.current(nextValue);
				} finally {
					setIsLocalLoading(false);
				}
			}, debounceMs);
		},
		[debounceMs],
	);

	const handleDecrement = () => {
		if (isAtMin || isDisabled) return;
		const next = localValue - 1;
		setLocalValue(next);
		commitChange(next);
	};

	const handleIncrement = () => {
		if (isAtMax || isDisabled) return;
		const next = localValue + 1;
		setLocalValue(next);
		commitChange(next);
	};

	// Limpa o timer ao desmontar
	useEffect(() => {
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, []);

	return (
		<div
			className={cn(
				"flex items-center rounded-xl border border-input bg-background shadow-2xs",
				className,
			)}
		>
			<button
				type="button"
				onClick={handleDecrement}
				disabled={isAtMin || isDisabled}
				className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				aria-label={`Diminuir quantidade de ${itemLabel}`}
			>
				<Minus className="size-4" />
			</button>

			<span className="min-w-9 text-center font-semibold text-sm sm:text-base select-none text-foreground">
				{localValue}
			</span>

			<button
				type="button"
				onClick={handleIncrement}
				disabled={isAtMax || isDisabled}
				className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				aria-label={`Aumentar quantidade de ${itemLabel}`}
			>
				<Plus className="size-4" />
			</button>
		</div>
	);
}
